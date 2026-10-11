import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, FileText,
  Camera, BarChart2, ChevronDown, ChevronUp, Lock, AlertCircle, Plus, Pencil
} from 'lucide-react';
import type { Violation, CorrectiveAction, Evidence, EvidenceType } from '../types';
import {
  violationStatusLabels, violationStatusColors,
  actionStatusLabels, actionStatusColors,
  severityLabels, severityColors,
  formatDate, isOverdue
} from '../utils/helpers';
import Modal from '../components/Modal';
import ActionForm from '../components/ActionForm';

interface ViolationDetailProps {
  violations: Violation[];
  onApproveEvidence: (violationId: string, actionId: string, evidence: Evidence, approved: boolean) => void;
  onCloseViolation: (violationId: string) => void;
  onUpdateActionStatus: (violationId: string, actionId: string, updates: Partial<CorrectiveAction>) => void;
  onAddAction: (violationId: string, data: Omit<CorrectiveAction, 'id' | 'violationId' | 'evidence' | 'status' | 'progress'>) => void;
  onUpdateAction: (violationId: string, actionId: string, data: Partial<CorrectiveAction>) => void;
  onAddEvidence: (violationId: string, actionId: string, data: Omit<Evidence, 'id' | 'actionId'>) => void;
}

const evidenceTypeIcon = { document: FileText, photo: Camera, report: BarChart2 };
const evidenceTypeLabel = { document: 'Баримт бичиг', photo: 'Зураг', report: 'Тайлан' };

