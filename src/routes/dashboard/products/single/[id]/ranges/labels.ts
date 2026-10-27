/** How each kind of stock adjustment reads in the history table and its Type filter. */
export const TYPE_LABELS: Record<string, string> = {
	receive: 'Received',
	sale: 'Sold',
	return: 'Returned',
	damage: 'Damaged',
	correction: 'Correction'
};
