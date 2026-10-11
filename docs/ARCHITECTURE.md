# ДТҮ ХЭМАБ веб систем — Архитектур ба урьдчилсан загвар

| Үзүүлэлт | Утга |
|---|---|
| Суурь commit | `3439c15` (branch `claude/dtu-hemab-web-continuation-fgdtj5`) |
| Баримтын төлөв | Одоогийн кодын бодит тайлбар + SharePoint шилжилтийн **санал** (батлагдаагүй) |
| Технологи | React 18 + TypeScript 5.6 + Vite 6 + Tailwind 3 + react-router 6 |
| Хадгалалт | `localStorage` (`LocalStorageStore : IStorageAsync`) |
| Нэвтрэлт | Байхгүй. Хэрэглэгчийн нэр `'Б. Дорж'` гэж кодонд бичигдсэн |

Тэмдэглэгээ: **[БАЙГАА]** = кодонд хэрэгжсэн, **[САНАЛ]** = хэрэгжээгүй, шийдвэр шаардлагатай.

---

## 1. Шалгалтын үр дүн (3439c15)

| Шалгалт | Үр дүн | Тайлбар |
|---|---|---|
| `npm run build` (tsc + vite) | ✅ Амжилттай | JS 261.8 kB (gzip 72.8 kB) |
| `npx playwright test` | ✅ 9/9 passed (21.3 с) | Энэ орчинд дахин ажиллуулж баталгаажуулсан. Файлд 10 сценари, 5+6 нэгтгэгдсэн тул 9 тест |
| Өгөгдөл хамгаалалт, хаалтын логикийн засвар | ⚠️ **Дуусаагүй** | 457443d-ээс хойш зөвхөн IStorageAsync refactor хийгдсэн. Нээлттэй асуудлыг §6-д харуулав |

---

## 2. Системийн ерөнхий бүтэц [БАЙГАА]

```mermaid
flowchart TB
  subgraph Browser["Хөтөч (нэг хэрэглэгч)"]
    UI["5 цэс — pages/*.tsx<br/>+ маягтууд components/*Form.tsx"]
    APP["App.tsx<br/>Router + props дамжуулалт"]
    HOOK["hooks/useApp.ts<br/>Төлөв (state) + бизнес логик"]
    IF["storage/types.ts<br/>IStorageAsync"]
    LS["storage/localStorageStore.ts"]
    DB[("localStorage<br/>dtu_hemab_violations_v1<br/>dtu_hemab_tasks_v1<br/>dtu_hemab_initialized_v1")]
  end
  UI -- "onAdd / onUpdate / onClose" --> APP --> HOOK
  HOOK -- "violations, tasks" --> APP -- props --> UI
  HOOK --> IF --> LS --> DB
```

Давхаргын зарчим: хуудсууд хадгалалтын талаар мэдэхгүй; бүх өөрчлөлт `useApp` → `store`-оор дамжина. Хадгалалтыг солих цэг нь ганцхан `src/storage/index.ts`.

---

## 3. 5 цэсийн дэлгэцийн бүтэц [БАЙГАА]

