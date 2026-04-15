'use client';

import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { EventType } from '@/types';
import { useCameraStream } from './scan-receipt/useCameraStream';
import { ScanOverlay } from './scan-receipt/ScanOverlay';
import { ConfirmView } from './scan-receipt/ConfirmView';
import { LoadingView } from './scan-receipt/LoadingView';
import { ErrorView } from './scan-receipt/ErrorView';
import { toast } from 'sonner';

type ScanState = 'scan' | 'confirm' | 'loading' | 'error';

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

  const image = capturedImage.split(',')[1];

  try {
   const response = await fetch('/api/scan-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image }),
   });

   if (!response.ok) {
    setState('error');
    return;
   }

   // before 1838
   // after using systemInstruction: 1689
   // after using responseJsonSchema & responseMimeType: 1533
   const parsed = await response.json() as Omit<EventType, 'id'>;
   const eventData: EventType = {
    ...parsed,
    id: eventId ?? crypto.randomUUID(),
   };
   handleUpdateEventById(eventData);
   navigate(`/acara/${eventData.id}/edit`);
  } catch (error) {
   console.error('[ERROR] Failed to call scan-receipt API:', error);
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
