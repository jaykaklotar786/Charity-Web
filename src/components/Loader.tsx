// components/Loader.tsx
'use client';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function Loader({
  size = 'sm',
  color = '#7CB518',
}: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200`}
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
}
