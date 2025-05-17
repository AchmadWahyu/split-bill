import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="p-8">
      <div className="h-dvh flex flex-col items-center justify-center text-center">
        <p className="text-6xl font-bold">404</p>
        <h1 className="mt-4 text-xl">Ups, tagihan nggak ditemukan.</h1>
        <p className="mt-2 text-slate-600">
          Mungkin link-nya salah, atau datanya cuma ada di perangkat lain.
        </p>
        <Button
          onClick={() => navigate('/')}
          type="button"
          className="bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white h-12 whitespace-normal mt-6"
        >
          Balik ke Home
        </Button>
      </div>
    </main>
  );
};

export default NotFoundPage;
