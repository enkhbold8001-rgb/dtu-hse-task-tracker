import { useState, useCallback, useEffect, useRef } from 'react';
import { violations as mockViolations, tasks as mockTasks } from '../data/mockData';
import type { Violation, Task, CorrectiveAction, Evidence } from '../types';
import { store } from '../storage';
import {
  applyClose, deriveViolationStatus, sanitizeViolationUpdate,
} from '../utils/violationRules';

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

// Хаагдсан зөрчлийг өөрчлөхгүй — аудитын бүртгэл хэвээр үлдэнэ.
function updateOpenViolation(
  list: Violation[],
  violationId: string,
  fn: (v: Violation) => Violation,
): Violation[] {
  return list.map(v => (v.id !== violationId || v.status === 'closed') ? v : fn(v));
}

// Арга хэмжээ өөрчлөгдсөний дараа зөрчлийн төлөвийг дахин тооцоолно.
function withDerivedStatus(v: Violation): Violation {
  return { ...v, status: deriveViolationStatus(v) };
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
  // Амжилттай ачаалсны дараа л хадгална. Уншилт амжилтгүй бол
  // хадгалсан (магадгүй эвдэрсэн) өгөгдлийг хоосон төлөвөөр дарж бичихгүй.
  const [canPersist, setCanPersist] = useState(false);
  const [violationSaveError, setViolationSaveError] = useState<string | null>(null);
  const [taskSaveError, setTaskSaveError] = useState<string | null>(null);

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
        let [v, t] = await Promise.all([store.getViolations(), store.getTasks()]);
        if (!initialized) {
          // Жишээ өгөгдлийг зөвхөн хадгалалт бүрэн хоосон үед оруулна.
          // Туг алга ч бодит өгөгдөл байвал түүнийг хэвээр үлдээнэ.
          if (v.length === 0 && t.length === 0) {
            await store.saveViolations(mockViolations);
            await store.saveTasks(mockTasks);
            v = mockViolations;
            t = mockTasks;
          }
          await store.markInitialized();
        }
        if (!cancelled) {
          setViolations(v);
          setTasks(t);
          setCanPersist(true);
          setIsLoading(false);
        }
      } catch {
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
    if (!canPersist) return;
    const seq = ++saveVRef.current;
    // Promise.resolve().then — store синхрон алдаа шидсэн ч баригдана
    Promise.resolve()
      .then(() => store.saveViolations(violations))
      .then(
        // Зөвхөн хамгийн сүүлийн дуудлагын үр дүнг харуул
        () => { if (saveVRef.current === seq) setViolationSaveError(null); },
        () => {
          if (saveVRef.current === seq) {
            setViolationSaveError('Зөрчлийн мэдээлэл хадгалагдсангүй');
          }
        },
      );
  }, [violations, canPersist]);

  // --- Даалгаврыг хадгалах (latest-wins) ---

  useEffect(() => {
    if (!canPersist) return;
    const seq = ++saveTRef.current;
    Promise.resolve()
      .then(() => store.saveTasks(tasks))
      .then(
        () => { if (saveTRef.current === seq) setTaskSaveError(null); },
        () => {
          if (saveTRef.current === seq) {
            setTaskSaveError('Даалгаврын мэдээлэл хадгалагдсангүй');
          }
        },
      );
  }, [tasks, canPersist]);

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
    const clean = sanitizeViolationUpdate(data);
    setViolations(prev => updateOpenViolation(prev, violationId, v => ({ ...v, ...clean })));
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
    setViolations(prev => updateOpenViolation(prev, violationId, v =>
      withDerivedStatus({ ...v, actions: [...v.actions, newAction] })
    ));
  }, []);

  const updateAction = useCallback((
    violationId: string,
    actionId: string,
    data: Partial<CorrectiveAction>
  ) => {
    setViolations(prev => updateOpenViolation(prev, violationId, v =>
      withDerivedStatus({ ...v, actions: v.actions.map(a => a.id === actionId ? { ...a, ...data } : a) })
    ));
  }, []);

  const updateActionStatus = useCallback((
    violationId: string,
    actionId: string,
    updates: Partial<CorrectiveAction>
  ) => {
    setViolations(prev => updateOpenViolation(prev, violationId, v =>
      withDerivedStatus({ ...v, actions: v.actions.map(a => a.id === actionId ? { ...a, ...updates } : a) })
    ));
  }, []);

  const updateActionEvidence = useCallback((
    violationId: string,
    actionId: string,
    evidence: Evidence,
    approved: boolean
  ) => {
    setViolations(prev => updateOpenViolation(prev, violationId, v => {
      return {
        ...v,
        actions: v.actions.map(a => {
          if (a.id !== actionId) return a;
          return {
            ...a,
            evidence: a.evidence.map(e => {
              // Зөвхөн шийдвэр хүлээж буй баримтыг батлах/татгалзана
              if (e.id !== evidence.id || e.approved !== undefined) return e;
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
    setViolations(prev => updateOpenViolation(prev, violationId, v => ({
      ...v,
      actions: v.actions.map(a => {
        if (a.id !== actionId) return a;
        return { ...a, evidence: [...a.evidence, newEvidence] };
      }),
    })));
  }, []);

  const closeViolation = useCallback((violationId: string) => {
    // Хаалтын шалгуурыг бизнес логикт шалгана — UI-аас үл хамааран.
    const today = new Date().toISOString().split('T')[0];
    setViolations(prev => prev.map(v =>
      v.id === violationId ? applyClose(v, 'Б. Дорж', today) : v
    ));
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
    saveError: violationSaveError ?? taskSaveError,
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
