// Зөрчлийн бизнес дүрэм — цэвэр функцууд (React, хадгалалтаас хамааралгүй).
// useApp болон UI хоёулаа эндээс ашиглана: хаалтын шалгуур нэг л газар тодорхойлогдоно.
import type { Violation, CorrectiveAction } from '../types';

/** Арга хэмжээ нотлох баримтаар баталгаажсан эсэх:
 *  ≥1 батлагдсан баримттай, шийдвэр хүлээж буй баримтгүй.
 *  Татгалзсан баримт түүх болж үлдэнэ, хаалтыг хориглохгүй. */
export function isActionVerified(action: CorrectiveAction): boolean {
  const hasApproved = action.evidence.some(e => e.approved === true);
  const hasPending = action.evidence.some(e => e.approved === undefined);
  return hasApproved && !hasPending;
}

/** Хаах боломжгүй шалтгаан. null бол хааж болно. */
export function getCloseBlockReason(v: Violation): string | null {
  if (v.status === 'closed') return 'Зөрчил аль хэдийн хаагдсан.';
  if (v.actions.length === 0) return 'Хаахын тулд дор хаяж нэг арга хэмжээ бүртгэгдсэн байх шаардлагатай.';
  if (!v.actions.every(a => a.status === 'completed')) {
    return 'Хаахын тулд бүх арга хэмжээ биелсэн байх шаардлагатай.';
  }
  if (v.actions.some(a => !a.evidence.some(e => e.approved === true))) {
    return 'Арга хэмжээ бүр дор хаяж нэг баталгаажсан нотлох баримттай байх шаардлагатай.';
  }
  if (v.actions.some(a => a.evidence.some(e => e.approved === undefined))) {
    return 'Шийдвэр хүлээж буй нотлох баримтыг баталгаажуулах эсвэл татгалзах шаардлагатай.';
  }
  return null;
}

export function canCloseViolation(v: Violation): boolean {
  return getCloseBlockReason(v) === null;
}

/** Арга хэмжээнээс хамаарах төлөв. Хаагдсан төлөвийг зөвхөн closeViolation өөрчилнө. */
export function deriveViolationStatus(v: Violation): Violation['status'] {
  if (v.status === 'closed') return 'closed';
  if (v.actions.length === 0) return 'open';
  if (v.actions.every(a => a.status === 'completed')) return 'pending_verification';
  return 'in_progress';
}

/** Ерөнхий засвараар өөрчилж болохгүй талбарууд (төлөв, хаалт, код, арга хэмжээ). */
const PROTECTED_FIELDS = ['id', 'code', 'status', 'closedDate', 'closedBy', 'actions'] as const;

export function sanitizeViolationUpdate(data: Partial<Violation>): Partial<Violation> {
  const clean: Partial<Violation> = { ...data };
  for (const key of PROTECTED_FIELDS) delete clean[key];
  return clean;
}

/** Шалгуур хангасан үед л хаана, эс бөгөөс өөрчлөхгүй буцаана. */
export function applyClose(v: Violation, closedBy: string, closedDate: string): Violation {
  if (!canCloseViolation(v)) return v;
  return { ...v, status: 'closed', closedDate, closedBy };
}
