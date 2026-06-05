'use client';

import type { ReactNode } from 'react';

export default function Collapsible({
  open,
  children,
  className = '',
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`collapsible-panel ${className}`} data-open={open ? 'true' : 'false'}>
      <div className="collapsible-inner">
        <div className="collapsible-content">{children}</div>
      </div>
    </div>
  );
}
