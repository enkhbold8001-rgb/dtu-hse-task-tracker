import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckSquare, Calendar, Tag } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '../types';
import { taskStatusLabels, taskStatusColors, priorityLabels, priorityColors, formatDate, isOverdue } from '../utils/helpers';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskList({ tasks, onUpdateTask }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = tasks.filter(t => {
    const effectiveStatus: TaskStatus = (t.status !== 'completed' && isOverdue(t.dueDate)) ? 'overdue' : t.status;
    const matchSearch = !search || [t.title, t.description, t.assignedTo, t.category]
      .some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
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
              placeholder="Хайх... (нэр, тайлбар, хариуцагч)"
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
                {(['all', 'pending', 'in_progress', 'completed', 'overdue'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s === 'all' ? 'Бүгд' : taskStatusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Яаралтай байдал</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      priorityFilter === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p === 'all' ? 'Бүгд' : priorityLabels[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">{filtered.length} даалгавар олдлоо</div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <div className="text-gray-400">Даалгавар олдсонгүй</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const overdue = t.status !== 'completed' && isOverdue(t.dueDate);
            const effectiveStatus: TaskStatus = overdue ? 'overdue' : t.status;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border overflow-hidden ${overdue ? 'border-red-200' : 'border-gray-200'}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${taskStatusColors[effectiveStatus]}`}>
                          {taskStatusLabels[effectiveStatus]}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>
                          {priorityLabels[t.priority]}
                        </span>
                        {t.violationId && (
                          <Link
                            to={`/violations/${t.violationId}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Зөрчилтэй холбоотой
                          </Link>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">{t.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                        <span>👤 {t.assignedTo}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>{formatDate(t.dueDate)}</span>
                        </span>
                        <span>{t.category}</span>
                      </div>

                      {t.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {t.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {t.status === 'pending' && (
                        <button
                          onClick={() => onUpdateTask(t.id, { status: 'in_progress' })}
                          className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Эхлүүлэх
                        </button>
                      )}
                      {t.status === 'in_progress' && (
                        <button
                          onClick={() => onUpdateTask(t.id, {
                            status: 'completed',
                            completedDate: new Date().toISOString().split('T')[0]
                          })}
                          className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Биелсэн
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
