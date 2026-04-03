'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Camera from 'lucide-react/dist/esm/icons/camera';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Image from 'lucide-react/dist/esm/icons/image';
import X from 'lucide-react/dist/esm/icons/x';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ScanState = 'scan' | 'confirm' | 'loading' | 'error';
const IMG_WIDTH = 360;

function useCameraStream() {
 const videoRef = useRef<HTMLVideoElement>(null);
 const [stream, setStream] = useState<MediaStream | null>(null);
 const [dimensions, setDimensions] = useState({ width: IMG_WIDTH, height: 0 });

 useEffect(() => {
  let localStream: MediaStream | null = null;
  const videoElement = videoRef.current;

  async function start() {
   if (!navigator.mediaDevices?.getUserMedia) {
    toast.error('Camera not supported', {
     description:
      'navigator.mediaDevices.getUserMedia() is not supported on this device or browser.',
    });
    return;
   }

   localStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
   });

   if (!videoElement) return;

   videoElement.srcObject = localStream;

   try {
    await videoElement.play();
    setStream(localStream);

    const h = videoElement.videoHeight / (videoElement.videoWidth / IMG_WIDTH);
    setDimensions({ width: IMG_WIDTH, height: h });
   } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    console.error('Error playing video:', error);
   }
  }

  start();

  return () => {
   localStream?.getTracks().forEach((t) => t.stop());
   if (videoElement) videoElement.srcObject = null;
  };
 }, []);

 return { videoRef, stream, dimensions };
}

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

function ScanOverlay({
 flashOn,
 onCapture,
 onFlash,
 onBack,
}: {
 flashOn: boolean;
 onCapture: () => void;
 onFlash: (turnOn: boolean) => void;
 onBack: () => void;
}) {
 return (
  <div className="absolute inset-0 z-10 flex flex-col">
   <header className="flex items-center p-4 z-20 bg-[#f6f8f6]">
    <button
     type="button"
     onClick={onBack}
     className="size-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
    >
     <ArrowLeft className="size-5 text-slate-900" />
    </button>
    <h1 className="text-lg font-bold text-slate-900 tracking-tight flex-1 text-center pr-10">
     Scan Struk
    </h1>
   </header>

   <div className="relative flex-1">
    {/* Framing corners */}
    <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
     <div className="relative w-full aspect-[3/4] max-w-sm">
      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#13ec5b] rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#13ec5b] rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#13ec5b] rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#13ec5b] rounded-br-xl" />
      <div className="absolute left-0 w-full h-0.5 bg-[#13ec5b]/40 shadow-[0_0_15px_rgba(19,236,91,0.8)] animate-[scan-line_2.5s_ease-in-out_infinite]" />
     </div>
    </div>

    {/* Instruction */}
    <div className="absolute top-10 left-0 w-full text-center z-10 px-6">
     <p className="bg-black/40 backdrop-blur-md text-white py-2 px-4 rounded-full inline-block text-sm font-medium">
      Posisikan struk dalam bingkai
     </p>
    </div>
   </div>

   <footer className="bg-[#f6f8f6] p-8 pb-10 z-20">
    <div className="flex items-center justify-between max-w-xs mx-auto">
     {/* Gallery */}
     <button
      type="button"
      className="flex shrink-0 items-center justify-center rounded-full size-12 bg-slate-200 text-slate-900 border border-slate-300 cursor-pointer hover:bg-slate-300 transition-colors"
     >
      <Image className="size-5" />
     </button>

     {/* Shutter */}
     <div className="relative flex items-center justify-center size-24">
      <button
       type="button"
       onClick={onCapture}
       className="flex shrink-0 items-center justify-center rounded-full size-20 bg-[#13ec5b] text-slate-900 shadow-lg shadow-[#13ec5b]/20 hover:scale-95 active:scale-90 transition-transform cursor-pointer"
      >
       <Camera className="size-8" />
      </button>
      <div className="absolute inset-0 rounded-full border-4 border-[#13ec5b]/30 scale-110 pointer-events-none" />
     </div>

     {/* Flash */}
     <button
      type="button"
      onClick={() => onFlash(!flashOn)}
      className={cn(
       'flex shrink-0 items-center justify-center rounded-full size-12 border cursor-pointer transition-colors',
       flashOn
        ? 'bg-[#13ec5b]/20 border-[#13ec5b] text-green-600'
        : 'bg-slate-200 border-slate-300 text-slate-900 hover:bg-slate-300',
      )}
     >
      <Zap className="size-5" />
     </button>
    </div>
   </footer>
  </div>
 );
}

