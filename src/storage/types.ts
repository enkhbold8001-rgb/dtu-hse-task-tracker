import type { Violation, Task } from '../types';

/**
 * Асинхрон хадгалалтын интерфейс.
 * LocalStorageStore: Promise.resolve() wrapper.
 * SharePointStore: Graph API дуудлага.
 */
export interface IStorageAsync {
  getViolations(): Promise<Violation[]>;
  saveViolations(violations: Violation[]): Promise<void>;
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  isInitialized(): Promise<boolean>;
  markInitialized(): Promise<void>;
}
