import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import type { Violation } from '../types';
import { actionStatusLabels, actionStatusColors, severityColors, severityLabels, formatDate, isOverdue } from '../utils/helpers';

interface ActionPlanProps {
  violations: Violation[];
}

export default function ActionPlan({ violations }: ActionPlanProps) {
  const allActions = violations.flatMap(v =>
    v.actions.map(a => ({
      ...a,
      violationCode: v.code,
      violationId: v.id,
      location: v.location,
      severity: v.severity,
    }))
  );

  const pending = allActions.filter(a => a.status === 'pending');
  const inProgress = allActions.filter(a => a.status === 'in_progress');
  const pendingVerification = allActions.filter(a =>
    a.status === 'completed' && a.evidence.some(e => e.approved === undefined)
  );
  const overdue = allActions.filter(a => isOverdue(a.dueDate, a.status));
  const completed = allActions.filter(a => a.status === 'completed');

  const groups = [
    { label: 'Хугацаа хэтэрсэн', items: overdue, color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700' },
    { label: 'Баталгаажуулалт хүлээж байна', items: pendingVerification, color: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
    { label: 'Хэрэгжиж байна', items: inProgress, color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
    { label: 'Хүлээгдэж байна', items: pending, color: 'border-gray-200 bg-gray-50', badge: 'bg-gray-100 text-gray-700' },
    { label: 'Биелсэн', items: completed, color: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Нийт', value: allActions.length, color: 'bg-white' },
          { label: 'Хэрэгжиж байна', value: inProgress.length, color: 'bg-blue-50' },
          { label: 'Баталгаажуулалт хүлээж байна', value: pendingVerification.length, color: 'bg-yellow-50' },
          { label: 'Хугацаа хэтэрсэн', value: overdue.length, color: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl border border-gray-200 p-3 text-center`}>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grouped action lists */}
      {groups.map(group => {
        if (group.items.length === 0) return null;
        return (
          <div key={group.label} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className={`px-4 py-3 border-b ${group.color} flex items-center justify-between`}>
              <h3 className="font-semibold text-gray-800 text-sm">{group.label}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${group.badge}`}>
                {group.items.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {group.items.map(action => {
                const overdue = isOverdue(action.dueDate, action.status);
                const pendingEvidence = action.evidence.filter(e => e.approved === undefined).length;

                return (
                  <Link
                    key={action.id}
                    to={`/violations/${action.violationId}`}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-gray-500">{action.violationCode}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${severityColors[action.severity]}`}>
                          {severityLabels[action.severity]}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${actionStatusColors[action.status]}`}>
                          {actionStatusLabels[action.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">{action.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span>👤 {action.responsiblePerson}</span>
                        <span>📍 {action.location}</span>
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                          <Clock className="w-3 h-3" />
                          {formatDate(action.dueDate)}
                        </span>
                        {pendingEvidence > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertCircle className="w-3 h-3" />
                            {pendingEvidence} баримт хүлээгдэж байна
                          </span>
                        )}
                        {action.status === 'completed' && action.evidence.every(e => e.approved === true) && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Бүгд баталгаажсан
                          </span>
                        )}
                      </div>

                      {action.progress > 0 && action.progress < 100 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${action.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{action.progress}%</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {allActions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Арга хэмжээ бүртгэгдээгүй байна
        </div>
      )}
    </div>
  );
}
