import type { Violation, Task } from '../types';

export interface IStorage {
  getViolations(): Violation[];
  saveViolations(violations: Violation[]): void;
  getTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  generateViolationCode(): string;
  isInitialized(): boolean;
  markInitialized(): void;
}