function ConfirmView({
 imageUrl,
 onConfirm,
 onRetry,
 onBack,
 imgPreviewRef,
}: {
 imageUrl: string;
 onConfirm: () => void;
 onRetry: () => void;
 onBack: () => void;
 imgPreviewRef: React.RefObject<HTMLImageElement | null>;
}) {
 return (
  <div className="absolute inset-0 z-20 flex flex-col bg-[#f6f8f6]">
   <header className="flex items-center p-4 bg-[#f6f8f6]">
    <button
     type="button"
     onClick={onBack}
     className="size-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
    >
     <ArrowLeft className="size-5 text-slate-900" />
    </button>
    <h1 className="text-lg font-bold text-slate-900 tracking-tight flex-1 text-center pr-10">
     Konfirmasi Foto
    </h1>
   </header>

   <div className="flex-1 overflow-y-auto px-6 pb-10">
    <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
     Pastikan semua item dan harga terlihat jelas.
    </p>

    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg bg-slate-200">
     <img
      ref={imgPreviewRef}
      src={imageUrl}
      alt="Foto struk"
      className="w-full h-full object-cover"
     />
     <div className="absolute inset-0 pointer-events-none border-[12px] border-white/20" />
     <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-[#13ec5b] animate-pulse" />
      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
       Preview Mode
      </span>
     </div>
    </div>

    <div className="mt-8 flex flex-col gap-4">
     <button
      type="button"
      onClick={onConfirm}
      className="w-full h-16 rounded-full bg-[#13ec5b] text-slate-900 font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#13ec5b]/20 hover:bg-[#13ec5b]/90 active:scale-95 transition-all cursor-pointer"
     >
      <CheckCircle className="size-6" />
      Pakai Foto Ini
     </button>
     <button
      type="button"
      onClick={onRetry}
      className="w-full h-14 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-semibold text-base transition-colors active:scale-95 cursor-pointer"
     >
      Foto Ulang
     </button>
    </div>
   </div>
  </div>
 );
}

function LoadingView({ onBack }: { onBack: () => void }) {
 return (
  <div className="absolute inset-0 z-20 flex flex-col bg-white overflow-hidden">
   <header className="flex items-center p-4 pb-2 justify-between border-b border-slate-100">
    <button
     type="button"
     onClick={onBack}
     className="size-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
    >
     <ArrowLeft className="size-5 text-slate-900" />
    </button>
    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex-1 text-center pr-10">
     Scan Struk
    </h2>
   </header>

   <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
    <div className="relative mb-10">
     <div className="relative z-10 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
      <ReceiptIcon className="size-[72px] text-slate-300" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#13ec5b] shadow-[0_0_20px_4px_rgba(19,236,91,1)] z-20" />
     </div>

     <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-[#13ec5b] rounded-full w-[72%]" />
     </div>

     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#13ec5b]/5 rounded-full blur-2xl" />
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#13ec5b]/10 rounded-full" />
    </div>

    <div className="space-y-3 max-w-[280px]">
     <h3 className="text-2xl font-black text-slate-900 tracking-tight">
      Sedang membaca struk kamu!
     </h3>
     <p className="text-slate-500 text-sm font-medium leading-relaxed">
      AI kami sedang mengambil semua info penting dari struk. Tunggu sebentar
      ya!
     </p>
    </div>
   </div>

   <div className="px-6 pb-8 relative">
    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner">
     <div className="absolute inset-0 bg-slate-200" />
     <div
      className="absolute inset-0 opacity-40"
      style={{
       backgroundImage:
        'linear-gradient(to right, rgba(19,236,91,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(19,236,91,0.1) 1px, transparent 1px)',
       backgroundSize: '20px 20px',
      }}
     />
     <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
      <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
       <span className="size-1.5 bg-[#13ec5b] rounded-full animate-pulse" />
       Mengekstrak Data
      </span>
     </div>
    </div>
   </div>
  </div>
 );
}

function ErrorView({
 onRetry,
 onManualInput,
 onBack,
}: {
 onRetry: () => void;
 onManualInput: () => void;
 onBack: () => void;
}) {
 return (
  <div className="absolute inset-0 z-20 flex flex-col bg-[#f6f8f6] overflow-y-auto">
   <header className="flex items-center p-4">
    <button
     type="button"
     onClick={onBack}
     className="size-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
    >
     <ArrowLeft className="size-5 text-slate-900" />
    </button>
   </header>

   <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
    <div className="relative w-full max-w-[280px] aspect-[3/4] mb-8">
     <div className="absolute inset-0 bg-slate-900/40 rounded-xl z-10 flex items-center justify-center backdrop-blur-[2px]">
      <div className="bg-white/90 p-4 rounded-full shadow-lg">
       <X className="size-12 text-red-500" strokeWidth={3} />
      </div>
     </div>
     <div className="w-full h-full rounded-xl bg-slate-200 border-2 border-slate-200 shadow-sm" />
    </div>

    <div className="text-center space-y-3 mb-10 max-w-sm">
     <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
      Struk gagal dibaca
     </h1>
     <p className="text-slate-500 text-base leading-relaxed">
      Coba pastikan struk terlihat jelas, pencahayaan cukup, dan tidak
      terpotong.
     </p>
    </div>

    <div className="w-full max-w-sm space-y-4">
     <button
      type="button"
      onClick={onRetry}
      className="w-full bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-slate-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] cursor-pointer"
     >
      <Camera className="size-5" />
      Coba Lagi
     </button>
     <button
      type="button"
      onClick={onManualInput}
      className="w-full flex items-center justify-center gap-2 py-3 text-slate-600 font-medium hover:text-green-600 transition-colors cursor-pointer"
     >
      Input Manual
      <ArrowRight className="size-4" />
     </button>
    </div>
   </div>
  </div>
 );
}

function ReceiptIcon({ className }: { className?: string }) {
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth={1.5}
   strokeLinecap="round"
   strokeLinejoin="round"
   className={className}
  >
   <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
   <path d="M8 7h8" />
   <path d="M8 11h8" />
   <path d="M8 15h4" />
  </svg>
 );
}
