# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `/portfolio` into a light, minimal layout with one violet accent, English period-terminated section headings, plain-text skill columns, and the three case studies presented as a vertical tab list.

**Architecture:** Keep the page a server-rendered App Router route backed by the unchanged `portfolio-data.ts`. One new client component, `CaseStudyTabs`, owns tab selection; every other portfolio component stays a server component. A shared `SectionHeading` server component renders the heading pattern used by every section.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4

**Supersedes:** In `docs/superpowers/plans/2026-10-20-developer-portfolio.md`, the constraints "do not add `'use client'`" (now: exactly one client component) and "use the current blue visual language" (now: violet accent, see Visual System).

## Global Constraints

- Add no dependencies, fonts, API routes, client state libraries, or images. Keep the Geist font already loaded in `src/app/layout.tsx`.
- Change no exported data or types in `src/app/portfolio/portfolio-data.ts`; this is a presentation-only change.
- `CaseStudyTabs` is the only file with `'use client'`. Pass it plain serializable data (`CaseStudyData[]`).
- Keep anchor ids `#projects`, `#career`, and `#contact`; external links and the hero menu point at them.
- Light theme only, matching the current page, which has no dark mode.
- Every case study's full text must be present in the server HTML, so recruiters without JavaScript, crawlers, and in-page search still reach it.
- The violet accent is a direction taken from a third-party Dribbble shot; do not reproduce that shot's exact colors, spacing, copy, or decorative framing.

## Visual System

| Token | Value | Use |
|---|---|---|
| Surface | `bg-white` page, `bg-slate-50` for alternating sections | Section backgrounds |
| Text | `text-slate-950` headings, `text-slate-600` body, `text-slate-500` meta | All copy |
| Accent | `violet-600` (`#7c3aed`, about 5.7:1 on white) | Heading period, active tab, links, primary button, check marks, focus ring |
| Accent tint | `violet-50` / `violet-200` | Primary button hover, tab hover, dividers |
| Lane colors | unchanged `blue-600`, `teal-600`, `amber-600` | `ProjectGantt` only; the colors encode the lane and must stay distinct |
| Radius | `rounded-full` buttons, no card borders elsewhere | Remove most card chrome |

**Section heading pattern** (`SectionHeading`):

```
Experience.            ← text-4xl sm:text-5xl font-black tracking-tight, "." in violet-600
문제 해결 과정을 보여주는 대표 프로젝트   ← mt-4 max-w-3xl text-slate-600
```

Remove the uppercase eyebrow labels (`Selected work`, `Career`, and so on); the English heading replaces them.

**Check-mark list item** (shared by tabs and archive): an inline SVG check, `size-4 shrink-0 text-violet-600`, `aria-hidden="true"`, followed by the text. Lists keep native `<ul>` semantics.

**Focus ring:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2` on every interactive element.

## Page Structure

| Order | Section (id) | Heading | Korean subtitle | Component |
|---|---|---|---|---|
| 1 | header | `백엔드 · 스마트시티/GIS 개발자.` | headline | `PortfolioHero` |
| 2 | `#strengths` | `Strengths.` | 반복해서 증명한 세 가지 역량 | `ExperienceSummary` |
| 3 | `#projects` | `Experience.` | 문제 해결 과정을 보여주는 대표 프로젝트 | `CaseStudyTabs` |
| 4 | `#all-projects` | `Projects.` | 대표 사례 외에 신규 구축과 운영·유지보수로 참여한 프로젝트 | `ProjectArchive` |
| 5 | `#career` | `Career.` | 개발에서 데이터 연계, GIS, 현장 운영으로 넓혀 온 역할 | `ProjectGantt` + `CareerTimeline` |
| 6 | `#skills` | `Skills.` | 업무에서 사용한 기술 | `Credentials` (skills) |
| 7 | — | `Education.` | 학력과 자격 | `Credentials` (education, credentials) |
| 8 | — | `Side Projects.` | 개인 프로젝트와 활동 | `Credentials` (side projects) |
| 9 | `#contact` | `Contact.` | existing copy | `PortfolioFooter` |

Hero menu: `Experience` → `#projects`, `Career` → `#career`, `Contact` → `#contact`.

## Review Focus

- **Tab accessibility:** WAI-ARIA tabs pattern, keyboard support, and visible focus; Task 3 owns this.
- **No-JS content:** all three case-study panels are in the server HTML; Task 3 and Task 6 check it.
- **Small-screen layout:** no horizontal page scroll at 390 px, including the tab list, the Gantt chart, and long technology names; Tasks 2–5.
- **Content parity:** every string rendered before the redesign is still rendered; only placement and styling change; Task 6.
- **Private source leakage:** rerun the content safety scan; Task 6.

---

### Task 1: Shared Section Heading

**Files:**
- Create: `src/components/portfolio/SectionHeading.tsx`

**Interface:**

```ts
type SectionHeadingProps = {
  id: string;          // heading id, referenced by the section's aria-labelledby
  title: string;       // English word(s) without the trailing period
  description?: string;
  level?: 'h1' | 'h2'; // default 'h2'
};
```

