import { useState } from 'react';
import type { Violation, Severity } from '../types';
import { employees } from '../data/mockData';

type FormData = Omit<Violation, 'id' | 'code' | 'actions' | 'status' | 'closedDate' | 'closedBy'>;

interface ViolationFormProps {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const inspectionTypes = [
  'Дотоодын хяналт шалгалт',
  'Гадаадын аудит',
  'Улсын хяналт шалгалт',
  'Гэнэтийн шалгалт',
  'Ажлын байрны үзлэг',
];

const categories = [
  'Хувийн хамгаалах хэрэгсэл',
  'Тоног төхөөрөмжийн аюулгүй байдал',
  'Гал түймрийн аюулгүй байдал',
  'Химийн аюулгүй байдал',
  'Цахилгааны аюулгүй байдал',
  'Байгаль орчны зөрчил',
  'Сургалт, мэдлэг',
  'Бичиг баримт',
  'Бусад',
];

const severityOptions: { value: Severity; label: string }[] = [
  { value: 'low', label: 'Бага' },
  { value: 'medium', label: 'Дунд' },
  { value: 'high', label: 'Өндөр' },
  { value: 'critical', label: 'Хямралт' },
];

const today = new Date().toISOString().split('T')[0];

export default function ViolationForm({ initial, onSubmit, onCancel }: ViolationFormProps) {
  const [form, setForm] = useState<FormData>({
    inspectionDate: initial?.inspectionDate ?? today,
    inspectionType: initial?.inspectionType ?? inspectionTypes[0],
    inspector: initial?.inspector ?? employees[0].name,
    location: initial?.location ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? categories[0],
    severity: initial?.severity ?? 'medium',
    dueDate: initial?.dueDate ?? '',
    assignedTo: initial?.assignedTo ?? employees[0].name,
    regulation: initial?.regulation ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.location.trim()) errs.location = 'Байршил оруулна уу';
    if (!form.description.trim()) errs.description = 'Тайлбар оруулна уу';
    if (!form.dueDate) errs.dueDate = 'Хаах хугацаа оруулна уу';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Шалгалтын огноо *</label>
          <input type="date" value={form.inspectionDate} onChange={set('inspectionDate')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Хаах хугацаа *</label>
          <input type="date" value={form.dueDate} onChange={set('dueDate')}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dueDate ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.dueDate && <p className="text-xs text-red-500 mt-0.5">{errors.dueDate}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Шалгалтын төрөл *</label>
        <select value={form.inspectionType} onChange={set('inspectionType')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {inspectionTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Шалгагч *</label>
          <select value={form.inspector} onChange={set('inspector')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {employees.map(e => <option key={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Хариуцагч *</label>
          <select value={form.assignedTo} onChange={set('assignedTo')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {employees.map(e => <option key={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Байршил *</label>
        <input type="text" value={form.location} onChange={set('location')} placeholder="Цех, уурхайн нэр..."
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-400' : 'border-gray-200'}`} />
        {errors.location && <p className="text-xs text-red-500 mt-0.5">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ангилал *</label>
          <select value={form.category} onChange={set('category')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ноцтой байдал *</label>
          <select value={form.severity} onChange={set('severity')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {severityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Зөрчлийн тайлбар *</label>
        <textarea value={form.description} onChange={set('description')} rows={3}
          placeholder="Зөрчлийн нарийвчилсан тайлбар..."
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
        {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Зөрчсөн дүрэм, журам</label>
        <input type="text" value={form.regulation} onChange={set('regulation')}
          placeholder="ХАБЭА хуулийн зүйл, БНбД..."
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
