// localStorage implementation — НЕ production-ready.
// Production орчинд IStorage-ийг SharePoint Lists-ийн адаптераар солино.
import type { Violation, Task } from '../types';
import type { IStorage } from './types';

const KEYS = {
  violations: 'dtu_hemab_violations_v1',
  tasks: 'dtu_hemab_tasks_v1',
  initialized: 'dtu_hemab_initialized_v1',
} as const;

export class LocalStorageStore implements IStorage {
  getViolations(): Violation[] {
    try {
      const raw = localStorage.getItem(KEYS.violations);
      return raw ? (JSON.parse(raw) as Violation[]) : [];
    } catch {
      return [];
    }
  }

  saveViolations(violations: Violation[]): void {
    localStorage.setItem(KEYS.violations, JSON.stringify(violations));
  }

  getTasks(): Task[] {
    try {
      const raw = localStorage.getItem(KEYS.tasks);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
  }

  // ЗР-ЖЖЖЖ-NNN формат. Production-д серверийн тал дугаарлах ёстой.
  generateViolationCode(): string {
    const year = new Date().getFullYear();
    const violations = this.getViolations();
    const yearCodes = violations
      .map(v => v.code)
      .filter(c => c.startsWith(`ЗР-${year}-`))
      .map(c => parseInt(c.split('-')[2] ?? '0', 10))
      .filter(n => !isNaN(n));
    const maxSeq = yearCodes.length > 0 ? Math.max(...yearCodes) : 0;
    const seq = String(maxSeq + 1).padStart(3, '0');
    return `ЗР-${year}-${seq}`;
  }

  isInitialized(): boolean {
    return localStorage.getItem(KEYS.initialized) === 'true';
  }

  markInitialized(): void {
    localStorage.setItem(KEYS.initialized, 'true');
  }
}
