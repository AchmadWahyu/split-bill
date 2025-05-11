import { memo } from 'react';
import clsx from 'clsx';

const ErrorMessageForm = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => (
  <p role="alert" className={clsx('text-sm text-red-600 mt-2 ml-2', className)}>
    {text}
  </p>
);

const MemoizedErrorMessageForm = memo(ErrorMessageForm);
export { MemoizedErrorMessageForm as ErrorMessageForm };
