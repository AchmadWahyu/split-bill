import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/PageShell';
import { RouteMessage } from '@/components/layout/RouteMessage';

const CustomErrorPage = () => (
  <PageShell>
    <RouteMessage
      title="😕 Ada yang salah..."
      description="Sepertinya aplikasi mengalami kendala saat memuat data tagihan kamu."
      action={
        <Button
          onClick={() => location.replace('/')}
          type="button"
          className="mt-6 bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white h-12 whitespace-normal"
        >
          Balik ke Home
        </Button>
      }
    />
  </PageShell>
);

export default CustomErrorPage;
