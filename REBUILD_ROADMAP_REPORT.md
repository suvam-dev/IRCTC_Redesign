# IRCTC Redesign Recovery Report

## Objective

Bring the project from an unstable mixed structure to a predictable, maintainable, and deployable web app with working navigation and end-to-end core flows.

## Current Problem Summary

- Folder structure and imports became inconsistent over time (`src/pages`, root `pages`, `style`, nested references).
- Shared UI pieces (navbar/footer/theme) were duplicated and routed through shifting paths.
- Page links and script imports broke whenever files were moved.
- CSS theme variables and hardcoded colors were mixed, making UI inconsistent.
- No stable quality gate exists to catch broken links/imports automatically.

## Target Architecture (Single Source of Truth)

Use one structure only:

```txt
/
  index.html
  pages/
    login.html
    forget.html
    wheremytrain.html
    searchresult.html
    checkout.html
    unreserved.html
  style/
    variables.css
    navbar.css
    footer.css
    login.css
    forget.css
    main.css
    checkout.css
    searchresult.css
  src/
    navbar.js
    search.js
    booking.js (optional next step)
    utils/
      paths.js (optional next step)
  assets/
  data/
```

## Scope for v1 (Must Work)

1. Home page loads without console errors.
2. Navbar renders and all links work from every page.
3. Train search flow works:
   - `wheremytrain` -> `searchresult`
4. Booking flow works:
   - `searchresult` -> `checkout`
5. Auth pages (`login`, `forget`) render and link correctly.
6. Footer renders without broken asset references.

## Phase Plan

## Phase 0: Safety and Baseline (0.5 day)

### Tasks

- Create branch: `git checkout -b rebuild-v1`.
- Document v1 scope in `README.md`.
- Capture current behavior and known issues in `docs/issues.md`.

### Deliverables

- Branch created.
- Baseline issue list written.

### Exit Criteria

- Team agrees on v1 scope and non-goals.

---

## Phase 1: Structural Unification (0.5-1 day)

### Tasks

- Move all active HTML into `/pages`.
- Move all active CSS into `/style`.
- Keep only one JS location (`/src`).
- Remove duplicate directories only after references are patched.

### Deliverables

- Canonical file tree.
- No duplicate active files in legacy folders.

### Exit Criteria

- `find` output matches chosen architecture.

---

## Phase 2: Path and Import Repair (0.5-1 day)

### Tasks

- Update all HTML CSS imports (`../style/...`, `./style/...`).
- Update all HTML script imports (`../src/...`, `./src/...`).
- Update in-page navigation links (`href=...`).
- Update JS redirects and route assumptions in `search.js` and `navbar.js`.
- Ensure assets resolve from both root and page level.

### Deliverables

- All paths resolve.
- No legacy path patterns remain.

### Verification Commands

```bash
rg -n "src/pages|../../../styles|../../../components|style/searchreusult"
rg -n "href=\"|src=\"" index.html pages/*.html
```

### Exit Criteria

- No missing local link/script/style paths.

---

## Phase 3: Navbar + Shared UI Stabilization (0.5 day)

### Tasks

- Keep one injected navbar/footer implementation.
- Confirm mobile hamburger open/close behavior.
- Ensure navbar links are relative-safe from root and `/pages`.
- Ensure logo/assets paths are stable.

### Deliverables

- One reliable shared navigation system.

### Exit Criteria

- Navbar works on every page (desktop + mobile).

---

## Phase 4: Core Flow Validation (0.5-1 day)

### Tasks

- Validate route search flow.
- Validate train number search flow.
- Validate data transfer into checkout.
- Validate auth navigation.
- Validate home CTAs.

### Test Cases

1. Open `index.html`, click navbar links.
2. Open `pages/wheremytrain.html`, submit route search, confirm result cards.
3. From results, click booking CTA, confirm checkout loads.
4. Open `pages/login.html`, go to forgot page, return/back works.

### Exit Criteria

- All v1 flows pass manually with no console errors.

---

## Phase 5: Theme Consistency Cleanup (0.5 day)

### Tasks

- Keep one theme token file (`style/variables.css`).
- Replace high-impact hardcoded colors with variables.
- Verify text/background contrast for readability.

### Exit Criteria

- Core pages visually consistent and readable.

---

## Phase 6: Quality Guardrails (0.5-1 day)

### Tasks

- Add linting/formatting (`ESLint`, `Prettier` or equivalent).
- Add smoke checks for:
  - page load
  - navbar links
  - search -> checkout
- Add CI workflow to run lint + smoke tests on push.

### Exit Criteria

- Broken paths/features are caught before merge.

## Approximate Timeline

- Fast recovery baseline: **2-3 days**
- Clean + tested v1: **3-5 days**

## Risk Register

1. Hidden stale links in inline JS.
   - Mitigation: `rg` scans + manual route clickthrough.
2. Deleting files too early.
   - Mitigation: remove duplicates only after passing path checks.
3. UI regressions after CSS consolidation.
   - Mitigation: migrate shared styles first, page styles second.
4. Inconsistent assumptions between JS modules.
   - Mitigation: centralize path logic in one helper.

## Definition of Done (DoD)

- One canonical folder structure.
- Zero broken local `href/src`.
- Navbar works from every page.
- Search and checkout flows work end-to-end.
- No console errors in primary flows.
- Duplicate legacy files removed.
- Documentation updated for future contributors.

## Suggested Commit Plan

1. `chore: unify folder structure to pages/style/src`
2. `fix: update all html/css/js import paths`
3. `fix: stabilize navbar routing across pages`
4. `fix: repair search and checkout navigation paths`
5. `chore: remove duplicate legacy files`
6. `chore: add lint and smoke checks`

## Operational Checklist (Quick Runbook)

1. `git checkout -b rebuild-v1`
2. Move files to final structure.
3. Patch imports and links.
4. Run path scans (`rg`) and missing-file checks.
5. Manually test all v1 flows.
6. Remove duplicate folders.
7. Commit in small logical chunks.
8. Add quality gates and finalize.

---

If needed, the next step is to convert this report into a concrete execution ticket board (Phase -> tasks -> owner -> ETA -> status) for daily tracking.
