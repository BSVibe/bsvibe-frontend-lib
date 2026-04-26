/**
 * cn — minimal class-name combiner.
 *
 * Accepts strings, falsy values (skipped), and objects of `{ [class]: bool }`.
 * Equivalent to a tiny subset of `clsx` — kept inline to avoid adding a
 * runtime dependency to `@bsvibe/ui`.
 */
export type ClassValue = string | number | false | null | undefined | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const parts: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string' || typeof input === 'number') {
      parts.push(String(input));
      continue;
    }
    if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) parts.push(key);
      }
    }
  }
  return parts.join(' ');
}
