export type ViolationStatus = 'open' | 'in_progress' | 'pending_verification' | 'closed';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type EvidenceType = 'document' | 'photo' | 'report';

export interface Evidence {
  id: string;
  actionId: string;
  type: EvidenceType;
  description: string;
  fileName: string;
  uploadedBy: string;
  uploadedDate: string;
  approved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
}

export interface CorrectiveAction {
  id: string;
  violationId: string;
  description: string;
  responsiblePerson: string;
  dueDate: string;
  completedDate?: string;
  status: ActionStatus;
  evidence: Evidence[];
  verifiedBy?: string;
  verifiedDate?: string;
  notes?: string;
  progress: number;
}

export interface Violation {
  id: string;
  code: string;
  inspectionDate: string;
  inspectionType: string;
  inspector: string;
  location: string;
  description: string;
  category: string;
  severity: Severity;
  status: ViolationStatus;
  dueDate: string;
  assignedTo: string;
  actions: CorrectiveAction[];
  closedDate?: string;
  closedBy?: string;
  regulation?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  createdDate: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  completedDate?: string;
  category: string;
  violationId?: string;
  tags: string[];
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email: string;
}

export interface DashboardStats {
  totalViolations: number;
  openViolations: number;
  overdueViolations: number;
  closedThisMonth: number;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  completedThisMonth: number;
  pendingVerification: number;
}
