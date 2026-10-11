import { useState, useCallback, useEffect } from 'react';
import { violations as mockViolations, tasks as mockTasks } from '../data/mockData';
import type { Violation, Task, CorrectiveAction, Evidence } from '../types';
import { store } from '../storage';

function initStore(): { violations: Violation[]; tasks: Task[] } {
  if (!store.isInitialized()) {
    store.saveViolations(mockViolations);
    store.saveTasks(mockTasks);
    store.markInitialized();
  }
  return {
    violations: store.getViolations(),
    tasks: store.getTasks(),
  };
}

export function useApp() {
  const [violations, setViolations] = useState<Violation[]>(() => initStore().violations);
  const [tasks, setTasks] = useState<Task[]>(() => store.getTasks());

  useEffect(() => { store.saveViolations(violations); }, [violations]);
  useEffect(() => { store.saveTasks(tasks); }, [tasks]);

  // --- Violations ---

  const addViolation = useCallback((data: Omit<Violation, 'id' | 'code' | 'actions' | 'status'>) => {
    const newViolation: Violation = {
      ...data,
      id: crypto.randomUUID(),
      code: store.generateViolationCode(),
      status: 'open',
      actions: [],
    };
    setViolations(prev => [newViolation, ...prev]);
  }, []);

  const updateViolation = useCallback((violationId: string, data: Partial<Violation>) => {
    setViolations(prev => prev.map(v => v.id === violationId ? { ...v, ...data } : v));
  }, []);

  // --- Actions ---

  const addAction = useCallback((violationId: string, data: Omit<CorrectiveAction, 'id' | 'violationId' | 'evidence' | 'status' | 'progress'>) => {
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

  const updateAction = useCallback((violationId: string, actionId: string, data: Partial<CorrectiveAction>) => {
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

  const addEvidence = useCallback((violationId: string, actionId: string, data: Omit<Evidence, 'id' | 'actionId'>) => {
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
