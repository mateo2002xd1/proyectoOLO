'use client';

import { useMemo } from 'react';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getBackgroundColor(name: string) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  square?: boolean;
  className?: string;
  slot?: 'icon' | 'start' | 'end';
}

export function Avatar({ src, alt, name = '', square = false, className = '' }: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getBackgroundColor(name), [name]);

  const hasSize = /\b(?:size|w|h)-\w+\b/.test(className);
  const sizeClass = hasSize ? '' : 'size-8';

  const baseClasses = `inline-flex shrink-0 items-center justify-center font-medium text-white ${square ? 'rounded-lg' : 'rounded-full'}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`object-cover ${square ? 'rounded-lg' : 'rounded-full'} ${sizeClass} ${className}`.trim()}
      />
    );
  }

  return (
    <span className={`${baseClasses} ${bgColor} ${sizeClass} ${className}`.trim()}>
      {initials}
    </span>
  );
}
