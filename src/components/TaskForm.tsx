import { useState } from 'react';
import type { Task, Priority, Violation } from '../types';
import { employees } from '../data/mockData';

type FormData = Omit<Task, 'id' | 'status' | 'createdDate' | 'completedDate'>;

interface TaskFormProps {
  initial?: Partial<FormData>;
  violations?: Violation[];
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Бага' },
  { value: 'medium', label: 'Дунд' },
  { value: 'high', label: 'Өндөр' },
];

const taskCategories = [
  'Сургалт',
  'Тоног төхөөрөмж',
  'Баримт бичиг',
  'Байгаль орчин',
  'Хяналт шалгалт',
  'Бусад',
];

export default function TaskForm({ initial, violations = [], onSubmit, onCancel }: TaskFormProps) {
  const [form, setForm] = useState<FormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    assignedTo: initial?.assignedTo ?? employees[0].name,
    createdBy: initial?.createdBy ?? 'Б. Дорж',
    dueDate: initial?.dueDate ?? '',
    priority: initial?.priority ?? 'medium',
    category: initial?.category ?? taskCategories[0],
    tags: initial?.tags ?? [],
    violationId: initial?.violationId ?? '',
  });
  const [tagsText, setTagsText] = useState(form.tags.join(', '));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Гарчиг оруулна уу';
    if (!form.dueDate) errs.dueDate = 'Хугацаа оруулна уу';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...form,
        tags: tagsText.split(',').map(t => t.trim()).filter(Boolean),
        violationId: form.violationId || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Гарчиг *</label>
        <input type="text" value={form.title} onChange={set('title')} placeholder="Даалгаврын товч гарчиг..."
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-400' : 'border-gray-200'}`} />
        {errors.title && <p className="text-xs text-red-500 mt-0.5">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Тайлбар</label>
        <textarea value={form.description} onChange={set('description')} rows={2}
          placeholder="Нарийвчилсан тайлбар..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Хариуцагч *</label>
          <select value={form.assignedTo} onChange={set('assignedTo')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {employees.map(e => <option key={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Дуусах хугацаа *</label>
          <input type="date" value={form.dueDate} onChange={set('dueDate')}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dueDate ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.dueDate && <p className="text-xs text-red-500 mt-0.5">{errors.dueDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Чухал зэрэглэл *</label>
          <select value={form.priority} onChange={set('priority')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ангилал *</label>
          <select value={form.category} onChange={set('category')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {taskCategories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Холбоотой зөрчил</label>
        <select value={form.violationId ?? ''} onChange={set('violationId')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— холбохгүй —</option>
          {violations.filter(v => v.status !== 'closed').map(v => (
            <option key={v.id} value={v.id}>{v.code} — {v.category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Шошго (таслалаар тусгаарла)</label>
        <input type="text" value={tagsText} onChange={e => setTagsText(e.target.value)}
          placeholder="ISO, аудит, яаралтай..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit"
          className="flex-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Хадгалах
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Цуцлах
        </button>
      </div>
    </form>
  );
}