| # | Цэс (зам) | Үндсэн хэсгүүд | Үйлдэл | Дэлгэц |
|---|---|---|---|---|
| 1 | Хяналтын самбар (`/`) | Зөрчлийн статистик (нийт, нээлттэй, хэрэгжиж буй, баталгаажуулалт хүлээж буй, энэ сар хаасан, хугацаа хэтэрсэн); Даалгаврын статистик; Хүндрэлтэй зөрчлүүд; Хугацаа хэтэрсэн арга хэмжээ; анхааруулгын зурвас | Зөвхөн харах, холбоосоор шилжих | [1-dashboard.png](screens/1-dashboard.png) |
| 2 | Зөрчлийн бүртгэл (`/violations`) | Хайлт (код, тайлбар, байршил); шүүлтүүр: статус, ноцтой байдал; карт жагсаалт + арга хэмжээний явцын мөр | Шинэ зөрчил, засах (хаагдаагүй үед) | [2-violations.png](screens/2-violations.png) |
| 2б | Зөрчлийн дэлгэрэнгүй (`/violations/:id`) | Толгой мэдээлэл, зөрчсөн дүрэм; залруулах арга хэмжээний жагсаалт; нотлох баримт (батлах/татгалзах); «Хаах» товч + шалтгаан | Арга хэмжээ нэмэх/засах, явц/биелэлт, баримт нэмэх, батлах, хаах | [2b-violation-detail.png](screens/2b-violation-detail.png) |
| 3 | Үүрэг даалгавар (`/tasks`) | Хайлт (нэр, тайлбар, хариуцагч); шүүлтүүр: статус, яаралтай байдал; жагсаалт, холбоотой зөрчил | Шинэ даалгавар, засах, статус солих | [3-tasks.png](screens/3-tasks.png) |
| 4 | Арга хэмжээний төлөвлөгөө (`/actions`) | Бүх зөрчлийн арга хэмжээг статусаар бүлэглэсэн (хүлээгдэж буй, хэрэгжиж буй, баталгаажуулалт хүлээж буй, хугацаа хэтэрсэн, биелсэн) | Зөвхөн харах | [4-action-plan.png](screens/4-action-plan.png) |
| 5 | Хугацаа хэтэрсэн (`/overdue`) | Хугацаа хэтэрсэн зөрчил, арга хэмжээ, даалгавар — 3 хэсэг, нийт тоо | Зөвхөн харах | [5-overdue.png](screens/5-overdue.png) |

Маягтын заавал бөглөх талбарууд:

- **Зөрчил:** шалгалтын огноо, хаах хугацаа, шалгалтын төрөл, шалгагч, хариуцагч, байршил, ангилал, ноцтой байдал, тайлбар (+ зөрчсөн дүрэм — заавал биш)
- **Арга хэмжээ:** тайлбар, хариуцагч, биелэх хугацаа (+ тэмдэглэл)
- **Даалгавар:** гарчиг, хариуцагч, дуусах хугацаа, зэрэглэл, ангилал (+ тайлбар, холбоотой зөрчил, шошго)
- **Нотлох баримт:** төрөл (баримт/зураг/тайлан), тайлбар, файлын **нэр**. Файл өөрөө хавсаргагдахгүй — зөвхөн нэр хадгалагдана.

---

## 4. Өгөгдлийн загвар ба мэдээллийн урсгал [БАЙГАА]

```mermaid
erDiagram
  VIOLATION ||--o{ CORRECTIVE_ACTION : "actions[] (дотор шигтгэсэн)"
  CORRECTIVE_ACTION ||--o{ EVIDENCE : "evidence[] (дотор шигтгэсэн)"
  TASK }o--o| VIOLATION : "violationId (заавал биш)"
  VIOLATION {
    string id
    string code "ЗР-YYYY-NNN"
    enum severity
    enum status
    date dueDate
  }
  CORRECTIVE_ACTION {
    string id
    enum status
    int progress
    date dueDate
  }
  EVIDENCE {
    string id
    enum type
    string fileName
    bool approved
  }
  TASK {
    string id
    enum priority
    enum status
    date dueDate
  }
```

### 4.1 Зөрчлийн амьдралын мөчлөг

```mermaid
stateDiagram-v2
  [*] --> open: Зөрчил бүртгэх (код автоматаар)
  open --> in_progress: Эхний арга хэмжээ нэмэх
  in_progress --> pending_verification: Бүх арга хэмжээ «Биелсэн»
  pending_verification --> closed: Хаах — UI шалгуур: бүх арга хэмжээ биелсэн, бүх баримт батлагдсан
  closed --> [*]
```

