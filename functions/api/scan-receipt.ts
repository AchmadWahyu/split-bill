import { Mistral } from '@mistralai/mistralai';
import { GoogleGenAI } from '@google/genai';
import * as Sentry from '@sentry/cloudflare';

interface Env {
	MISTRAL_API_KEY: string;
	GEMINI_API_KEY: string;
}

const MISTRAL_OCR_MODEL = 'mistral-ocr-2512';
const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';

const RECEIPT_SYSTEM_INSTRUCTION = `You are a receipt data extraction assistant. Extract all data from the receipt image.
- personList and each item's receiver are always empty arrays.
- If tax, discount, or serviceCharge is absent, set value to "0".`;

const RECEIPT_RESPONSE_SCHEMA = {
	type: 'object',
	properties: {
		title: {
			type: 'string',
			description: 'Restaurant or receipt title',
		},
		personList: {
			type: 'array',
			items: {
				type: 'object',
				properties: { name: { type: 'string' } },
				required: ['name'],
			},
		},
		expense: {
			type: 'object',
			properties: {
				items: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							title: { type: 'string', description: 'Item name' },
							price: {
								type: 'string',
								description:
									'Total price as plain string, no currency symbols or thousand separators (e.g. "30000" not "Rp 30.000"). For multi-quantity items use only the total price.',
							},
							receiver: { type: 'array', items: { type: 'string' } },
						},
						required: ['title', 'price', 'receiver'],
					},
				},
				tax: {
					type: 'object',
					properties: {
						value: { type: 'string', description: 'Amount as plain string, "0" if absent' },
						type: { type: 'string', enum: ['AMOUNT', 'PERCENTAGE'] },
					},
					required: ['value', 'type'],
				},
				discount: {
					type: 'object',
					properties: {
						value: { type: 'string', description: 'Amount as plain string, "0" if absent' },
						type: { type: 'string', enum: ['AMOUNT', 'PERCENTAGE'] },
					},
					required: ['value', 'type'],
				},
				serviceCharge: {
					type: 'object',
					properties: {
						value: { type: 'string', description: 'Amount as plain string, "0" if absent' },
						type: { type: 'string', enum: ['AMOUNT', 'PERCENTAGE'] },
					},
					required: ['value', 'type'],
				},
			},
			required: ['items', 'tax', 'discount', 'serviceCharge'],
		},
	},
	required: ['title', 'personList', 'expense'],
} as const;

function isValidReceiptPayload(parsed: unknown): boolean {
	if (!parsed || typeof parsed !== 'object') return false;
	const o = parsed as Record<string, unknown>;
	return (
		typeof o.title === 'string' &&
		Array.isArray(o.personList) &&
		o.expense !== null &&
		typeof o.expense === 'object'
	);
}

function parseReceiptJsonString(jsonText: string): string | null {
	try {
		const parsed = JSON.parse(jsonText) as unknown;
		if (!isValidReceiptPayload(parsed)) return null;
		return JSON.stringify(parsed);
	} catch {
		return null;
	}
}

const GEMINI_GENERATE_TIMEOUT_MS = 16_000;

type GeminiError = {
	error: {
		code: string;
		message: string;
		status: string;
	}
}

const parseGeminiError = (error: unknown): string => {
	if (error instanceof Error) return (error.message as unknown as GeminiError).error.code;
	if (typeof error === 'string') return error;
	return String(error);
};

async function scanWithGemini(env: Env, imageBase64: string): Promise<string | null> {
	const controller = new AbortController();
	const abortTimer = setTimeout(() => controller.abort(), GEMINI_GENERATE_TIMEOUT_MS);

	const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

	try {
		const response = await ai.models.generateContent({
			model: GEMINI_MODEL,
			contents: [
				{ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
				{ text: 'Extract the receipt data from this image.' },
			],
			config: {
				systemInstruction: RECEIPT_SYSTEM_INSTRUCTION,
				responseMimeType: 'application/json',
				responseJsonSchema: RECEIPT_RESPONSE_SCHEMA,
				abortSignal: controller.signal,
			},
		});

		const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!textResponse) {
			Sentry.logger.warn('Gemini returned empty response', {
				model: GEMINI_MODEL,
				candidatesCount: response.candidates?.length ?? 0,
			});
			return null;
		}
		return parseReceiptJsonString(textResponse);
	} finally {
		clearTimeout(abortTimer);
	}
}

async function scanWithMistralOcr(env: Env, imageBase64: string): Promise<string | null> {
	const client = new Mistral({ apiKey: env.MISTRAL_API_KEY });

	const ocrResponse = await client.ocr.process({
		model: MISTRAL_OCR_MODEL,
		document: {
			type: 'image_url',
			imageUrl: `data:image/jpeg;base64,${imageBase64}`,
		},
		documentAnnotationFormat: {
			type: 'json_schema',
			jsonSchema: {
				name: 'receipt_extraction',
				schemaDefinition: RECEIPT_RESPONSE_SCHEMA as unknown as Record<string, unknown>,
				strict: true,
			},
		},
		documentAnnotationPrompt: RECEIPT_SYSTEM_INSTRUCTION,
	});

	const ann = ocrResponse.documentAnnotation?.trim();
	if (!ann) return null;
	return parseReceiptJsonString(ann);
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
	try {
		Sentry.logger.info('Receipt scan started');

		const { image } = await ctx.request.json<{ image: string }>();

		let result: string | null = null;
		let provider: 'mistral' | 'gemini' | null = null;

		try {
			result = await scanWithGemini(ctx.env, image);
			if (result) provider = 'gemini';
		} catch (geminiError) {
			Sentry.logger.warn('Gemini scan failed, falling back to Mistral OCR, error: ' + parseGeminiError(geminiError));
		}

		if (!result) {
			try {
				result = await scanWithMistralOcr(ctx.env, image);
				if (result) provider = 'mistral';
			} catch (mistralError) {
				Sentry.captureException(mistralError);
				Sentry.logger.error('Mistral OCR fallback failed', {
					errorMessage: mistralError instanceof Error ? mistralError.message : String(mistralError),
				});
			}
		}

		if (!result) {
			return new Response(JSON.stringify({ error: 'No response from AI' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		Sentry.logger.info(`Receipt scan completed successfully, provider: ${provider}`);

		return new Response(result, {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		Sentry.captureException(error);
		Sentry.logger.error('Receipt scan failed', {
			errorMessage: error instanceof Error ? error.message : String(error),
			errorType: error instanceof Error ? error.constructor.name : 'unknown',
		});

		return new Response(JSON.stringify({ error: 'Failed to process receipt' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
