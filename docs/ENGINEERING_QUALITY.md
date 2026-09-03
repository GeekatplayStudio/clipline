# Engineering Quality Standard

## Purpose

This document defines what this repository guarantees, how those guarantees are verified, and where the prototype boundary remains. Planned capabilities are not described as implemented capabilities.

## Local quality gate

Run:

```bash
npm ci
npm run verify
```

The command enforces the 500-line module limit, performs strict TypeScript checking, runs the Vitest suite and scoped V8 coverage, compiles a production Vite build, and checks gzip bundle budgets. A failure in any stage produces a non-zero exit code.

## Module boundaries

Every `.ts` and `.tsx` module under `src`, `agents`, and `scripts` is limited to 500 physical lines. `npm run check:modules` enforces the rule. The limit is a guardrail rather than a design goal: modules should still be split earlier when they contain unrelated responsibilities.

Large features are divided by responsibility:

- Analytics has a coordinator plus separate overview, decision-flow, heatmap, literacy-radar, and tool-velocity views.
- Certification readiness separates page-level filtering and state from expandable framework dossiers and presentation helpers.
- The intake wizard separates navigation/submission from controlled step fields.
- The risk topology separates Three.js scene lifecycle from its React viewport and accessible controls.
- Seed workflows are grouped into business-unit modules and composed through one stable public export.

Coverage thresholds apply to `src/engine/**` and `src/store/**`: 90% for lines, statements, and functions, and 85% for branches. Component tests provide additional behavior coverage, but their files are not included in the core-domain percentage. Mutation testing targets the risk engine and runs separately with `npm run test:mutation` because it is substantially slower. Its enforced break threshold is 90%; the current suite kills 169 of 176 mutants for a 96.02% score.

## State and persistence invariants

- Stores own internal records and return cloned snapshots.
- Updates replace records instead of mutating shared seed objects.
- Reset operations create fresh copies of baseline data.
- Persisted JSON is treated as untrusted input and validated before use.
- Corrupt or incompatible browser state falls back safely to seed data.
- Conditional approval requires a non-empty condition; other decisions clear stale conditions.
- Review-date month arithmetic clamps to the final valid day of the target month.

Browser storage remains a prototype convenience. It does not provide authentication, authorization, encryption, concurrency control, record locking, comprehensive schema migration, or an immutable audit trail.

## Governance-data integrity

Automated tool scoring is preliminary triage, not vendor due diligence. Generated assessments mark certification, contractual retention, and model-training claims as unverified until a reviewer attaches authoritative evidence.

A production implementation should add evidence identifiers, controlled source documents, reviewer identity, verification and expiration dates, decision history, and explicit unknown/not-applicable states.

## Accessibility baseline

Reusable dialogs provide an accessible name, modal semantics, initial focus, focus containment, Escape handling, and focus restoration. Registry sorting uses keyboard-operable buttons and exposes sort direction. Workflow rows support Enter and Space activation. The WebGL topology exposes an accessible workflow list rather than making the canvas the only navigation route.

Automated tests complement but do not replace manual keyboard, screen-reader, zoom, contrast, and reduced-motion reviews.

## Export and deployment safety

CSV fields are consistently quoted and escaped, and formula-like values are neutralized before opening in spreadsheet software. Browser object URLs are revoked after use. JSON output is a point-in-time snapshot; it is not signed or cryptographically verifiable.

Deployment requires explicit account configuration. API failures propagate as process failures. The legacy Git deployment path requires `ALLOW_FORCE_DEPLOY=true` before replacing the deploy branch. Production deployment should use protected environments, short-lived credentials, review gates, provenance, and rollback automation.

## Performance expectations

The Three.js topology is lazy-loaded. Interaction flags do not reconstruct the entire scene, and geometry, materials, renderer resources, observers, listeners, and animation frames are released on teardown. Each JavaScript chunk is limited to 150 KiB gzip and total JavaScript to 280 KiB gzip by the local quality gate.

## Definition of done

1. Module-size checking, type checking, tests, scoped coverage, and production build pass locally.
2. New domain branches and failure modes have focused tests.
3. User-provided or persisted data is validated at its trust boundary.
4. Keyboard and assistive-technology behavior is considered for new UI.
5. Claims in UI and documentation are supported by implemented behavior.
6. Secrets, account identifiers, and environment-specific values are not committed.
7. Destructive deployment behavior requires explicit acknowledgement and fails closed.
