import type { ViolationStatus, ActionStatus, TaskStatus, Severity, Priority } from '../types';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function isOverdue(dueDate: string, status?: string): boolean {
  if (status === 'completed' || status === 'closed') return false;
  return new Date(dueDate) < new Date();
}

export function daysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const violationStatusLabels: Record<ViolationStatus, string> = {
  open: 'Нээлттэй',
  in_progress: 'Хэрэгжиж байна',
  pending_verification: 'Баталгаажуулалт хүлээж байна',
  closed: 'Хаагдсан',
};

export const violationStatusColors: Record<ViolationStatus, string> = {
  open: 'bg-red-100 text-red-800 border-red-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  pending_verification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
};

export const actionStatusLabels: Record<ActionStatus, string> = {
  pending: 'Хүлээгдэж байна',
  in_progress: 'Хэрэгжиж байна',
  completed: 'Биелсэн',
  overdue: 'Хугацаа хэтэрсэн',
};

export const actionStatusColors: Record<ActionStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Хүлээгдэж байна',
  in_progress: 'Хэрэгжиж байна',
  completed: 'Биелсэн',
  overdue: 'Хугацаа хэтэрсэн',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

export const severityLabels: Record<Severity, string> = {
  low: 'Бага',
  medium: 'Дунд',
  high: 'Өндөр',
  critical: 'Чухал',
};

export const severityColors: Record<Severity, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Бага',
  medium: 'Дунд',
  high: 'Өндөр',
};

export const priorityColors: Record<Priority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};
