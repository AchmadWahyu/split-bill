import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RouteMessageProps = {
  code?: string;
  title: string;
  description: string;
  action: ReactNode;
  className?: string;
};

/**
 * Shared layout for simple status routes (404, error): headline, body, primary action.
 */
export function RouteMessage({
  code,
  title,
  description,
  action,
  className,
}: RouteMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center flex-1 px-6 text-center gap-4 py-12',
        className,
      )}
    >
      {code ? (
        <p className="text-6xl font-bold text-slate-900">{code}</p>
      ) : null}
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="text-slate-500 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
