import { useState } from 'react';
import type { CorrectiveAction } from '../types';
import { employees } from '../data/mockData';

type FormData = Pick<CorrectiveAction, 'description' | 'responsiblePerson' | 'dueDate' | 'notes'>;

interface ActionFormProps {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];

export default function ActionForm({ initial, onSubmit, onCancel }: ActionFormProps) {
  const [form, setForm] = useState<FormData>({
    description: initial?.description ?? '',
    responsiblePerson: initial?.responsiblePerson ?? employees[0].name,
    dueDate: initial?.dueDate ?? '',
    notes: initial?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Арга хэмжээний тайлбар оруулна уу';
    if (!form.dueDate) errs.dueDate = 'Биелэх хугацаа оруулна уу';
    if (form.dueDate && form.dueDate < today) errs.dueDate = 'Хугацаа өнгөрсөн огноо байж болохгүй';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Арга хэмжээний тайлбар *</label>
        <textarea value={form.description} onChange={set('description')} rows={3}
          placeholder="Ямар арга хэмжээ авах, юу хийх вэ..."
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
        {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Хариуцагч *</label>
        <select value={form.responsiblePerson} onChange={set('responsiblePerson')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {employees.map(e => <option key={e.id}>{e.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Биелэх хугацаа *</label>
        <input type="date" value={form.dueDate} onChange={set('dueDate')} min={today}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dueDate ? 'border-red-400' : 'border-gray-200'}`} />
        {errors.dueDate && <p className="text-xs text-red-500 mt-0.5">{errors.dueDate}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Тэмдэглэл</label>
        <textarea value={form.notes} onChange={set('notes')} rows={2}
          placeholder="Нэмэлт тайлбар, анхаарах зүйл..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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
