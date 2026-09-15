// Shared list styling: on mobile, each row becomes its own rounded, elevated
// card (stacked with a gap) so lists feel like a modern app feed, easy to
// scan and tap. On desktop (sm:+) it collapses back into one classic bordered
// list — more information-dense, familiar for a data-heavy CRM screen.
export const listContainer = 'space-y-3 sm:space-y-0 sm:rounded-xl2 sm:bg-white sm:shadow-soft sm:divide-y sm:divide-ink-100';

export const listItem =
  'rounded-2xl bg-white p-4 shadow-soft active:scale-[0.99] transition-transform sm:rounded-none sm:p-4 sm:shadow-none sm:active:scale-100';

// Same idea but for rows that aren't tappable (no active/tap feedback needed).
export const listItemStatic = 'rounded-2xl bg-white p-4 shadow-soft sm:rounded-none sm:p-4 sm:shadow-none';
