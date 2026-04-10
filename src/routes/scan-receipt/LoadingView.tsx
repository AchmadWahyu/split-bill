import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

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

export function LoadingView({ onBack }: { onBack: () => void }) {
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
            AI kami sedang mengambil semua info penting dari struk. Tunggu sebentar ya!
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
