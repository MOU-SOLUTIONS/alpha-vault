import { PriorityLevel } from '../enums/priority-level';
import { SavingGoalCategory } from '../enums/saving-goal';

export interface SavingGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  creationDate: string;
  deadline: string;
  category: SavingGoalCategory;
  priority: PriorityLevel;
}

export interface SavingGoalRequest {
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  creationDate: string;
  deadline: string;
  category: SavingGoalCategory;
  priority: PriorityLevel;
}

export interface SavingGoalResponse extends SavingGoal {}
