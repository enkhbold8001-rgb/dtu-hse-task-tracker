import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, ChevronRight, Calendar } from 'lucide-react';
import type { Violation, ViolationStatus, Severity } from '../types';
import { violationStatusLabels, violationStatusColors, severityLabels, severityColors, formatDate, isOverdue } from '../utils/helpers';

interface ViolationListProps {
  violations: Violation[];
}

const statusOptions: { value: ViolationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Бүгд' },
  { value: 'open', label: 'Нээлттэй' },
  { value: 'in_progress', label: 'Хэрэгжиж байна' },
  { value: 'pending_verification', label: 'Баталгаажуулалт хүлээж байна' },
  { value: 'closed', label: 'Хаагдсан' },
];

export default function ViolationList({ violations }: ViolationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ViolationStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = violations.filter(v => {
    const matchSearch = !search || [v.code, v.description, v.location, v.assignedTo, v.category]
      .some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchSeverity = severityFilter === 'all' || v.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Хайх... (код, тайлбар, байршил)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Шүүлтүүр
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Статус</label>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ноцтой байдал</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      severityFilter === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'all' ? 'Бүгд' : severityLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{filtered.length} зөрчил олдлоо</span>
      </div>

      {/* Violation cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-400">Зөрчил олдсонгүй</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => {
            const overdue = isOverdue(v.dueDate, v.status);
            const completedActions = v.actions.filter(a => a.status === 'completed').length;
            const totalActions = v.actions.length;

            return (
              <Link
                key={v.id}
                to={`/violations/${v.id}`}
                className="block bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {v.code}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[v.severity]}`}>
                          {severityLabels[v.severity]}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${violationStatusColors[v.status]}`}>
                          {violationStatusLabels[v.status]}
                        </span>
                        {overdue && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
                            ⚠ Хугацаа хэтэрсэн
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2 mb-2">{v.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span>📍</span>{v.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>👤</span>{v.assignedTo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>{formatDate(v.dueDate)}</span>
                        </span>
                        <span>{v.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>

                  {totalActions > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Арга хэмжээ: {completedActions}/{totalActions}</span>
                        <span>{Math.round((completedActions / totalActions) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(completedActions / totalActions) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
