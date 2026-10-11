import { useState, useCallback } from 'react';
import { violations as initialViolations, tasks as initialTasks } from '../data/mockData';
import type { Violation, Task, CorrectiveAction, Evidence } from '../types';

export function useApp() {
  const [violations, setViolations] = useState<Violation[]>(initialViolations);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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

  const updateActionStatus = useCallback((
    violationId: string,
    actionId: string,
    updates: Partial<CorrectiveAction>
  ) => {
    setViolations(prev => prev.map(v => {
      if (v.id !== violationId) return v;
      const updatedActions = v.actions.map(a => {
        if (a.id !== actionId) return a;
        return { ...a, ...updates };
      });

      const allCompleted = updatedActions.every(a => a.status === 'completed');
      const newStatus = allCompleted ? 'pending_verification' : v.status === 'open' ? 'in_progress' : v.status;

      return { ...v, actions: updatedActions, status: newStatus as Violation['status'] };
    }));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  return {
    violations,
    tasks,
    updateActionEvidence,
    closeViolation,
    updateActionStatus,
    updateTaskStatus,
  };
}
