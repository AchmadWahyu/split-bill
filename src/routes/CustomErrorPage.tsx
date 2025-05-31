import { Button } from '@/components/ui/button';

const CustomErrorPage = () => (
  <main className="p-8">
    <div className="h-dvh flex flex-col items-center justify-center text-center">
      <h1 className="mt-4 text-xl">😕 Ada yang salah...</h1>
      <p className="mt-2 text-slate-600">
        Sepertinya aplikasi mengalami kendala saat memuat data tagihan kamu.
      </p>
      <Button
        onClick={() => location.replace('/')}
        type="button"
        className="bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white h-12 whitespace-normal mt-6"
      >
        Balik ke Home
      </Button>
    </div>
  </main>
);
export default CustomErrorPage;
