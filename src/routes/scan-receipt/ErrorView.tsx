import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Camera from 'lucide-react/dist/esm/icons/camera';
import X from 'lucide-react/dist/esm/icons/x';

export function ErrorView({
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
            Coba pastikan struk terlihat jelas, pencahayaan cukup, dan tidak terpotong.
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
