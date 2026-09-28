/**
 * Conditional class name joiner.
 *
 * `clsx` would be a dependency for six lines. Falsy entries are dropped so callers
 * can write `cn('base', isActive && 'active')`.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  let result = '';
  for (const value of values) {
    if (!value) continue;
    result = result ? `${result} ${value}` : value;
  }
  return result;
}
