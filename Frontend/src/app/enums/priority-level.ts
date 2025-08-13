export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export const PRIORITY_LEVEL_OPTIONS: {
  value: PriorityLevel;
  label: string;
}[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];
