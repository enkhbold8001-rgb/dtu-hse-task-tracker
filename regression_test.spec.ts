/**
 * ДТҮ ХЭМАБ — MVP тогтвортой байдлын засварын regression тест (B1–B5, JSON, init)
 * Шаардлага: `npx vite preview --port 5175` (эсвэл dev) ажиллаж байх.
 */
import { test, expect, chromium, type Page, type Browser } from '@playwright/test';

const BASE = 'http://localhost:5175';
const K = {
  v: 'dtu_hemab_violations_v1',
  t: 'dtu_hemab_tasks_v1',
  init: 'dtu_hemab_initialized_v1',
};

let browser: Browser;
test.beforeAll(async () => {
  browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
});
test.afterAll(async () => { await browser.close(); });

type Ev = { id: string; approved?: boolean };
type Act = { id: string; status: string; evidence: Ev[] };

function evidence(id: string, approved?: boolean) {
  return {
    id, actionId: 'a1', type: 'document', description: `Баримт ${id}`, fileName: `${id}.pdf`,
    uploadedBy: 'Тест', uploadedDate: '2026-10-01', approved,
  };
}

function action(id: string, status: string, ev: ReturnType<typeof evidence>[]) {
  return {
    id, violationId: 'rv1', description: `Арга хэмжээ ${id}`, responsiblePerson: 'Тест',
    dueDate: '2099-12-31', status, evidence: ev, progress: status === 'completed' ? 100 : 0,
    ...(status === 'completed' ? { completedDate: '2026-10-01' } : {}),
  };
}

function violation(status: string, actions: ReturnType<typeof action>[]) {
  return {
    id: 'rv1', code: 'ЗР-2026-901', inspectionDate: '2026-10-01', inspectionType: 'Тест',
    inspector: 'Тест', location: 'Регресс цех', description: 'Регресс тест', category: 'Тест',
    severity: 'high', status, dueDate: '2099-12-31', assignedTo: 'Тест', actions,
  };
}

/** Апп ачаалагдахгүй хоосон хуудас (ижил origin) — localStorage-ийг апп-тай
 *  уралдахгүйгээр бэлтгэхэд ашиглана. */
async function openBlank(page: Page) {
  await page.route(`${BASE}/__blank`, r => r.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  await page.goto(`${BASE}/__blank`);
}

/** localStorage-ийг тодорхой төлөвт оруулна (апп ачаалахаас өмнө). */
async function seed(page: Page, violations: unknown[], opts: { init?: boolean; tasks?: unknown[] } = {}) {
  await openBlank(page);
  await page.evaluate(({ K, violations, tasks, init }) => {
    localStorage.setItem(K.v, JSON.stringify(violations));
    localStorage.setItem(K.t, JSON.stringify(tasks));
    if (init) localStorage.setItem(K.init, 'true'); else localStorage.removeItem(K.init);
  }, { K, violations, tasks: opts.tasks ?? [], init: opts.init ?? true });
}

async function storedViolation(page: Page) {
  return page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? '[]')[0], K.v);
}

const closeBtn = (page: Page) => page.locator('button:has-text("Хаах")');

// ── R1 (B1) ───────────────────────────────────────────────────────────────
test('R1. B1: Нотлох баримтгүй «Биелсэн» арга хэмжээтэй зөрчил хаагдахгүй', async () => {
  const page = await browser.newPage();
  await seed(page, [violation('pending_verification', [action('a1', 'completed', [])])]);
  await page.goto(`${BASE}/violations/rv1`);
  await expect(closeBtn(page)).toBeVisible();
  await expect(closeBtn(page)).toBeDisabled();
  await expect(page.locator('text=баталгаажсан нотлох баримттай байх')).toBeVisible();
  await page.close();
});

