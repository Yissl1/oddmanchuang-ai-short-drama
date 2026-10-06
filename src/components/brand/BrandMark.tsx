import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: number;
  alt?: string;
}

export function BrandMark({
  className,
  size = 40,
  alt = 'Odd漫创 Logo',
}: BrandMarkProps) {
  return (
    <img
      src="/brand/oddmanchuang-mark.png"
      alt={alt}
      width={size}
      height={size}
      className={cn('select-none object-contain', className)}
      draggable={false}
    />
  );
}
