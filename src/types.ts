export interface Habit {
  id: string;
  name: string;
  createdAt: number;
  color: string;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface HabitWithStatus extends Habit {
  completed: boolean;
}
