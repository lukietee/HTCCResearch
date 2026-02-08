/** All valid thumbnail groups. */
export const GROUPS = [
  'mrbeast',
  '2015', '2016', '2017', '2018', '2019',
  '2020', '2021', '2022', '2023', '2024', '2025',
] as const;

/** Year-only groups (excludes mrbeast). */
export const YEAR_GROUPS = GROUPS.filter(g => g !== 'mrbeast');

/** Color mapping for each group. */
export const GROUP_COLORS: Record<string, string> = {
  mrbeast: '#3b82f6',
  '2015': '#9333ea',
  '2016': '#a855f7',
  '2017': '#ec4899',
  '2018': '#f43f5e',
  '2019': '#ef4444',
  '2020': '#f97316',
  '2021': '#eab308',
  '2022': '#22c55e',
  '2023': '#14b8a6',
  '2024': '#06b6d4',
  '2025': '#6366f1',
};

/** Get color for a group, with fallback. */
export function getGroupColor(group: string): string {
  return GROUP_COLORS[group] || '#6b7280';
}
