import { useRef } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Camera from 'lucide-react/dist/esm/icons/camera';
import Image from 'lucide-react/dist/esm/icons/image';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { cn } from '@/lib/utils';

export function ScanOverlay({
  flashOn,
  onCapture,
  onFlash,
  onBack,
  onGallery,
}: {
  flashOn: boolean;
  onCapture: () => void;
  onFlash: (turnOn: boolean) => void;
  onBack: () => void;
  onGallery: (imageDataUrl: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    
    // register what to do when reading is done
    reader.onload = () => {
      if (typeof reader.result === 'string') onGallery(reader.result);
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col">
      <header className="flex items-center p-4 z-20 bg-[#f6f8f6]">
        <button
          type="button"
          aria-label="Kembali ke home"
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {/* Gallery */}
          <button
            type="button"
            aria-label="Pilih foto dari galeri"
            onClick={() => fileInputRef.current?.click()}
            className="flex shrink-0 items-center justify-center rounded-full size-12 bg-slate-200 text-slate-900 border border-slate-300 cursor-pointer hover:bg-slate-300 transition-colors"
          >
            <Image className="size-5" />
          </button>

          {/* Shutter */}
          <div className="relative flex items-center justify-center size-24">
            <button
              type="button"
              aria-label="Ambil foto"
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
            aria-label="Nyalakan/matikan flash"
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
