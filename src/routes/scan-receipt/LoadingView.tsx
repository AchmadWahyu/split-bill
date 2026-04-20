import { useState, useEffect } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

const MESSAGES = [
 'Cari item satu-satu...',
 'Ngitung harga...',
 'Nyocokin total...',
 'Nyusun split bill...',
 'Rapihin hasil...',
 'Struknya lumayan rame 😄',
 'Hampir selesai...',
 'Agak lama dari biasanya 😅',
 'Nanti hasilnya bisa diedit kok',
];

function ReceiptPlaceholder() {
 return (
  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
   <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-16 text-slate-300"
   >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h4" />
   </svg>
  </div>
 );
}

type LoadingViewProps = {
 onBack: () => void;
 imageUrl?: string;
};

export function LoadingView({ onBack, imageUrl }: LoadingViewProps) {
 const [index, setIndex] = useState(0);
 const [pastLongWait, setPastLongWait] = useState(false);

 useEffect(() => {
  const t = setTimeout(() => setPastLongWait(true), 16_000);
  return () => clearTimeout(t);
 }, []);

 useEffect(() => {
  if (pastLongWait) return;
  const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 2000);
  return () => clearInterval(t);
 }, [pastLongWait]);

 return (
  <div className="absolute inset-0 z-20 flex flex-col bg-white overflow-hidden">
   <header className="flex items-center p-4 pb-2 justify-between border-b border-slate-100">
    <button
     type="button"
     aria-label="Kembali ke scan struk"
     onClick={onBack}
     className="size-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
    >
     <ArrowLeft className="size-5 text-slate-900" />
    </button>
    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex-1 text-center pr-10">
     Scan Struk
    </h2>
   </header>

   {/* Hero image — fills remaining vertical space */}
   <div className="flex-1 px-6 pt-6 pb-4 min-h-0">
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border border-slate-100">
     {imageUrl ? (
      <img
       src={imageUrl}
       alt="Struk yang sedang diproses"
       className="w-full h-full object-cover grayscale"
      />
     ) : (
      <ReceiptPlaceholder />
     )}

     {/* Scanning line */}
     <div className="absolute inset-x-0 top-0 h-full">
      <div className="absolute left-0 w-full h-0.5 bg-[#13ec5b]/60 shadow-[0_0_15px_rgba(19,236,91,0.8)] animate-[scan-line_4s_ease-in-out_infinite]" />
     </div>
    </div>
   </div>

   {/* Text below image */}
   <div className="px-6 pb-10 pt-2 text-center space-y-2">
    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
     Lagi baca struk kamu 👀
    </h3>

    {pastLongWait ? (
     <div className="flex min-h-6 items-center justify-center gap-2 max-w-10/12 mx-auto">
      <RefreshCw
       className="size-4 shrink-0 animate-[spin_2s_ease-in-out_infinite] text-green-600"
       aria-hidden
      />
      <p
       className="text-sm font-semibold text-green-600"
       style={{
        animation: 'message-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
       }}
      >
       Server sedang ramai, kami sedang mencoba cara lain...
      </p>
     </div>
    ) : (
     <div className="h-6 flex items-center justify-center space-between gap-2 overflow-hidden">
      <LoaderCircle
       className="size-4 shrink-0 animate-spin text-green-600"
       aria-hidden
      />
      <p
       key={index}
       className="text-sm font-semibold text-green-600"
       style={{
        animation: 'message-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
       }}
      >
       {MESSAGES[index]}
      </p>
     </div>
    )}
   </div>
  </div>
 );
}