function EvidenceCard({ evidence, onApprove }: {
  evidence: Evidence;
  onApprove: (ev: Evidence, approved: boolean) => void;
}) {
  const Icon = evidenceTypeIcon[evidence.type];
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-gray-800">{evidence.description}</div>
              <div className="text-xs text-gray-400 mt-0.5">{evidence.fileName}</div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{evidenceTypeLabel[evidence.type]}</span>
                <span>•</span>
                <span>{evidence.uploadedBy}</span>
                <span>•</span>
                <span>{formatDate(evidence.uploadedDate)}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {evidence.approved === true && (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                  <CheckCircle className="w-3 h-3" /> Баталгаажсан
                </span>
              )}
              {evidence.approved === false && (
                <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                  <XCircle className="w-3 h-3" /> Татгалзсан
                </span>
              )}
              {evidence.approved === undefined && (
                <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                  <Clock className="w-3 h-3" /> Хүлээгдэж байна
                </span>
              )}
            </div>
          </div>
          {evidence.approved === undefined && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onApprove(evidence, true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-3 h-3" /> Баталгаажуулах
              </button>
              <button
                onClick={() => onApprove(evidence, false)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-3 h-3" /> Татгалзах
              </button>
            </div>
          )}
          {evidence.approved === true && evidence.approvedBy && (
            <div className="text-xs text-gray-400 mt-1">
              {evidence.approvedBy} — {evidence.approvedDate && formatDate(evidence.approvedDate)}
            </div>
          )}
          {evidence.approved === false && evidence.rejectedReason && (
            <div className="text-xs text-red-500 mt-1">{evidence.rejectedReason}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddEvidenceForm({ onSubmit, onCancel }: {
  onSubmit: (data: Omit<Evidence, 'id' | 'actionId'>) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<EvidenceType>('document');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !fileName.trim()) { setError('Тайлбар болон файлын нэр оруулна уу'); return; }
    onSubmit({
      type,
      description,
      fileName,
      uploadedBy: 'Б. Дорж',
      uploadedDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
      <div className="text-xs font-semibold text-blue-700">Нотлох баримт нэмэх</div>
      <div className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1.5 border border-orange-100">
        ⚠ Файл бодитоор байршуулахгүй. Симуляцийн горим.
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Төрөл</label>
        <select value={type} onChange={e => setType(e.target.value as EvidenceType)}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="document">Баримт бичиг</option>
          <option value="photo">Зураг</option>
          <option value="report">Тайлан</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Тайлбар *</label>
        <input type="text" value={description} onChange={e => { setDescription(e.target.value); setError(''); }}
          placeholder="Баримтын тайлбар..."
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Файлын нэр *</label>
        <input type="text" value={fileName} onChange={e => { setFileName(e.target.value); setError(''); }}
          placeholder="жишээ: report_2024.pdf"
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Нэмэх</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-white text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Цуцлах</button>
      </div>
    </form>
  );
}

function ActionCard({ action, onApproveEvidence, onUpdateStatus, onUpdateAction, onAddEvidence }: {
  action: CorrectiveAction;
  onApproveEvidence: (ev: Evidence, approved: boolean) => void;
  onUpdateStatus: (updates: Partial<CorrectiveAction>) => void;
  onUpdateAction: (data: Partial<CorrectiveAction>) => void;
  onAddEvidence: (data: Omit<Evidence, 'id' | 'actionId'>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingAction, setEditingAction] = useState(false);
  const [addingEvidence, setAddingEvidence] = useState(false);
  const overdue = isOverdue(action.dueDate, action.status);

  return (
    <div className={`border rounded-xl overflow-hidden ${overdue ? 'border-red-200' : 'border-gray-200'}`}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${actionStatusColors[action.status]}`}>
              {actionStatusLabels[action.status]}
            </span>
            {overdue && (
              <span className="text-xs text-red-600 font-medium">⚠ Хугацаа хэтэрсэн</span>
            )}
          </div>
          <p className="text-sm text-gray-800">{action.description}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
            <span>👤 {action.responsiblePerson}</span>
            <span className={overdue ? 'text-red-600 font-medium' : ''}>
              📅 {formatDate(action.dueDate)}
            </span>
            {action.completedDate && <span>✅ {formatDate(action.completedDate)}</span>}
          </div>
          {action.progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${action.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${action.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{action.progress}% биелсэн</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {action.evidence.length > 0 && (
            <span className="text-xs text-gray-400">{action.evidence.length} баримт</span>
          )}
          {action.status !== 'completed' && (
            <button
              onClick={e => { e.stopPropagation(); setEditingAction(true); }}
              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="Засах"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {action.notes && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <span className="font-medium">Тэмдэглэл: </span>{action.notes}
            </div>
          )}

          {action.status !== 'completed' && (
            <div className="flex gap-2 flex-wrap">
              {action.status === 'pending' && (
                <button
                  onClick={() => onUpdateStatus({ status: 'in_progress', progress: 10 })}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Эхлүүлэх
                </button>
              )}
              {action.status === 'in_progress' && (
                <button
                  onClick={() => onUpdateStatus({
                    status: 'completed',
                    progress: 100,
                    completedDate: new Date().toISOString().split('T')[0]
                  })}
                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Биелсэн гэж тэмдэглэх
                </button>
              )}
            </div>
          )}

          {editingAction && (
            <ActionForm
              initial={{ description: action.description, responsiblePerson: action.responsiblePerson, dueDate: action.dueDate, notes: action.notes }}
              onSubmit={data => { onUpdateAction(data); setEditingAction(false); }}
              onCancel={() => setEditingAction(false)}
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Нотлох баримтууд ({action.evidence.length})
              </div>
              {action.status !== 'completed' && !addingEvidence && (
                <button
                  onClick={() => setAddingEvidence(true)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Нэмэх
                </button>
              )}
            </div>
            {addingEvidence && (
              <AddEvidenceForm
                onSubmit={data => { onAddEvidence(data); setAddingEvidence(false); }}
                onCancel={() => setAddingEvidence(false)}
              />
            )}
            {action.evidence.length === 0 && !addingEvidence ? (
              <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3 text-center">
                Нотлох баримт байхгүй
              </div>
            ) : (
              <div className="space-y-2">
                {action.evidence.map(ev => (
                  <EvidenceCard
                    key={ev.id}
                    evidence={ev}
                    onApprove={onApproveEvidence}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViolationDetail({
  violations, onApproveEvidence, onCloseViolation, onUpdateActionStatus,
  onAddAction, onUpdateAction, onAddEvidence
}: ViolationDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [showAddAction, setShowAddAction] = useState(false);
  const violation = violations.find(v => v.id === id);

  if (!violation) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <div className="text-gray-400">Зөрчил олдсонгүй</div>
        <Link to="/violations" className="text-blue-600 hover:underline text-sm mt-2 block">← Буцах</Link>
      </div>
    );
  }

  const allActionsCompleted = violation.actions.length > 0 &&
    violation.actions.every(a => a.status === 'completed');
  const allEvidenceApproved = violation.actions.every(a =>
    a.evidence.every(e => e.approved === true)
  );
  const canClose = allActionsCompleted && allEvidenceApproved && violation.status !== 'closed';

  return (
    <div className="max-w-3xl space-y-5">
      <Link to="/violations" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Зөрчлийн жагсаалт руу буцах
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-sm font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded">
                {violation.code}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[violation.severity]}`}>
                {severityLabels[violation.severity]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${violationStatusColors[violation.status]}`}>
                {violationStatusLabels[violation.status]}
              </span>
            </div>
            <h1 className="text-base font-semibold text-gray-900">{violation.category}</h1>
          </div>

          {violation.status !== 'closed' && (
            <button
              onClick={() => canClose && onCloseViolation(violation.id)}
              disabled={!canClose}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                canClose
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Lock className="w-4 h-4" />
              Хаах
            </button>
          )}
        </div>

        {!canClose && violation.status !== 'closed' && (
          <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2.5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {!allActionsCompleted
              ? 'Хаахын тулд бүх арга хэмжээ биелсэн байх шаардлагатай.'
              : 'Хаахын тулд бүх нотлох баримт баталгаажсан байх шаардлагатай.'}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-sm">
          <div>
            <div className="text-xs font-medium text-gray-500">Шалгалтын огноо</div>
            <div className="text-gray-800 mt-0.5">{formatDate(violation.inspectionDate)}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Шалгалтын төрөл</div>
            <div className="text-gray-800 mt-0.5">{violation.inspectionType}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Шалгагч</div>
            <div className="text-gray-800 mt-0.5">{violation.inspector}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Байршил</div>
            <div className="text-gray-800 mt-0.5">{violation.location}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Хариуцагч</div>
            <div className="text-gray-800 mt-0.5">{violation.assignedTo}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Хаах хугацаа</div>
            <div className={`mt-0.5 ${isOverdue(violation.dueDate, violation.status) ? 'text-red-600 font-medium' : 'text-gray-800'}`}>
              {formatDate(violation.dueDate)}
            </div>
          </div>
          {violation.closedDate && (
            <div>
              <div className="text-xs font-medium text-gray-500">Хаасан огноо</div>
              <div className="text-green-700 mt-0.5">{formatDate(violation.closedDate)} — {violation.closedBy}</div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1">Зөрчлийн тайлбар</div>
          <p className="text-sm text-gray-800 leading-relaxed">{violation.description}</p>
        </div>

        {violation.regulation && (
          <div className="mt-3 bg-orange-50 rounded-lg p-3">
            <div className="text-xs font-medium text-orange-700 mb-0.5">Зөрчсөн дүрэм, журам</div>
            <div className="text-sm text-orange-800">{violation.regulation}</div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">
            Залруулах арга хэмжээ ({violation.actions.length})
          </h2>
          {violation.status !== 'closed' && (
            <button
              onClick={() => setShowAddAction(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Нэмэх
            </button>
          )}
        </div>
        {violation.actions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            Арга хэмжээ бүртгэгдээгүй байна
          </div>
        ) : (
          <div className="space-y-3">
            {violation.actions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onApproveEvidence={(ev, approved) => onApproveEvidence(violation.id, action.id, ev, approved)}
                onUpdateStatus={(updates) => onUpdateActionStatus(violation.id, action.id, updates)}
                onUpdateAction={(data) => onUpdateAction(violation.id, action.id, data)}
                onAddEvidence={(data) => onAddEvidence(violation.id, action.id, data)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddAction && (
        <Modal title="Арга хэмжээ нэмэх" onClose={() => setShowAddAction(false)}>
          <ActionForm
            onSubmit={data => { onAddAction(violation.id, data); setShowAddAction(false); }}
            onCancel={() => setShowAddAction(false)}
          />
        </Modal>
      )}
    </div>
  );
}
