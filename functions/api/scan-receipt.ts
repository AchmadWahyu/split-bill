import { GoogleGenAI } from '@google/genai';
import * as Sentry from '@sentry/cloudflare';

interface Env {
 GEMINI_API_KEY: string;
}

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
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
 try {
  Sentry.logger.info('Receipt scan started');

  const { image } = await ctx.request.json<{ image: string }>();

  const ai = new GoogleGenAI({ apiKey: ctx.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
   model: 'gemini-3.1-flash-lite-preview',
   contents: [
    { inlineData: { mimeType: 'image/jpeg', data: image } },
    { text: 'Extract the receipt data from this image.' },
   ],
   config: {
    systemInstruction: RECEIPT_SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    responseJsonSchema: RECEIPT_RESPONSE_SCHEMA,
   },
  });

  const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
   Sentry.logger.warn('Gemini returned empty response', {
    model: 'gemini-3.1-flash-lite-preview',
    candidatesCount: response.candidates?.length ?? 0,
   });
   return new Response(JSON.stringify({ error: 'No response from AI' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
   });
  }

  Sentry.logger.info('Receipt scan completed successfully');

  return new Response(textResponse, {
   headers: { 'Content-Type': 'application/json' },
  });
 } catch (error) {
  Sentry.captureException(error);
  Sentry.logger.error('Receipt scan failed', {
   errorMessage: error instanceof Error ? error.message : String(error),
   errorType: error instanceof Error ? error.constructor.name : 'unknown',
  });

  const message = error instanceof Error ? error.message : 'Internal server error';
  return new Response(JSON.stringify({ error: message }), {
   status: 500,
   headers: { 'Content-Type': 'application/json' },
  });
 }
};
