import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-red-100', text: 'text-red-700' },
];

export function getPersonColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

type PersonAvatarProps = {
  name: string;
  colorIndex: number;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  faded?: boolean;
  onClick?: () => void;
  className?: string;
};

export function PersonAvatar({
  name,
  colorIndex,
  size = 'md',
  selected = false,
  faded = false,
  onClick,
  className,
}: PersonAvatarProps) {
  const color = getPersonColor(colorIndex);
  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'size-8 text-[10px]',
    md: 'size-12 text-sm',
    lg: 'size-14 text-base',
  };

  const classes = cn(
    'rounded-full flex items-center justify-center font-bold border-2 shrink-0 transition-all select-none',
    sizeClasses[size],
    color.bg,
    color.text,
    selected ? 'border-green-600 ring-1 ring-green-600' : 'border-transparent',
    faded && 'opacity-35',
    onClick && 'cursor-pointer',
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {initials}
      </button>
    );
  }

  return <div className={classes}>{initials}</div>;
}