### 4.2 Нэг үйлдлийн урсгал (жишээ: арга хэмжээ биелүүлэх)

```mermaid
sequenceDiagram
  actor U as Хэрэглэгч
  participant P as ViolationDetail
  participant H as useApp
  participant S as store (IStorageAsync)
  participant L as localStorage
  U->>P: «Биелсэн» дарна
  P->>H: onUpdateActionStatus(vId, aId, {status:'completed'})
  H->>H: setViolations(...) — бүгд биелсэн бол status='pending_verification'
  H-->>P: шинэ violations (re-render)
  H->>S: useEffect → saveViolations(БҮХ массив)
  S->>L: setItem(JSON)
```

Онцлог: хадгалалт нь **бүх массивыг дахин бичих** зарчимтай (item-level биш). localStorage-д тохирох боловч SharePoint-д тохирохгүй (§5.3).

---

## 5. Ирээдүйн SharePoint архитектур [САНАЛ — батлагдаагүй]

### 5.1 Зорилтот бүтэц

```mermaid
flowchart LR
  subgraph Client["React SPA (одоогийн UI хэвээр)"]
    HOOK2[useApp] --> IF2[IStorageAsync v2<br/>item-level]
    IF2 --> SPS[SharePointStore]
    MSAL[MSAL.js<br/>Entra ID нэвтрэлт] --> SPS
  end
  SPS -- "Graph REST + access token" --> G[Microsoft Graph]
  subgraph SP["SharePoint сайт (HSE)"]
    L1[(HSE_Violations)]
    L2[(HSE_Actions)]
    L3[(HSE_Tasks)]
    D1[[HSE_Evidence<br/>баримтын сан]]
  end
  G --> L1 & L2 & L3 & D1
  SP --> PA[Power Automate<br/>сануулга, хугацаа хэтрэлт]
  SP --> PBI[Power BI тайлан]
```

### 5.2 Жагсаалтын санал (шигтгэсэн массивыг салгана)

| Жагсаалт | Гол багана | Холбоос |
|---|---|---|
| HSE_Violations | Code, InspectionDate, InspectionType, Inspector, Location, Category, Severity, Status, DueDate, AssignedTo (Person), Regulation, ClosedDate, ClosedBy (Person) | — |
| HSE_Actions | Description, Responsible (Person), DueDate, CompletedDate, Status, Progress, VerifiedBy, Notes | ViolationId (Lookup) |
| HSE_Evidence (Document library) | Файл, EvidenceType, Description, Approved, ApprovedBy, ApprovedDate, RejectedReason | ActionId (Lookup) |
| HSE_Tasks | Title, Description, AssignedTo (Person), DueDate, Priority, Status, Category, Tags | ViolationId (Lookup, заавал биш) |

Шүүлтүүрт ордог багануудыг (Status, DueDate, ViolationId) **индексжүүлэх** — 5000 мөрийн list view threshold-оос хамгаална.

### 5.3 Шилжихээс өмнө шийдэх архитектурын асуудлууд

