# Developer Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a recruiter-focused developer portfolio at `/portfolio` and link it from the existing project hub.

**Architecture:** Render the portfolio as static Next.js App Router server components backed by one reviewed TypeScript data module. The experience documents and Graphify outputs are authoring evidence only; the application imports neither, preventing private source material from entering the client bundle or public assets.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-10-20-developer-portfolio-design.md`

## Global Constraints

- Add no dependencies, API routes, database tables, client state, CMS, contact form, analytics, or PDF generation.
- Keep all portfolio components as server components; do not add `'use client'`.
- Publish only the reviewed content copied into `portfolio-data.ts`; never import from `docs/experience` or `graphify-out`.
- Do not publish birth year, gender, phone numbers, detailed address, military history, family contacts, internal connection details, or source PDFs.
- Do not publish `[확인 필요]` values or unsupported claims such as percentage improvements, “zero errors,” or “uninterrupted.”
- Use the current blue visual language with white surfaces, dark text, and teal result accents.
- The first release contains no project screenshots because no reviewed image assets exist in the repository.

## Review Focus

- **Private source leakage:** the compiled page must contain none of the excluded personal or internal information; Task 1 owns the source scan and Task 5 repeats it after assembly.
- **Unsupported achievement claims:** all figures and results must trace to the approved sources and exclude verification placeholders; Tasks 1 and 3 own these checks.
- **Small-screen readability:** cards, timelines, and long technology labels must not overflow a 390 px viewport; Tasks 2–4 own responsive layout checks.
- **Navigation and accessibility:** section anchors, heading order, focus styles, external-link attributes, and reduced-motion behavior must work without JavaScript; Tasks 2 and 4 own these checks.
- **Existing hub regression:** the new card must preserve every existing project link and the root page must still build; Task 5 owns this check.

---

### Task 1: Reviewed Portfolio Content Model

**Files:**
- Create: `src/app/portfolio/portfolio-data.ts`
- Reference: `docs/superpowers/specs/2026-10-20-developer-portfolio-design.md`
- Reference: `graphify-out/GRAPH_REPORT.md`
- Reference: `docs/experience/경험/경험/이력서.md`
- Reference: `docs/experience/경험/경험/경력기술서.md`
- Reference: `docs/experience/경험/경험/경력기술서_1.md`
- Reference: `docs/experience/경험/경험/이직_어필_경험_6단계_정리.md`
- Reference: `docs/experience/경험/경험/프로젝트_경험_원장.md`

**Interfaces:**
- Produces: `Profile`, `PortfolioLinks`, `Highlight`, `Strength`, `CaseStudyData`, `TimelineItem`, `SkillGroup`, `EducationItem`, `CredentialGroup`, and `SideProject` exported TypeScript types.
- `Profile` contains `name`, `role`, `headline`, and `employer`; `PortfolioLinks` contains `email`, `github`, and `blog`.
- `Highlight` contains `value` and `label`; `Strength` contains `title`, `summary`, and `evidence`.
- Produces: `profile`, `links`, `highlights`, `strengths`, `caseStudies`, `careerTimeline`, `skillGroups`, `education`, `credentialGroups`, and `sideProjects` typed constants.
- `CaseStudyData` contains `slug`, `title`, `period`, `role`, `technologies`, `problem`, `decision`, `implementation`, and `result`.
- `TimelineItem` contains `year`, `title`, and `summary`; `SkillGroup` contains `label` and `items`.
- `EducationItem` contains `period`, `school`, `program`, and `status`; `CredentialGroup` contains `label` and `items`.
- `SideProject` contains `title`, `summary`, `href`, and `external`.

- [ ] **Step 1: Create the data module and exact public types**

Use the approved spec wording. Keep the three case studies in this order: 22-city CCTV synchronization, GeoSync/KRAS, Namwon integrated platform. Keep five yearly timeline entries for 2022–2026.

- [ ] **Step 2: Cross-check the data against its evidence**

Use `GRAPH_REPORT.md` to confirm the three narrative axes and the Markdown sources to confirm dates, technologies, and outcomes. Treat `프로젝트_경험_원장.md` as the final tie-breaker for detailed implementation claims.

- [ ] **Step 3: Run the content safety scan**

Run:

```powershell
rg -n "010-|1997년|광산구|병장|긴급|가족 연락처|\[확인 필요\]|오류 0건|무중단|대폭 향상" src/app/portfolio/portfolio-data.ts
```

Expected: no matches. The public email address is intentionally allowed.

- [ ] **Step 4: Lint the content module**

Run: `npx eslint src/app/portfolio/portfolio-data.ts`

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/portfolio-data.ts
git commit -m "feat: add reviewed portfolio content"
```

### Task 2: Portfolio Shell, Hero, and Experience Summary

**Files:**
- Create: `src/app/portfolio/page.tsx`
- Create: `src/components/portfolio/PortfolioHero.tsx`
- Create: `src/components/portfolio/ExperienceSummary.tsx`

**Interfaces:**
- Consumes: `Profile`, `PortfolioLinks`, `Highlight`, and `Strength` from Task 1.
- Produces: `PortfolioHero({ profile, links })`.
- Produces: `ExperienceSummary({ highlights, strengths, employer })`.
- Produces: static route metadata with title `양민준 | 백엔드·스마트시티/GIS 개발자`.

- [ ] **Step 1: Build the semantic page shell**

Create a server-rendered page with `header`, compact anchor navigation, `main`, and section positions in the approved order. Add route metadata with description `Java/Spring 기반 공공 정보시스템과 GIS·데이터 연계 경험을 소개하는 양민준의 개발자 포트폴리오입니다.`.

