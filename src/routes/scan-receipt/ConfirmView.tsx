import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';

export function ConfirmView({
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
          aria-label="Konfirmasi foto"
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
            className="w-full h-full object-contain"
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
            aria-label="Pakai foto ini"
            onClick={onConfirm}
            className="w-full h-16 rounded-full bg-[#13ec5b] text-slate-900 font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#13ec5b]/20 hover:bg-[#13ec5b]/90 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle className="size-6" />
            Pakai Foto Ini
          </button>
          <button
            type="button"
            aria-label="Foto ulang"
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
