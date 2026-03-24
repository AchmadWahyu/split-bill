import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const PAGE_BG = 'bg-[#f6f8f6]';

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Centered column with max width (default: true for error / marketing-style pages) */
  centered?: boolean;
};

/**
 * Shared shell for full-viewport routes: consistent background and optional centered column.
 */
export function PageShell({
  children,
  className,
  centered = true,
}: PageShellProps) {
  return (
    <main
      className={cn(
        PAGE_BG,
        'min-h-dvh flex flex-col',
        centered && 'max-w-lg mx-auto',
        className,
      )}
    >
      {children}
    </main>
  );
}
