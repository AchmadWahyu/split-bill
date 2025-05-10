import { memo } from 'react';
import { Button } from './ui/button';
import clsx from 'clsx';

const BottomNav = ({
  primaryButtonText,
  secondaryButtonText,
  onClickPrimaryButton,
  onClickSecondaryButton,
  fixedPosition = false,
  containerClassName,
}: {
  primaryButtonText: string;
  secondaryButtonText: string;
  onClickPrimaryButton?: () => void;
  onClickSecondaryButton?: () => void;
  fixedPosition?: boolean;
  containerClassName?: string;
}) => (
  <div
    className={clsx(
      'w-full flex flex-row justify-between gap-2 max-w-lg',
      fixedPosition && 'fixed bottom-4 -mx-8 px-8 py-4',
      containerClassName
    )}
  >
    <Button
      onClick={onClickSecondaryButton}
      type="button"
      variant="outline"
      className="border-slate-200 text-slate-900 hover:bg-slate-100 h-12 w-1/2 whitespace-normal"
    >
      {secondaryButtonText}
    </Button>
    <Button
      onClick={onClickPrimaryButton}
      type="submit"
      className="bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white h-12 w-1/2 whitespace-normal"
    >
      {primaryButtonText}
    </Button>
  </div>
);

const MemoizedBottomNav = memo(BottomNav);
export { MemoizedBottomNav as BottomNav };
