'use client';

import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useCameraStream } from './scan-receipt/useCameraStream';
import { ScanOverlay } from './scan-receipt/ScanOverlay';
import { ConfirmView } from './scan-receipt/ConfirmView';
import { LoadingView } from './scan-receipt/LoadingView';
import { ErrorView } from './scan-receipt/ErrorView';
import { toast } from 'sonner';

type ScanState = 'scan' | 'confirm' | 'loading' | 'error';

export default function ScanReceiptPage() {
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
      context?.drawImage(videoRef.current, 0, 0, dimensions.width, dimensions.height);
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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-900">
      {/* Camera — always mounted, never unmounted */}
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" />
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="hidden" />

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
          onConfirm={() => setState('loading')}
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
