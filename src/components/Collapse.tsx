import { memo, ReactNode, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const Collapse = ({
  headerContent,
  collapsedContent,
}: {
  headerContent: ReactNode;
  collapsedContent: ReactNode;
}) => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="cursor-pointer" onClick={() => setShowAll((prev) => !prev)}>
      <div className="flex items-center justify-between">
        <div className="grow-1">{headerContent}</div>

        <ChevronRight
          className={clsx(
            showAll
              ? 'rotate-90 ease-in-out duration-300'
              : 'ease-in-out duration-300',
            'size-4 text-slate-500 ml-1'
          )}
        />
      </div>
      {showAll && <div>{collapsedContent}</div>}
    </div>
  );
};

const MemoizedCollapse = memo(Collapse);
export { MemoizedCollapse as Collapse };
