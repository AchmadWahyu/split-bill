import * as Sentry from '@sentry/cloudflare';

export const onRequest = [
  Sentry.sentryPagesPlugin((context) => ({
    dsn: 'https://868b22f34ebc3f638749df6cdf5420f3@o4508209070342144.ingest.us.sentry.io/4509342217076736',
    sendDefaultPii: true,
    enableLogs: true,
    tracesSampleRate: 1.0,
  })),
];
