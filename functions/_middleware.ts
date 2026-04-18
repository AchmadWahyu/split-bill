import * as Sentry from '@sentry/cloudflare';

export const onRequest = [
  Sentry.sentryPagesPlugin((context) => ({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: false,
    enableLogs: process.env.NODE_ENV !== 'production',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })),
];