- [ ] **Step 1:** Render `<{level} id={id}>{title}<span className="text-violet-600">.</span></{level}>` and, when present, the description paragraph. Server component; no `'use client'`.
- [ ] **Step 2:** Run `npx eslint src/components/portfolio/SectionHeading.tsx`. Expected: exit code 0.

### Task 2: Hero and Strengths

**Files:**
- Modify: `src/components/portfolio/PortfolioHero.tsx`
- Modify: `src/components/portfolio/ExperienceSummary.tsx`
- Modify: `src/app/portfolio/page.tsx`

**Hero layout** (`lg:grid-cols-[1.4fr_1fr]`, single column below `lg`):

```
MINJUN.Y                                   Experience  Career  Contact
                                                                        
안녕하세요, 양민준입니다                         ┌──────────┬──────────┐
백엔드 · 스마트시티/GIS 개발자.                  │ 4년+     │ 22개 시군│
공공 정보시스템을 구축부터 운영까지 …            ├──────────┼──────────┤
대호이엔지 웹개발부서 · 주임 · 2022.06~현재      │ 10종+    │ 11개 시·군│
[대표 프로젝트 보기] (이메일 보내기)              └──────────┴──────────┘
GitHub ↗   기술 블로그 ↗
```

- [ ] **Step 1:** Replace the dark background, both decorative gradient layers, and the cyan pill with a white header. Use `SectionHeading` with `level="h1"` and `title={profile.role}`; keep `profile.name` in a small greeting line above it. `metadata.title` already carries the name, so the `<h1>` change does not lose it.
- [ ] **Step 2:** Add a `highlights: Highlight[]` prop to `PortfolioHero` and render it as a `<dl>` 2×2 grid: value `text-3xl font-black text-violet-600`, label `text-sm text-slate-600`, cells separated by `divide-violet-100` borders instead of dark cards.
- [ ] **Step 3:** Buttons: primary `bg-violet-600 text-white hover:bg-violet-700`; secondary `border border-slate-300 hover:border-violet-600`. Drop the `이력 보기` button; the menu already links `#career`.
- [ ] **Step 4:** In `ExperienceSummary`, remove the `highlights` prop and its grid, and render the employer line in the hero instead (move `employer` to a `PortfolioHero` line under the headline). Keep the duties sentence and the three strengths under `SectionHeading` `Strengths.`, as three plain columns (`md:grid-cols-3`) with a violet `01`–`03`, title, summary, and the evidence line in `text-slate-500`; no borders or shadows.
- [ ] **Step 5:** Update `page.tsx` props accordingly.
- [ ] **Step 6:** Run `npx eslint src/components/portfolio src/app/portfolio`. Expected: exit code 0.

### Task 3: Case Study Tabs (the one client component)

**Files:**
- Create: `src/components/portfolio/CaseStudyTabs.tsx`
- Delete: `src/components/portfolio/CaseStudy.tsx` (only `page.tsx` imports it)
- Modify: `src/app/portfolio/page.tsx`

**Layout** (`lg:grid-cols-[16rem_1fr]`):

```
Experience.
│ 전라남도 22개 시군 CCTV 동기화     백엔드·DB 구조 개선 및 운영 안정화
  GeoSync — 영광군 KRAS 연계        2025.08~2026.08 고도화
  남원 스마트시티 통합플랫폼          Java · Spring · PostgreSQL · Oracle · Batch Scheduler
                                    ✓ 문제  실패 건마다 로그가 한 행씩 …
                                    ✓ 판단  개별 장애를 반복해서 …
                                    ✓ 구현  실패 상세를 JSON 단위로 …
                                    ✓ 결과  22개 시군 동기화 운영을 …
```

- Desktop: vertical tab list with a `border-l-2 border-slate-200` rail; the active tab gets `border-violet-600 text-violet-600 font-bold` on the rail, inactive tabs `text-slate-500 hover:text-slate-900`.
- Below `lg`: the tab list becomes a horizontal row (`flex overflow-x-auto`, bottom rail instead of left rail) above the panel; the row scrolls inside itself so the page never scrolls sideways.
- Panel: title `text-xl font-bold` with `@ ` + role in violet, period `text-sm text-slate-500`, technologies as a `·`-separated plain line (no chips), then four check-mark items labeled `문제`, `판단`, `구현`, `결과` (labels `font-bold text-slate-900`, text `text-slate-600`). The result item keeps a stronger weight instead of the old teal box.

**Behavior** ([WAI-ARIA APG tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), automatic activation):

- `role="tablist"` with `aria-label="대표 프로젝트"`; each tab is a `<button role="tab">` with `id="case-tab-{slug}"`, `aria-selected`, `aria-controls="case-panel-{slug}"`, and roving `tabIndex` (0 on the selected tab, -1 on others).
- Every panel renders as `<div role="tabpanel" id="case-panel-{slug}" aria-labelledby="case-tab-{slug}" tabIndex={0}>`; inactive panels get the `hidden` attribute, so all text is in the server HTML.
- Keys on the tablist: ArrowDown/ArrowRight → next, ArrowUp/ArrowLeft → previous (both wrap), Home → first, End → last. Selection follows focus.
- State: one `useState<number>(0)`; no URL hash sync, no persistence.