// ── R2 (B1) ───────────────────────────────────────────────────────────────
test('R2. B1: Шийдвэр хүлээж буй баримттай үед хаагдахгүй', async () => {
  const page = await browser.newPage();
  await seed(page, [violation('pending_verification', [
    action('a1', 'completed', [evidence('e1', true), evidence('e2', undefined)]),
  ])]);
  await page.goto(`${BASE}/violations/rv1`);
  await expect(closeBtn(page)).toBeDisabled();
  await page.close();
});

// ── R3 (B2 + B3 + бүтэн урсгал) ───────────────────────────────────────────
test('R3. B2: «Биелсэн» арга хэмжээнд татгалзсан баримтын оронд шинэ баримт нэмж, батлаад хаах', async () => {
  const page = await browser.newPage();
  await seed(page, [violation('pending_verification', [action('a1', 'completed', [evidence('e1', false)])])]);
  await page.goto(`${BASE}/violations/rv1`);
  await expect(closeBtn(page)).toBeDisabled();

  // Арга хэмжээний картыг дэлгэх
  await page.click('text=Арга хэмжээ a1');
  const card = page.locator('div.overflow-hidden.rounded-xl');
  const addEvidenceBtn = card.locator('button:has-text("Нэмэх")');
  await expect(addEvidenceBtn).toBeVisible();
  await addEvidenceBtn.click();
  await page.fill('input[placeholder="Баримтын тайлбар..."]', 'Засварласан баримт');
  await page.fill('input[placeholder="жишээ: report_2024.pdf"]', 'fixed.pdf');
  await card.locator('button[type="submit"]:has-text("Нэмэх")').click();

  // Шинэ баримт хүлээгдэж буй — одоо ч хаагдахгүй
  await expect(closeBtn(page)).toBeDisabled();
  await page.click('button:has-text("Баталгаажуулах")');
  await expect(closeBtn(page)).toBeEnabled();
  await closeBtn(page).click();

  await expect(page.locator('text=Хаагдсан').first()).toBeVisible();
  const v = await storedViolation(page);
  expect(v.status).toBe('closed');
  expect(v.closedBy).toBeTruthy();
  // Татгалзсан баримт аудитын түүх болж үлдсэн
  const evs = v.actions[0].evidence as Ev[];
  expect(evs.length).toBe(2);
  expect(evs.some(e => e.approved === false)).toBe(true);
  expect(evs.some(e => e.approved === true)).toBe(true);
  await page.close();
});

// ── R4 (хаагдсан зөрчил) ──────────────────────────────────────────────────
test('R4. Хаагдсан зөрчилд баримт нэмэх, арга хэмжээ нэмэх боломжгүй', async () => {
  const page = await browser.newPage();
  await seed(page, [{
    ...violation('closed', [action('a1', 'completed', [evidence('e1', true)])]),
    closedDate: '2026-10-01', closedBy: 'Тест',
  }]);
  await page.goto(`${BASE}/violations/rv1`);
  await page.click('text=Арга хэмжээ a1');
  await expect(page.locator('button:has-text("Нэмэх")')).toHaveCount(0);
  await expect(closeBtn(page)).toHaveCount(0);
  await page.close();
});

// ── R5 (B5) ───────────────────────────────────────────────────────────────
test('R5. B5: «Баталгаажуулалт хүлээж буй» зөрчилд шинэ арга хэмжээ нэмэхэд төлөв «Хэрэгжиж байна» болно', async () => {
  const page = await browser.newPage();
  await seed(page, [violation('pending_verification', [action('a1', 'completed', [evidence('e1', true)])])]);
  await page.goto(`${BASE}/violations/rv1`);
  await expect(page.locator('span:has-text("Баталгаажуулалт хүлээж байна")')).toBeVisible();

  await page.click('button:has-text("Нэмэх")');
  await page.fill('textarea[placeholder="Ямар арга хэмжээ авах, юу хийх вэ..."]', 'Нэмэлт арга хэмжээ');
  await page.locator('input[type="date"]').fill('2099-12-31');
  await page.click('button[type="submit"]:has-text("Хадгалах")');

  await expect(page.locator('span:has-text("Хэрэгжиж байна")').first()).toBeVisible();
  await expect(closeBtn(page)).toBeDisabled();
  const v = await storedViolation(page);
  expect(v.actions.length).toBe(2);
  expect(v.status).toBe('in_progress');
  await page.close();
});