- [ ] **Step 2: Implement the hero**

Render the approved name, role, introduction, three action links, GitHub, and blog. Anchor links target `#projects`, `#career`, and `#contact`. External links use `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 3: Implement the experience summary**

Render the four evidence highlights, the current employer summary, and the three core strengths. Use one column on mobile and up to three columns on wider screens.

- [ ] **Step 4: Verify structure and types**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/page.tsx src/components/portfolio/PortfolioHero.tsx src/components/portfolio/ExperienceSummary.tsx
git commit -m "feat: add portfolio introduction"
```

### Task 3: Case Studies and Career Timeline

**Files:**
- Create: `src/components/portfolio/CaseStudy.tsx`
- Create: `src/components/portfolio/CareerTimeline.tsx`
- Modify: `src/app/portfolio/page.tsx`

**Interfaces:**
- Consumes: `CaseStudyData`, `TimelineItem`, `caseStudies`, and `careerTimeline` from Task 1.
- Produces: `CaseStudy({ study, index })`, where `index` supplies the visible two-digit sequence.
- Produces: `CareerTimeline({ items })`.

- [ ] **Step 1: Implement one reusable case-study presentation**

Render title, period, role, technologies, and four labeled blocks: 문제, 판단, 구현, 결과. Use semantic headings and ordered content rather than interactive tabs.

- [ ] **Step 2: Render exactly three featured studies**

Add the `#projects` section to the page and map `caseStudies` through `CaseStudy`. Add a small HTML/CSS flow marker for the four stages; mark decorative elements `aria-hidden="true"`.

- [ ] **Step 3: Implement the career timeline**

Add the `#career` section and render the five 2022–2026 entries. Keep timeline decoration separate from readable text and ensure long project names wrap.

- [ ] **Step 4: Re-run claim and type checks**

Run:

```powershell
rg -n "\[확인 필요\]|오류 0건|무중단|대폭 향상" src/app/portfolio src/components/portfolio
npx tsc --noEmit
```

Expected: the search returns no matches and TypeScript exits with code 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/page.tsx src/components/portfolio/CaseStudy.tsx src/components/portfolio/CareerTimeline.tsx
git commit -m "feat: add portfolio case studies and career"
```

### Task 4: Skills, Credentials, Projects, and Contact

**Files:**
- Create: `src/components/portfolio/Credentials.tsx`
- Create: `src/components/portfolio/PortfolioFooter.tsx`
- Modify: `src/app/portfolio/page.tsx`

**Interfaces:**
- Consumes: `skillGroups`, `education`, `credentialGroups`, `sideProjects`, and `links` from Task 1.
- Produces: `Credentials({ skillGroups, education, credentialGroups, sideProjects })`.
- Produces: `PortfolioFooter({ email, github, blog })`.

- [ ] **Step 1: Implement skills and resume details**

Render skill groups by work context, followed by education and prioritized development credentials. Collapse the three mechanical qualifications into the approved “other qualifications” group.

- [ ] **Step 2: Add selected personal projects and activities**

Link the public-job portal to `/public-job`, Flowerary to its GitHub repository, and the blog/study activity to the approved external destinations. Add one `/` link for the full project hub.

- [ ] **Step 3: Implement the contact footer**

Add the `#contact` anchor, `mailto:gnb1215@naver.com`, GitHub, and blog. Use visible focus styles and descriptive link text.

- [ ] **Step 4: Verify lint and accessibility markup**

Run:

```powershell
npx eslint src/app/portfolio/page.tsx src/components/portfolio
rg -n "target=\"_blank\"" src/components/portfolio src/app/portfolio
```

Expected: ESLint passes; every external-link occurrence is paired with `rel="noopener noreferrer"` in the same component.

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/page.tsx src/components/portfolio/Credentials.tsx src/components/portfolio/PortfolioFooter.tsx
git commit -m "feat: complete portfolio resume sections"
```

### Task 5: Project Hub Integration and Final Verification

**Files:**
- Modify: `src/app/page.tsx`
- Verify: `src/app/portfolio/page.tsx`
- Verify: `src/app/portfolio/portfolio-data.ts`
- Verify: `src/components/portfolio/*.tsx`

**Interfaces:**
- Consumes: the completed `/portfolio` route.
- Produces: a new first-position `PROJECTS` entry linking to `/portfolio`.

- [ ] **Step 1: Add the portfolio hub card**

Add a card titled `개발자 포트폴리오` with a concise career-focused description and the tags `Java/Spring`, `GIS`, and `Data Integration`. Preserve every existing project entry and link.

- [ ] **Step 2: Run the full privacy and placeholder audit**

Run:

```powershell
rg -n "010-|1997년|광산구|병장|긴급|가족 연락처|\[확인 필요\]|오류 0건|무중단|대폭 향상" src/app/portfolio src/components/portfolio
rg -n "docs/experience|graphify-out" src/app/portfolio src/components/portfolio
```

Expected: both searches return no matches.

- [ ] **Step 3: Run repository checks**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit with code 0 and the build lists `/portfolio` as a generated route.

- [ ] **Step 4: Perform responsive and keyboard review**

Open `/` and `/portfolio` at 390×844 and 1440×900. Verify no horizontal overflow, all anchor links reach the correct sections, headings are sequential, keyboard focus is visible, and external links open the intended destinations. Check reduced-motion mode once.

- [ ] **Step 5: Run the project performance audit**

Run: `npm run perf:audit`

Expected: the audit completes and its mobile/desktop summaries are recorded for handoff. Investigate only regressions introduced by the portfolio card or shared layout.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: link developer portfolio from hub"
```
