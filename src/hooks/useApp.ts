import { useState, useCallback, useEffect, useRef } from 'react';
import { violations as mockViolations, tasks as mockTasks } from '../data/mockData';
import type { Violation, Task, CorrectiveAction, Evidence } from '../types';
import { store } from '../storage';

// Зөрчлийн дугаар React state-аас тооцоолно.
// SharePoint-д серверийн тал баталгаажуулах шаардлагатай.
function buildViolationCode(existing: Violation[]): string {
  const year = new Date().getFullYear();
  const codes = existing
    .map(v => v.code)
    .filter(c => c.startsWith(`ЗР-${year}-`))
    .map(c => parseInt(c.split('-')[2] ?? '0', 10))
    .filter(n => !isNaN(n));
  const max = codes.length > 0 ? Math.max(...codes) : 0;
  return `ЗР-${year}-${String(max + 1).padStart(3, '0')}`;
}

export interface AppState {
  violations: Violation[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

export function useApp() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хамгийн сүүлийн хадгалалтыг хянах ref-үүд.
  // Хадгалалт давхцах үед хуучин дуудлага үр дүнгүй болно.
  const saveVRef = useRef(0);
  const saveTRef = useRef(0);

  // --- Анхны ачаалал ---

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const initialized = await store.isInitialized();
        if (!initialized) {
          await store.saveViolations(mockViolations);
          await store.saveTasks(mockTasks);
          await store.markInitialized();
        }
        const [v, t] = await Promise.all([store.getViolations(), store.getTasks()]);
        if (!cancelled) {
          setViolations(v);
          setTasks(t);
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Өгөгдөл уншихад алдаа гарлаа');
          setIsLoading(false);
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // --- Зөрчлийг хадгалах (latest-wins) ---

  useEffect(() => {
    if (isLoading) return;
    const seq = ++saveVRef.current;
    store.saveViolations(violations).catch(() => {
      // Зөвхөн хамгийн сүүлийн дуудлагын алдааг харуул
      if (saveVRef.current === seq) {
        setError('Зөрчлийн мэдээлэл хадгалахад алдаа гарлаа');
      }
    });
  }, [violations, isLoading]);

  // --- Даалгаврыг хадгалах (latest-wins) ---

  useEffect(() => {
    if (isLoading) return;
    const seq = ++saveTRef.current;
    store.saveTasks(tasks).catch(() => {
      if (saveTRef.current === seq) {
        setError('Даалгаврын мэдээлэл хадгалахад алдаа гарлаа');
      }
    });
  }, [tasks, isLoading]);

  // --- Violations ---

  const addViolation = useCallback((data: Omit<Violation, 'id' | 'code' | 'actions' | 'status'>) => {
    setViolations(prev => {
      const newViolation: Violation = {
        ...data,
        id: crypto.randomUUID(),
        code: buildViolationCode(prev),
        status: 'open',
        actions: [],
      };
      return [newViolation, ...prev];
    });
  }, []);

  const updateViolation = useCallback((violationId: string, data: Partial<Violation>) => {
    setViolations(prev => prev.map(v => v.id === violationId ? { ...v, ...data } : v));
  }, []);

  // --- Actions ---

  const addAction = useCallback((
    violationId: string,
    data: Omit<CorrectiveAction, 'id' | 'violationId' | 'evidence' | 'status' | 'progress'>
  ) => {
    const newAction: CorrectiveAction = {
      ...data,
      id: crypto.randomUUID(),
      violationId,
      status: 'pending',
      progress: 0,
      evidence: [],
    };
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      const actions = [...v.actions, newAction];
      return { ...v, actions, status: v.status === 'open' ? 'in_progress' : v.status };
    }));
  }, []);

  const updateAction = useCallback((
    violationId: string,
    actionId: string,
    data: Partial<CorrectiveAction>
  ) => {
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      return { ...v, actions: v.actions.map(a => a.id === actionId ? { ...a, ...data } : a) };
    }));
  }, []);

  const updateActionStatus = useCallback((
    violationId: string,
    actionId: string,
    updates: Partial<CorrectiveAction>
  ) => {
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      const updatedActions = v.actions.map(a => a.id === actionId ? { ...a, ...updates } : a);
      const allCompleted = updatedActions.every(a => a.status === 'completed');
      const newStatus = allCompleted
        ? 'pending_verification'
        : v.status === 'open' ? 'in_progress' : v.status;
      return { ...v, actions: updatedActions, status: newStatus as Violation['status'] };
    }));
  }, []);

  const updateActionEvidence = useCallback((
    violationId: string,
    actionId: string,
    evidence: Evidence,
    approved: boolean
  ) => {
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      return {
        ...v,
        actions: v.actions.map(a => {
          if (a.id !== actionId) return a;
          return {
            ...a,
            evidence: a.evidence.map(e => {
              if (e.id !== evidence.id) return e;
              return {
                ...e,
                approved,
                approvedBy: approved ? 'Б. Дорж' : undefined,
                approvedDate: approved ? new Date().toISOString().split('T')[0] : undefined,
                rejectedReason: approved ? undefined : 'Нотлох баримт хангалтгүй',
              };
            }),
          };
        }),
      };
    }));
  }, []);

  const addEvidence = useCallback((
    violationId: string,
    actionId: string,
    data: Omit<Evidence, 'id' | 'actionId'>
  ) => {
    const newEvidence: Evidence = {
      ...data,
      id: crypto.randomUUID(),
      actionId,
    };
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      return {
        ...v,
        actions: v.actions.map(a => {
          if (a.id !== actionId) return a;
          return { ...a, evidence: [...a.evidence, newEvidence] };
        }),
      };
    }));
  }, []);

  const closeViolation = useCallback((violationId: string) => {
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      return {
        ...v,
        status: 'closed',
        closedDate: new Date().toISOString().split('T')[0],
        closedBy: 'Б. Дорж',
      };
    }));
  }, []);

  // --- Tasks ---

  const addTask = useCallback((data: Omit<Task, 'id' | 'status' | 'createdDate'>) => {
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  return {
    violations,
    tasks,
    isLoading,
    error,
    addViolation,
    updateViolation,
    addAction,
    updateAction,
    updateActionStatus,
    updateActionEvidence,
    addEvidence,
    closeViolation,
    addTask,
    updateTask,
  };
}
