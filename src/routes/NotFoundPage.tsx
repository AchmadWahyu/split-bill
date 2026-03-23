import { useNavigate } from 'react-router';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-[#f6f8f6] min-h-dvh max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="text-6xl font-bold text-slate-900">404</p>
      <h1 className="text-xl font-semibold text-slate-900">
        Ups, tagihan nggak ditemukan.
      </h1>
      <p className="text-slate-500">
        Mungkin link-nya salah, atau datanya cuma ada di perangkat lain.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-4 py-3 px-8 rounded-xl bg-[#13ec5b] text-base font-bold text-slate-900 cursor-pointer shadow-[0px_10px_15px_-3px_rgba(19,236,91,0.2),0px_4px_6px_-4px_rgba(19,236,91,0.2)] hover:brightness-95 transition-all"
      >
        Balik ke Home
      </button>
    </main>
  );
};

export default NotFoundPage;
