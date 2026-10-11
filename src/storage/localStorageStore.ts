// localStorage implementation — НЕ production-ready.
// Production орчинд IStorageAsync-ийг SharePointStore-ээр солино.
// Бүх методуудыг Promise.resolve()-д ороосон — SharePointStore-тэй интерфейс ижил.
import type { Violation, Task } from '../types';
import type { IStorageAsync } from './types';

const KEYS = {
  violations: 'dtu_hemab_violations_v1',
  tasks: 'dtu_hemab_tasks_v1',
  initialized: 'dtu_hemab_initialized_v1',
} as const;

export class LocalStorageStore implements IStorageAsync {
  getViolations(): Promise<Violation[]> {
    try {
      const raw = localStorage.getItem(KEYS.violations);
      return Promise.resolve(raw ? (JSON.parse(raw) as Violation[]) : []);
    } catch {
      return Promise.resolve([]);
    }
  }

  saveViolations(violations: Violation[]): Promise<void> {
    localStorage.setItem(KEYS.violations, JSON.stringify(violations));
    return Promise.resolve();
  }

  getTasks(): Promise<Task[]> {
    try {
      const raw = localStorage.getItem(KEYS.tasks);
      return Promise.resolve(raw ? (JSON.parse(raw) as Task[]) : []);
    } catch {
      return Promise.resolve([]);
    }
  }

  saveTasks(tasks: Task[]): Promise<void> {
    localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
    return Promise.resolve();
  }

  isInitialized(): Promise<boolean> {
    return Promise.resolve(localStorage.getItem(KEYS.initialized) === 'true');
  }

  markInitialized(): Promise<void> {
    localStorage.setItem(KEYS.initialized, 'true');
    return Promise.resolve();
  }
}
