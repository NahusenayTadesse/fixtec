import { sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { getLocale } from '$lib/paraglide/runtime.js';

/**
 * `localized()` for a select list: the Amharic column when the visitor reads Amharic
 * and it holds text, the English column otherwise. For queries whose rows are reduced
 * or reshaped afterwards, where mapping each field in JavaScript would be awkward.
 */
export function localizedColumn<T extends AnyColumn>(
	en: T,
	am: AnyColumn
): T | SQL<T['_']['data']> {
	if (getLocale() !== 'am') return en;
	return sql<T['_']['data']>`COALESCE(NULLIF(TRIM(${am}), ''), ${en})`;
}
