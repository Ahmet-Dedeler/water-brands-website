'use client';

import { useCallback, useState } from 'react';

export function useLoadMoreReveal() {
  const [revealFrom, setRevealFrom] = useState(0);

  const resetReveal = useCallback(() => setRevealFrom(0), []);

  const revealMore = useCallback((currentVisible: number, increment: number) => {
    setRevealFrom(currentVisible);
    return currentVisible + increment;
  }, []);

  return { revealFrom, resetReveal, revealMore };
}
