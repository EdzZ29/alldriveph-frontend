// One look for every trip input (branch, date, time) so they line up wherever they appear.

/** The outlined pill around a field. */
export const fieldShell =
  "h-12 rounded-xl border border-input bg-background text-sm shadow-xs transition-[border-color,box-shadow] hover:border-foreground/25 dark:bg-input/30"

/** Focus ring for a single control, or for a group via focus-within. */
export const fieldFocus = "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
export const fieldFocusWithin = "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40"

/** Small label above a field. */
export const fieldLabel = "mb-1.5 block h-4 px-1 text-xs leading-4 font-medium text-muted-foreground"
