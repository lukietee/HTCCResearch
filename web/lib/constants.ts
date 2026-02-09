/** All valid thumbnail groups. */
export const GROUPS = [
  'mrbeast',
  '2015', '2016', '2017', '2018', '2019',
  '2020', '2021', '2022', '2023', '2024', '2025',
] as const;

/** Year-only groups (excludes mrbeast). */
export const YEAR_GROUPS = GROUPS.filter(g => g !== 'mrbeast');

/** Color mapping for each group -- maximally distinct hues. */
export const GROUP_COLORS: Record<string, string> = {
  mrbeast: '#e6194b',
  '2015': '#3cb44b',
  '2016': '#4363d8',
  '2017': '#f58231',
  '2018': '#911eb4',
  '2019': '#42d4f4',
  '2020': '#f032e6',
  '2021': '#bfef45',
  '2022': '#fabed4',
  '2023': '#469990',
  '2024': '#dcbeff',
  '2025': '#000075',
};

/** Get color for a group, with fallback. */
export function getGroupColor(group: string): string {
  return GROUP_COLORS[group] || '#6b7280';
}