- [ ] **Step 1:** Write `CaseStudyTabs({ studies }: { studies: CaseStudyData[] })` as specified. Import the type with `import type` so the data module is not bundled for the client.
- [ ] **Step 2:** In `page.tsx`, replace the `#projects` section body with `SectionHeading` (`Experience.`) and `<CaseStudyTabs studies={caseStudies} />`; delete `CaseStudy.tsx`.
- [ ] **Step 3:** Run `npm run lint`. Expected: exit code 0.
- [ ] **Step 4 (manual, `npm run dev`):** Tab into the list, use each arrow key, Home, and End; the panel and focus follow and the focus ring is visible. Check 390 px and 1280 px widths.
- [ ] **Step 5 (no-JS):** With JavaScript disabled in the browser, all three tab titles are visible and the first panel shows. Inactive panel text is present in the page source.

### Task 4: Projects and Career

**Files:**
- Modify: `src/components/portfolio/ProjectArchive.tsx`
- Modify: `src/components/portfolio/CareerTimeline.tsx`
- Modify: `src/components/portfolio/ProjectGantt.tsx` (container styling only)
- Modify: `src/app/portfolio/page.tsx`

- [ ] **Step 1:** `ProjectArchive`: `SectionHeading` `Projects.`; group label `text-lg font-bold` with the count in `text-slate-500`; each project drops its card and shows title, period, a `·`-separated technology line, and check-mark points. Keep `md:grid-cols-2` with `gap-x-12 gap-y-10`. The `기타` list uses the same check marks.
- [ ] **Step 2:** `#career` section: `SectionHeading` `Career.`. `ProjectGantt` keeps its logic and lane colors; change only the figure container to `rounded-2xl border border-slate-200` without the shadow.
- [ ] **Step 3:** `CareerTimeline`: year `text-2xl font-black text-violet-600`, a `w-px bg-violet-200` connector, and the title and summary as plain text without the card.
- [ ] **Step 4:** Run `npm run lint`. Expected: exit code 0.

### Task 5: Skills, Education, Side Projects, Contact

**Files:**
- Modify: `src/components/portfolio/Credentials.tsx`
- Modify: `src/components/portfolio/PortfolioFooter.tsx`

- [ ] **Step 1:** Skills (`id="skills"`, `Skills.`): `<dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">`; each `<dt>` `font-bold text-slate-950`, each item a plain `<li>` `text-slate-600` on its own line. No chips, cards, or rings.
- [ ] **Step 2:** Education (`Education.`): the two existing columns (학력, 자격) keep their content as plain lists; remove card borders; status stays emphasized with `font-semibold text-violet-700`.
- [ ] **Step 3:** Side projects (`Side Projects.`): keep the three link cards, since they are clickable targets, but restyle as `border border-slate-200 hover:border-violet-600`, title hover `text-violet-600`; activities and `전체 프로젝트 보기 →` link use the violet accent.
- [ ] **Step 4:** `PortfolioFooter`: white or `bg-slate-50` background with `SectionHeading` `Contact.`; links `text-violet-600 hover:underline`; keep the `mailto:` and `target="_blank" rel="noopener noreferrer"` attributes.
- [ ] **Step 5:** Replace every remaining `blue-*`, `cyan-*`, and `teal-*` class in `src/components/portfolio` with the Visual System tokens, except the lane colors in `ProjectGantt`.

### Task 6: Verification

- [ ] **Step 1:** `npm run lint` and `npm run build`. Expected: both exit 0.
- [ ] **Step 2:** Exactly one client component:

  ```powershell
  rg -l "'use client'" src/components/portfolio src/app/portfolio
  ```

  Expected: only `src/components/portfolio/CaseStudyTabs.tsx`.
- [ ] **Step 3:** Leftover accents:

  ```powershell
  rg -n "(blue|cyan|teal)-\d" src/components/portfolio src/app/portfolio
  ```

  Expected: matches only in the `LANES` constant of `ProjectGantt.tsx`.
- [ ] **Step 4:** Content safety scan (unchanged from the original plan):

  ```powershell
  rg -n "010-|1997년|광산구|병장|긴급|가족 연락처|\[확인 필요\]|오류 0건|무중단|대폭 향상" src/app/portfolio src/components/portfolio
  ```

  Expected: no matches.
- [ ] **Step 5:** After `npm run build && npm run start`, fetch `http://localhost:3000/portfolio` and confirm the HTML contains all three case-study titles and each `result` sentence.
- [ ] **Step 6:** Manual pass at 390 px and 1280 px: no horizontal page scroll, heading order h1 → h2 → h3 without skips, every section reachable from the hero menu, focus ring visible on all links, buttons, and tabs.
- [ ] **Step 7:** `npm run perf:audit` and compare the accessibility score with the current deployment; it must not drop.
