import { getLocale } from '$lib/paraglide/runtime.js';

/**
 * The Amharic copy of a database field when the visitor reads Amharic and one has been
 * entered; the English otherwise. Every `*_am` column is optional, so an untranslated
 * row — every row that predates them — simply shows its English text.
 */
export function localized<T extends string | null | undefined>(
	en: T,
	am: string | null | undefined
): T | string {
	return getLocale() === 'am' && am?.trim() ? am : en;
}
