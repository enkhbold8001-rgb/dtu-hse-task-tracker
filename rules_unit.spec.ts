/**
 * ДТҮ ХЭМАБ — Бизнес дүрмийн unit тест (src/utils/violationRules.ts)
 * Хөтөч шаардахгүй; Playwright test runner Node орчинд ажиллуулна.
 */
import { test, expect } from '@playwright/test';
import type { Violation, CorrectiveAction, Evidence } from './src/types';
import {
  canCloseViolation, getCloseBlockReason, deriveViolationStatus,
  sanitizeViolationUpdate, applyClose, isActionVerified,
} from './src/utils/violationRules';

function ev(approved: boolean | undefined, id = crypto.randomUUID()): Evidence {
  return {
    id, actionId: 'a', type: 'document', description: 'd', fileName: 'f.pdf',
    uploadedBy: 'x', uploadedDate: '2026-01-01', approved,
  };
}

function act(status: CorrectiveAction['status'], evidence: Evidence[] = []): CorrectiveAction {
  return {
    id: crypto.randomUUID(), violationId: 'v', description: 'a', responsiblePerson: 'x',
    dueDate: '2099-12-31', status, evidence, progress: status === 'completed' ? 100 : 0,
  };
}

function viol(actions: CorrectiveAction[], status: Violation['status'] = 'in_progress'): Violation {
  return {
    id: 'v', code: 'ЗР-2026-001', inspectionDate: '2026-01-01', inspectionType: 't',
    inspector: 'i', location: 'l', description: 'd', category: 'c', severity: 'high',
    status, dueDate: '2099-12-31', assignedTo: 'x', actions,
  };
}

test('U1. Арга хэмжээгүй зөрчил хаагдахгүй', () => {
  expect(canCloseViolation(viol([], 'open'))).toBe(false);
});

test('U2. Биелээгүй арга хэмжээтэй зөрчил хаагдахгүй', () => {
  expect(canCloseViolation(viol([act('completed', [ev(true)]), act('in_progress', [ev(true)])]))).toBe(false);
});

test('U3. B1: Нотлох баримтгүй «Биелсэн» арга хэмжээтэй зөрчил хаагдахгүй', () => {
  const v = viol([act('completed', [])], 'pending_verification');
  expect(canCloseViolation(v)).toBe(false);
  expect(getCloseBlockReason(v)).toContain('баталгаажсан нотлох баримт');
});

test('U4. Шийдвэр хүлээж буй баримттай үед хаагдахгүй', () => {
  expect(canCloseViolation(viol([act('completed', [ev(true), ev(undefined)])], 'pending_verification'))).toBe(false);
});

test('U5. Зөвхөн татгалзсан баримттай үед хаагдахгүй', () => {
  expect(canCloseViolation(viol([act('completed', [ev(false)])], 'pending_verification'))).toBe(false);
});

test('U6. B2: Татгалзсан + шинэ батлагдсан баримттай үед хаагдана (татгалзсан нь түүх болж үлдэнэ)', () => {
  const a = act('completed', [ev(false), ev(true)]);
  expect(isActionVerified(a)).toBe(true);
  expect(canCloseViolation(viol([a], 'pending_verification'))).toBe(true);
});

test('U7. Аль хэдийн хаагдсан зөрчлийг дахин хаахгүй', () => {
  const v = { ...viol([act('completed', [ev(true)])], 'closed'), closedDate: '2026-01-01', closedBy: 'A' };
  expect(canCloseViolation(v)).toBe(false);
  expect(applyClose(v, 'B', '2026-02-02')).toBe(v);
});

test('U8. B3: applyClose — шалгуур хангаагүй бол өөрчлөхгүй, хангасан бол хаана', () => {
  const bad = viol([act('completed', [])], 'pending_verification');
  expect(applyClose(bad, 'Б. Дорж', '2026-10-11')).toBe(bad);

  const good = viol([act('completed', [ev(true)])], 'pending_verification');
  const closed = applyClose(good, 'Б. Дорж', '2026-10-11');
  expect(closed.status).toBe('closed');
  expect(closed.closedBy).toBe('Б. Дорж');
  expect(closed.closedDate).toBe('2026-10-11');
});

test('U9. B3: Ерөнхий засвараар төлөв/хаалтын талбар өөрчлөгдөхгүй', () => {
  const clean = sanitizeViolationUpdate({
    location: 'Шинэ байршил', status: 'closed', closedBy: 'X', closedDate: '2026-01-01',
    actions: [], code: 'ЗР-0000-000', id: 'other',
  });
  expect(clean).toEqual({ location: 'Шинэ байршил' });
});

test('U10. B5: Төлөвийн тооцоолол', () => {
  expect(deriveViolationStatus(viol([], 'in_progress'))).toBe('open');
  expect(deriveViolationStatus(viol([act('pending')], 'open'))).toBe('in_progress');
  expect(deriveViolationStatus(viol([act('completed')], 'in_progress'))).toBe('pending_verification');
  // pending_verification төлөвтэй зөрчилд шинэ арга хэмжээ нэмэгдвэл буцаж in_progress
  expect(deriveViolationStatus(viol([act('completed'), act('pending')], 'pending_verification'))).toBe('in_progress');
  expect(deriveViolationStatus(viol([act('completed', [ev(true)])], 'closed'))).toBe('closed');
});
