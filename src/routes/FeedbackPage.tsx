import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

const TALLY_EMBED_SRC =
  'https://tally.so/embed/BzbePY?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

export default function FeedbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.Tally?.loadEmbeds();
  }, []);

  return (
    <main className="bg-white min-h-dvh max-w-lg mx-auto flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-100 flex items-center px-4 py-4 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="size-10 rounded-full flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="size-4 text-slate-900" />
        </button>
        <div className="flex-1 pr-10 text-center">
          <h1 className="text-lg font-bold text-slate-900 tracking-[-0.45px]">
            Feedback
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 px-4 pb-8">
        <iframe
          data-tally-src={TALLY_EMBED_SRC}
          loading="lazy"
          width="100%"
          height={561}
          title="Feedback untuk Split Bareng"
          className="w-full min-h-[561px] border-0"
        />
      </div>
    </main>
  );
}
