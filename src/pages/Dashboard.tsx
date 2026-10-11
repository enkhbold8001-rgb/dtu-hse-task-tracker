import { Link } from 'react-router-dom';
import { AlertTriangle, CheckSquare, Clock, TrendingUp, AlertCircle, FileCheck, Activity } from 'lucide-react';
import type { Violation, Task } from '../types';
import { violationStatusLabels, violationStatusColors, severityLabels, severityColors, isOverdue, formatDate } from '../utils/helpers';

interface DashboardProps {
  violations: Violation[];
  tasks: Task[];
}

function StatCard({ label, value, sub, color, icon: Icon, href }: {
  label: string;
  value: number;
  sub?: string;
  color: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-600 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  if (href) return <Link to={href}>{content}</Link>;
  return content;
}

export default function Dashboard({ violations, tasks }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const openViolations = violations.filter(v => v.status === 'open').length;
  const inProgressViolations = violations.filter(v => v.status === 'in_progress').length;
  const pendingVerification = violations.filter(v => v.status === 'pending_verification').length;
  const closedThisMonth = violations.filter(v => v.closedDate?.startsWith(thisMonth)).length;
  const overdueViolations = violations.filter(v =>
    v.status !== 'closed' && isOverdue(v.dueDate)
  ).length;

  const openTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && isOverdue(t.dueDate))).length;
  const completedTasksThisMonth = tasks.filter(t => t.completedDate?.startsWith(thisMonth)).length;

  const criticalViolations = violations.filter(v =>
    (v.severity === 'critical' || v.severity === 'high') && v.status !== 'closed'
  );

  const recentOverdueActions = violations.flatMap(v =>
    v.actions.filter(a => isOverdue(a.dueDate, a.status))
      .map(a => ({ ...a, violationCode: v.code, violationId: v.id }))
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {(overdueViolations > 0 || overdueTasks > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-red-800">Анхааруулга: Хугацаа хэтэрсэн зүйлс байна</div>
            <div className="text-sm text-red-600 mt-1">
              {overdueViolations > 0 && `${overdueViolations} зөрчлийн хаах хугацаа өнгөрчээ. `}
              {overdueTasks > 0 && `${overdueTasks} үүрэг даалгаврын хугацаа өнгөрчээ.`}
            </div>
          </div>
          <Link to="/overdue" className="ml-auto text-sm text-red-700 font-medium hover:underline whitespace-nowrap">
            Харах →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Зөрчлийн статистик</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Нийт зөрчил" value={violations.length} color="bg-gray-100 text-gray-600" icon={AlertTriangle} href="/violations" />
          <StatCard label="Нээлттэй" value={openViolations + inProgressViolations} sub={`${inProgressViolations} хэрэгжиж байна`} color="bg-blue-100 text-blue-600" icon={Activity} href="/violations" />
          <StatCard label="Баталгаажуулалт хүлээж байна" value={pendingVerification} color="bg-yellow-100 text-yellow-600" icon={FileCheck} href="/violations" />
          <StatCard label="Хугацаа хэтэрсэн" value={overdueViolations} color="bg-red-100 text-red-600" icon={Clock} href="/overdue" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Үүрэг даалгаврын статистик</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Нийт даалгавар" value={tasks.length} color="bg-gray-100 text-gray-600" icon={CheckSquare} href="/tasks" />
          <StatCard label="Идэвхтэй" value={openTasks} color="bg-blue-100 text-blue-600" icon={Activity} href="/tasks" />
          <StatCard label="Энэ сар хаасан" value={closedThisMonth + completedTasksThisMonth} color="bg-green-100 text-green-600" icon={TrendingUp} />
          <StatCard label="Хугацаа хэтэрсэн" value={overdueTasks} color="bg-red-100 text-red-600" icon={Clock} href="/overdue" />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Critical violations */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Хүндрэлтэй зөрчлүүд</h3>
            <Link to="/violations" className="text-sm text-blue-600 hover:underline">Бүгдийг харах</Link>
          </div>
          {criticalViolations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Хүндрэлтэй зөрчил байхгүй</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {criticalViolations.slice(0, 5).map(v => (
                <Link
                  key={v.id}
                  to={`/violations/${v.id}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-medium text-gray-500">{v.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[v.severity]}`}>
                        {severityLabels[v.severity]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 mt-1 line-clamp-2">{v.description}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>{v.location}</span>
                      <span>•</span>
                      <span className={isOverdue(v.dueDate, v.status) ? 'text-red-600 font-medium' : ''}>
                        {isOverdue(v.dueDate, v.status) ? '⚠ Хугацаа хэтэрсэн' : `Хугацаа: ${formatDate(v.dueDate)}`}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${violationStatusColors[v.status]}`}>
                    {violationStatusLabels[v.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Overdue actions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Хугацаа хэтэрсэн арга хэмжээ</h3>
            <Link to="/overdue" className="text-sm text-blue-600 hover:underline">Бүгдийг харах</Link>
          </div>
          {recentOverdueActions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Хугацаа хэтэрсэн арга хэмжээ байхгүй</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOverdueActions.map(a => (
                <Link
                  key={a.id}
                  to={`/violations/${a.violationId}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">{a.violationCode}</div>
                    <div className="text-sm text-gray-800 line-clamp-2">{a.description}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-gray-500">{a.responsiblePerson}</span>
                      <span className="text-red-600 font-medium">Хугацаа: {formatDate(a.dueDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
