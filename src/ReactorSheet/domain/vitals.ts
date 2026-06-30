/**
 * @file Vitals view-model helpers.
 */

/** Resolved AC for display: the value matching the ascendingAC setting, plus the mode. */
export function selectAc(
  aacValue: number,
  acValue: number,
  isAscending: boolean
): { value: number; ascending: boolean } {
  return { value: isAscending ? aacValue : acValue, ascending: isAscending };
}
