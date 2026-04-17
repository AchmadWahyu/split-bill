const PAGE_BG = '#f6f8f6';

export function TicketNotch() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="border-t-2 border-dashed border-slate-200" />
      <div
        className="absolute left-[-9px] top-1/2 -translate-y-1/2 size-[18px] rounded-full"
        style={{ backgroundColor: PAGE_BG }}
      />
      <div
        className="absolute right-[-9px] top-1/2 -translate-y-1/2 size-[18px] rounded-full"
        style={{ backgroundColor: PAGE_BG }}
      />
    </div>
  );
}