// ── R6 (JSON эвдрэл) ──────────────────────────────────────────────────────
for (const [name, raw] of [['эвдэрсэн JSON', '{bad json'], ['массив биш JSON', '{"a":1}']] as const) {
  test(`R6. ${name}: алдаа харуулж, хадгалсан өгөгдлийг дарж бичихгүй`, async () => {
    const page = await browser.newPage();
    await openBlank(page);
    await page.evaluate(({ K, raw }) => {
      localStorage.setItem(K.v, raw);
      localStorage.setItem(K.init, 'true');
    }, { K, raw });
    await page.goto(BASE);
    await expect(page.getByText('Алдаа гарлаа', { exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    const after = await page.evaluate(k => localStorage.getItem(k), K.v);
    expect(after).toBe(raw);
    await page.close();
  });
}

// ── R7 (инициалчлал) ──────────────────────────────────────────────────────
test('R7. initialized туг алга ч өгөгдөл байвал жишээ өгөгдлөөр дарж бичихгүй', async () => {
  const page = await browser.newPage();
  await seed(page, [violation('open', [])], { init: false });
  await page.goto(`${BASE}/violations`);
  await expect(page.locator('text=1 зөрчил олдлоо')).toBeVisible();
  const state = await page.evaluate(K => ({
    v: JSON.parse(localStorage.getItem(K.v) ?? '[]'),
    init: localStorage.getItem(K.init),
  }), K);
  expect(state.v.length).toBe(1);
  expect(state.v[0].id).toBe('rv1');
  expect(state.init).toBe('true');
  await page.close();
});

// ── R8 (B4 бичих алдаа) ───────────────────────────────────────────────────
test('R8. B4: localStorage бичих алдаа гарвал «хадгалагдсангүй» анхааруулга гарч, апп унахгүй', async () => {
  const page = await browser.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await seed(page, [violation('open', [])]);
  await page.goto(`${BASE}/tasks`);
  await page.waitForSelector('text=/\\d+ даалгавар олдлоо/');

  // Квот дүүрсэн нөхцөлийг дуурайх
  await page.evaluate(() => {
    const orig = Storage.prototype.setItem;
    (window as unknown as { __origSetItem: typeof orig }).__origSetItem = orig;
    Storage.prototype.setItem = function () {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
  await page.click('button:has-text("Шинэ даалгавар")');
  await page.fill('input[placeholder*="гарчиг"]', 'Квот тест');
  await page.locator('input[type="date"]').first().fill('2099-12-31');
  await page.click('button[type="submit"]:has-text("Хадгалах")');

  const alert = page.locator('[role="alert"]');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('хадгалагдсангүй');
  await expect(page.locator('text=1 даалгавар олдлоо')).toBeVisible(); // апп ажилласаар

  // Бичих боломж сэргэсний дараа дараагийн өөрчлөлт хадгалагдаж, анхааруулга арилна
  await page.evaluate(() => {
    Storage.prototype.setItem = (window as unknown as { __origSetItem: Storage['setItem'] }).__origSetItem;
  });
  await page.click('button:has-text("Шинэ даалгавар")');
  await page.fill('input[placeholder*="гарчиг"]', 'Сэргэлтийн тест');
  await page.locator('input[type="date"]').first().fill('2099-12-31');
  await page.click('button[type="submit"]:has-text("Хадгалах")');
  await expect(alert).toHaveCount(0);
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? '[]').length, K.t);
  expect(saved).toBe(2);
  expect(pageErrors).toEqual([]);
  await page.close();
});
