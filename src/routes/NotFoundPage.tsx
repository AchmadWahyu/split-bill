import { useNavigate } from 'react-router';
import { PageShell } from '@/components/layout/PageShell';
import { RouteMessage } from '@/components/layout/RouteMessage';
import { PRIMARY_CTA_CLASS } from '@/components/layout/primaryCtaClasses';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <RouteMessage
        code="404"
        title="Ups, tagihan nggak ditemukan."
        description="Mungkin link-nya salah, atau datanya cuma ada di perangkat lain."
        action={
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`mt-4 ${PRIMARY_CTA_CLASS}`}
          >
            Balik ke Home
          </button>
        }
      />
    </PageShell>
  );
};

export default NotFoundPage;
