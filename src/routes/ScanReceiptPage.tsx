'use client';

import { useRef, useState } from 'react';
import { GoogleGenAI, type ContentListUnion } from '@google/genai';
import { useNavigate, useParams } from 'react-router';
import type { EventType } from '@/types';
import { useCameraStream } from './scan-receipt/useCameraStream';
import { ScanOverlay } from './scan-receipt/ScanOverlay';
import { ConfirmView } from './scan-receipt/ConfirmView';
import { LoadingView } from './scan-receipt/LoadingView';
import { ErrorView } from './scan-receipt/ErrorView';
import { toast } from 'sonner';

type ScanState = 'scan' | 'confirm' | 'loading' | 'error';

const ai = new GoogleGenAI({
 apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

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

type ScanReceiptPageProps = {
 handleUpdateEventById: (data: EventType) => void;
};

export default function ScanReceiptPage({ handleUpdateEventById }: ScanReceiptPageProps) {
 const navigate = useNavigate();
 const { eventId } = useParams();

 const { videoRef, stream, dimensions } = useCameraStream();
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const imgPreviewRef = useRef<HTMLImageElement>(null);

 const [state, setState] = useState<ScanState>('scan');
 const [flashOn, setFlashOn] = useState(false);
 const [capturedImage, setCapturedImage] = useState<string | null>(null);

 const toggleFlash = async (turnOn: boolean) => {
  if (!stream || stream.getVideoTracks().length === 0) return;
  const videoTrack = stream.getVideoTracks()[0];
  try {
   await videoTrack.applyConstraints({
    advanced: [{ torch: turnOn } as MediaTrackConstraintSet],
   });
   setFlashOn(turnOn);
  } catch (error) {
   toast.error('Torch not supported', {
    description: 'Flash is not supported on this device.',
   });
   console.error('Torch not supported on this device:', error);
  }
 };

 const handleCapture = () => {
  const context = canvasRef.current?.getContext('2d');
  if (videoRef.current?.srcObject) {
   context?.drawImage(
    videoRef.current,
    0,
    0,
    dimensions.width,
    dimensions.height,
   );
  }
  const data = canvasRef.current?.toDataURL('image/jpeg');
  if (!data) return;
  setCapturedImage(data);
  if (flashOn) toggleFlash(false);
  setState('confirm');
 };

 const handleGalleryPick = (imageDataUrl: string) => {
  setCapturedImage(imageDataUrl);
  setState('confirm');
 };

 const handleSubmitImageString = async (capturedImage: string) => {
  setState('loading');

  const buffer = capturedImage.split(',')[1];

  const contents: ContentListUnion = [
   {
    inlineData: {
     mimeType: 'image/jpeg',
     data: buffer,
    },
   },
   {
    text: 'Extract the receipt data from this image.',
   },
  ];

  const response = await ai.models.generateContent({
   model: 'gemini-3.1-flash-lite-preview',
   contents,
   config: {
    systemInstruction: RECEIPT_SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    responseJsonSchema: RECEIPT_RESPONSE_SCHEMA,
   },
  });

  const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
   setState('error');
   return;
  }
  
  // before 1838
  // after using systemInstruction: 1689
  // after using responseJsonSchema & responseMimeType: 1533
  console.log("AAA total tokens: ", response.usageMetadata?.totalTokenCount);

  try {
   const parsed = JSON.parse(textResponse) as Omit<EventType, 'id'>;
   const eventData: EventType = {
    ...parsed,
    id: eventId ?? crypto.randomUUID(),
   };
   handleUpdateEventById(eventData);
   navigate(`/acara/${eventData.id}/edit`);
  } catch (error) {
   console.error('[ERROR] Failed to parse JSON GenAI response:', error);
   setState('error');
  }
 };

 return (
  <div className="relative h-dvh w-full overflow-hidden bg-slate-900">
   {/* Camera — always mounted, never unmounted */}
   <video
    ref={videoRef}
    className="absolute inset-0 h-full w-full object-cover"
   />
   <canvas
    ref={canvasRef}
    width={dimensions.width}
    height={dimensions.height}
    className="hidden"
   />

   {state === 'scan' && (
    <ScanOverlay
     flashOn={flashOn}
     onCapture={handleCapture}
     onFlash={toggleFlash}
     onBack={() => navigate(-1)}
     onGallery={handleGalleryPick}
    />
   )}

   {state === 'confirm' && capturedImage && (
    <ConfirmView
     imageUrl={capturedImage}
     imgPreviewRef={imgPreviewRef}
     onConfirm={() => handleSubmitImageString(capturedImage)}
     onRetry={() => setState('scan')}
     onBack={() => setState('scan')}
    />
   )}

   {state === 'loading' && <LoadingView onBack={() => navigate(-1)} />}

   {state === 'error' && (
    <ErrorView
     onRetry={() => setState('scan')}
     onManualInput={() => navigate(`/acara/${eventId}/edit`)}
     onBack={() => navigate(-1)}
    />
   )}
  </div>
 );
}
