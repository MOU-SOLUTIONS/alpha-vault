export type SavingGoalCategory =
  | 'EDUCATION'
  | 'HEALTH'
  | 'MARRIAGE'
  | 'TRAVEL'
  | 'EMERGENCY'
  | 'RETIREMENT'
  | 'HOME'
  | 'OTHER';

export const SAVING_GOAL_CATEGORY_OPTIONS: {
  value: SavingGoalCategory;
  label: string;
}[] = [
  { value: 'EDUCATION', label: 'Education' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'MARRIAGE', label: 'Marriage' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'RETIREMENT', label: 'Retirement' },
  { value: 'HOME', label: 'Home' },
  { value: 'OTHER', label: 'Other' },
];
