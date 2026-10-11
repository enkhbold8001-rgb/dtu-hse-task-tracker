// localStorage implementation — НЕ production-ready.
// Production орчинд IStorageAsync-ийг SharePointStore-ээр солино.
// Бүх методууд Promise буцаана — SharePointStore-тэй интерфейс ижил.
// Алдааг (JSON эвдэрсэн, квот дүүрсэн) Promise.reject-ээр дамжуулна:
// эвдэрсэн өгөгдлийг хоосон массив гэж үзэж дарж бичихгүй.
import type { Violation, Task } from '../types';
import type { IStorageAsync } from './types';

const KEYS = {
  violations: 'dtu_hemab_violations_v1',
  tasks: 'dtu_hemab_tasks_v1',
  initialized: 'dtu_hemab_initialized_v1',
} as const;

function readArray<T>(key: string): Promise<T[]> {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return Promise.resolve([]);
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return Promise.reject(new Error(`${key}: хадгалсан өгөгдөл массив биш байна`));
    }
    return Promise.resolve(parsed as T[]);
  } catch (e) {
    return Promise.reject(e);
  }
}

function write(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

export class LocalStorageStore implements IStorageAsync {
  getViolations(): Promise<Violation[]> {
    return readArray<Violation>(KEYS.violations);
  }

  saveViolations(violations: Violation[]): Promise<void> {
    return write(KEYS.violations, JSON.stringify(violations));
  }

  getTasks(): Promise<Task[]> {
    return readArray<Task>(KEYS.tasks);
  }

  saveTasks(tasks: Task[]): Promise<void> {
    return write(KEYS.tasks, JSON.stringify(tasks));
  }

  isInitialized(): Promise<boolean> {
    try {
      return Promise.resolve(localStorage.getItem(KEYS.initialized) === 'true');
    } catch (e) {
      return Promise.reject(e);
    }
  }

  markInitialized(): Promise<void> {
    return write(KEYS.initialized, 'true');
  }
}
