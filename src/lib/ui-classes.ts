/** Shared pill/chip styles — sky accent, readable in light and dark mode. */

export const pillActive =
  'bg-sky-100 text-sky-900 ring-1 ring-sky-200 shadow-sm dark:bg-sky-900/35 dark:text-sky-50 dark:ring-sky-500/50';

export const pillInactive =
  'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 dark:bg-[var(--surface-raised)] dark:text-gray-200 dark:border-[var(--border-soft)] dark:hover:border-gray-500';

export const pillCountActive = 'text-sky-600 dark:text-sky-300';
export const pillCountInactive = 'text-gray-400 dark:text-gray-500';

/** Subtle press feedback for buttons and pills. */
export const motionPress =
  'transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:active:scale-100';

/** Interactive pill — tab/filter chips. */
export const pillButton = `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium tab-indicator ${motionPress}`;

/** Leaderboard card link — shadow on hover, settle on press. */
export const cardLink =
  'group relative flex flex-col bg-white dark:bg-[var(--surface-raised)] rounded-xl border border-gray-100 dark:border-[var(--border-soft)] shadow-sm overflow-hidden transition-[box-shadow,border-color] duration-200 ease-[var(--ease-out)] hover:shadow-md hover:border-gray-200 dark:hover:border-gray-500 active:scale-[0.995] motion-reduce:active:scale-100';

/** Horizontal list card (ingredients). */
export const cardLinkRow =
  'flex items-center gap-4 p-4 bg-white dark:bg-[var(--surface-raised)] rounded-xl border border-gray-100 dark:border-[var(--border-soft)] shadow-sm transition-[box-shadow,border-color] duration-200 ease-[var(--ease-out)] hover:shadow-md hover:border-gray-200 dark:hover:border-gray-500 active:scale-[0.995] motion-reduce:active:scale-100';

/** Secondary action button (show more, load more). */
export const btnSecondary =
  'px-6 py-2.5 rounded-full bg-white dark:bg-[var(--surface-raised)] border border-gray-200 dark:border-[var(--border-soft)] text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:active:scale-100';

/** Primary dark CTA. */
export const btnPrimary =
  'px-6 py-2.5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-[transform,opacity] duration-150 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:active:scale-100';

/** Sky CTA (not-found, links). */
export const btnSky =
  'inline-flex px-5 py-2.5 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 transition-[transform,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] motion-reduce:active:scale-100';

/** Text inputs — smooth focus ring transition. */
export const inputField =
  'transition-[box-shadow,background-color,border-color] duration-200 ease-[var(--ease-out)] focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500 focus:outline-none';

/** Empty state container. */
export const emptyState =
  'rounded-xl border border-dashed border-gray-200 dark:border-[var(--border-soft)] bg-white dark:bg-[var(--surface-raised)] px-6 py-12 text-center';
