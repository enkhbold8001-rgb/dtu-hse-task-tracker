import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Calendar } from 'lucide-react';
import type { Violation, Task } from '../types';
import {
  severityColors, severityLabels, violationStatusColors, violationStatusLabels,
  priorityColors, priorityLabels,
  formatDate, isOverdue, daysUntilDue
} from '../utils/helpers';

interface OverdueReportProps {
  violations: Violation[];
  tasks: Task[];
}

export default function OverdueReport({ violations, tasks }: OverdueReportProps) {
  const overdueViolations = violations.filter(v => v.status !== 'closed' && isOverdue(v.dueDate));
  const overdueActions = violations.flatMap(v =>
    v.actions
      .filter(a => isOverdue(a.dueDate, a.status))
      .map(a => ({ ...a, violationCode: v.code, violationId: v.id, violationSeverity: v.severity, location: v.location }))
  );
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && isOverdue(t.dueDate));

  const totalOverdue = overdueViolations.length + overdueActions.length + overdueTasks.length;

  const reportDate = new Date().toLocaleDateString('mn-MN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-red-800">Хугацаа хэтэрсэн ажлын тайлан</h2>
            <p className="text-sm text-red-600 mt-0.5">Тайлан гаргасан огноо: {reportDate}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-700">{totalOverdue}</div>
            <div className="text-xs text-red-500">нийт зүйл</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 text-center border border-red-100">
            <div className="text-xl font-bold text-red-700">{overdueViolations.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Зөрчил</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-red-100">
            <div className="text-xl font-bold text-red-700">{overdueActions.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Арга хэмжээ</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-red-100">
            <div className="text-xl font-bold text-red-700">{overdueTasks.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Даалгавар</div>
          </div>
        </div>
      </div>

      {/* Overdue violations */}
      {overdueViolations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Хугацаа хэтэрсэн зөрчлүүд</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              {overdueViolations.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {overdueViolations
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(v => {
                const days = Math.abs(daysUntilDue(v.dueDate));
                return (
                  <Link
                    key={v.id}
                    to={`/violations/${v.id}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-gray-600">{v.code}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${severityColors[v.severity]}`}>
                          {severityLabels[v.severity]}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${violationStatusColors[v.status]}`}>
                          {violationStatusLabels[v.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">{v.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span>📍 {v.location}</span>
                        <span>👤 {v.assignedTo}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-red-600">{days} өдөр</div>
                      <div className="text-xs text-gray-400">{formatDate(v.dueDate)}</div>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      {/* Overdue actions */}
      {overdueActions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Хугацаа хэтэрсэн арга хэмжээнүүд</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              {overdueActions.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {overdueActions
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(action => {
                const days = Math.abs(daysUntilDue(action.dueDate));
                return (
                  <Link
                    key={action.id}
                    to={`/violations/${action.violationId}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-gray-500">{action.violationCode}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${severityColors[action.violationSeverity]}`}>
                          {severityLabels[action.violationSeverity]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">{action.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span>👤 {action.responsiblePerson}</span>
                        <span>📍 {action.location}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-red-600">{days} өдөр</div>
                      <div className="text-xs text-gray-400">{formatDate(action.dueDate)}</div>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Хугацаа хэтэрсэн даалгаварууд</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              {overdueTasks.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {overdueTasks
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(task => {
                const days = Math.abs(daysUntilDue(task.dueDate));
                return (
                  <div key={task.id} className="flex items-start gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                        <span className="text-xs text-gray-500">{task.category}</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>👤 {task.assignedTo}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-red-600">{days} өдөр</div>
                      <div className="text-xs text-gray-400">хугацаа хэтэрсэн</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {totalOverdue === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">✅</div>
          <div className="font-semibold text-green-700">Хугацаа хэтэрсэн зүйл байхгүй!</div>
          <div className="text-sm text-green-600 mt-1">Бүх ажил хугацаанд биелж байна</div>
        </div>
      )}
    </div>
  );
}