| # | Асуудал | Яагаад чухал | Санал |
|---|---|---|---|
| A1 | `saveViolations(бүх массив)` | SharePoint-д нэг өөрчлөлт бүрд бүх мөрийг дахин бичнэ → Graph throttling (429), олон хэрэглэгч бие биенийхээ өөрчлөлтийг дарж бичнэ | `IStorageAsync`-ийг item-level болгох: `createViolation`, `updateViolation(id, patch, etag)`, `createAction`, `addEvidence(file)` г.м. **Энэ нь одоогийн интерфейсийг өөрчилнө — зөвшөөрөл шаардлагатай** |
| A2 | Код (`ЗР-YYYY-NNN`) клиент дээр тооцоолох | Хоёр хэрэглэгч зэрэг бүртгэвэл давхардана | Power Automate эсвэл SharePoint ID-д суурилсан дугаарлалт (сервер тал) |
| A3 | Давхцах засварын хамгаалалт байхгүй | Сүүлд хадгалсан нь ялна | Graph `If-Match: eTag` → 412 үед хэрэглэгчид мэдэгдэх |
| A4 | Нэвтрэлт, эрх байхгүй (`'Б. Дорж'` hardcode) | Хэн баталсан, хэн хаасныг нотлох боломжгүй — ISO 45001 7.5 баримтжуулсан мэдээлэлд сул | MSAL.js + Entra app registration; Graph эрх `Sites.Selected` (зөвхөн HSE сайтад); үүрэг: Бүртгэгч / Хариуцагч / Баталгаажуулагч |
| A5 | Нотлох баримт = зөвхөн файлын нэр | Аудитын нотолгоо болохгүй | HSE_Evidence баримтын сан руу бодит файл байршуулах |
| A6 | Офлайн / уурхайн сүлжээ | Төмөртэй, Төмөр толгойн сүлжээний чанар **мэдээлэл дутуу** | Хэрэгцээг тодорхойлсны дараа шийдэх; эхний шатанд онлайн-only |

### 5.4 Шилжилтийн дараалал (санал)

1. §6-ийн хаалтын логик, өгөгдөл хамгаалалтын засвар (localStorage дээр, тесттэй)
2. `IStorageAsync` v2 (item-level) — `LocalStorageStore`-оор эхлээд хэрэгжүүлж, 9 E2E тест ногоон байх
3. SharePoint сайт, 4 жагсаалт/сан үүсгэх, индекс тохируулах (IT-тэй)
4. Entra app registration + MSAL нэвтрэлт
5. `SharePointStore` + ETag, алдааны боловсруулалт
6. Power Automate (код олгох, сануулга), Power BI холболт

---

## 6. Нээлттэй асуудлууд (кодоор баталгаажуулсан) — засвар хийгдээгүй

| # | Асуудал | Байршил | Нөлөө |
|---|---|---|---|
| B1 | Арга хэмжээг нотлох баримтгүйгээр «Биелсэн» болгож, зөрчлийг хааж болно (`[].every(...)` = `true`) | `src/pages/ViolationDetail.tsx:326-329` | Нотолгоогүй хаалт — аудитын эрсдэл |
| B2 | Татгалзсан баримттай арга хэмжээ «Биелсэн» болсон бол шинэ баримт нэмэх товч нуугдана, хаалт байнга хаагдана (гацаа) | `ViolationDetail.tsx` (баримт нэмэх нь `status !== 'completed'` үед л) | Зөрчил хаагдах боломжгүй болно |
| B3 | Хаах шалгуур зөвхөн UI-д; `closeViolation` hook-д шалгалтгүй | `src/hooks/useApp.ts` `closeViolation` | Өөр замаар дуудвал шалгуургүй хаагдана |
| B4 | `localStorage.setItem` синхрон exception (квот дүүрэх) `.catch()`-д баригдахгүй | `src/storage/localStorageStore.ts` `save*` | Хадгалагдаагүй байхад хэрэглэгч мэдэхгүй / апп унах |
| B5 | `pending_verification` төлөвтэй зөрчилд шинэ арга хэмжээ нэмэхэд төлөв буцаж `in_progress` болохгүй | `useApp.ts` `addAction` | Статистик буруу |
| B6 | Өгөгдлийн схемийн хувилбар/шилжүүлэлт, экспорт/нөөц байхгүй | `storage/*` | Хөтчийн өгөгдөл устгавал бүх бүртгэл алга болно |
| B7 | Огноо `mn-MN` locale-оор форматлагдахгүй, MM/DD/YYYY болон англиар харагдана (Chromium) | `utils/helpers.ts` `formatDate`, `Layout.tsx` | Дэлгэцийн зураг дээр баталгаажсан; UX |

Эдгээрийг засах эсэх, дарааллыг хэрэглэгч/хянагч батална.
