import type { ReactNode } from 'react';
import { emptyState } from '@/lib/ui-classes';

export default function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={emptyState} role="status">
      {icon && (
        <p className="text-4xl mb-3" aria-hidden="true">
          {icon}
        </p>
      )}
      <p className="text-gray-700 dark:text-gray-300 font-medium">{title}</p>
      {children}
    </div>
  );
}
