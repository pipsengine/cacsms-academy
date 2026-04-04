# Course Generation Audit

Date: 2026-04-04
Scope: Course structure, rendering flow, generation path, text pattern, and source coverage.

## Executive Summary

- Curriculum source of truth is `apps/web-client/src/lib/learning/curriculum.ts`.
- Current curriculum size is 42 weeks and 756 lessons.
- Lesson content runtime path uses `GET /api/learning/unit` and resolves in this order:
  1) static lesson registry,
  2) Gemini model output,
  3) deterministic fallback template.
- Static authored full-content coverage currently exists for Week 1 only (18 lessons).
- Quiz registry currently includes Week 1 only.

## Verified Runtime Pipeline

1. Lesson page route: `apps/web-client/src/app/our-courses/lesson/[slug]/page.tsx`
2. Fetch endpoint: `apps/web-client/src/app/api/learning/unit/route.ts`
3. Generator: `apps/web-client/src/lib/ai/forexCourseUnit.ts`
4. Static override registry: `apps/web-client/src/lib/ai/lessonContentRegistry.ts`
5. Curriculum metadata: `apps/web-client/src/lib/learning/curriculum.ts`
6. Quiz registry: `apps/web-client/src/lib/learning/chapterQuizRegistry.ts`

## Text Pattern and Formatting Rules

### Lesson Pattern (non-assignment)

- Markdown H1 title
- Required H2 sections:
  - Introduction
  - Key Concepts
  - Detailed Explanation
  - Example
  - Practical Application
  - Key Takeaways
- Detailed Explanation should include layered practical explanation and often H3 sub-sections.
- Practical Application uses explicit numbered execution steps.
- Key Takeaways uses bullet list format.

### Assignment Pattern (Saturday or explicit assignment)

- Objective of exercise
- Step-by-step instructions
- Expected learning outcome
- Plus the same standardized section structure for consistency in renderer UX.

### Rendering

- Markdown rendered with `react-markdown` + `remark-gfm`.
- Lesson headings (`##` / `###`) are parsed into navigable sections and slide-mode segments.

## Coverage Metrics

- Total weeks: 42
- Total lessons: 756
- Lessons per week: 18
- Static full-content lessons: 18
- Generated/fallback lessons: 738
- Static coverage ratio: 18 / 756 = 2.38%
- Weeks with chapter quiz: 1 / 42

## Per-Week Coverage Table

| Week | Module | Level | Lessons | Static | Generated/Fallback | Quiz |
|---:|---|---|---:|---:|---:|:---:|
| 1 | Forex Ground Zero | Beginner | 18 | 18 | 0 | Yes |
| 2 | Market Structure Basics | Beginner | 18 | 0 | 18 | No |
| 3 | Execution and Risk Control | Beginner | 18 | 0 | 18 | No |
| 4 | Confluence and Setup Quality | Intermediate | 18 | 0 | 18 | No |
| 5 | Liquidity and Institutional Behavior | Intermediate | 18 | 0 | 18 | No |
| 6 | Performance and Process Optimization | Intermediate | 18 | 0 | 18 | No |
| 7 | Advanced Chart Patterns | Advanced | 18 | 0 | 18 | No |
| 8 | Indicators, Oscillators, and Momentum Tools | Advanced | 18 | 0 | 18 | No |
| 9 | Price Action Mastery | Advanced | 18 | 0 | 18 | No |
| 10 | Fundamental Analysis and Economic Data | Advanced | 18 | 0 | 18 | No |
| 11 | Central Banks, Monetary Policy, and Rate Cycles | Advanced | 18 | 0 | 18 | No |
| 12 | Intermarket Analysis and Currency Correlation | Advanced | 18 | 0 | 18 | No |
| 13 | Smart Money Concepts Deep Dive | Professional | 18 | 0 | 18 | No |
| 14 | Order Blocks, Fair Value Gaps, and Breaker Blocks | Professional | 18 | 0 | 18 | No |
| 15 | Institutional Market Structure and Volume Analysis | Professional | 18 | 0 | 18 | No |
| 16 | Swing Trading and Position Trading Mastery | Professional | 18 | 0 | 18 | No |
| 17 | Advanced Risk, Drawdown, and Capital Management | Professional | 18 | 0 | 18 | No |
| 18 | Modern Forex Trading Stack and Career Operations | Professional | 18 | 0 | 18 | No |
| 19 | Quantum Forex Trading Foundations | Professional | 18 | 0 | 18 | No |
| 20 | Quantitative Signal Engineering for Forex | Professional | 18 | 0 | 18 | No |
| 21 | Algorithmic Execution and Liquidity Engineering | Professional | 18 | 0 | 18 | No |
| 22 | Multi-Strategy Portfolio and Alpha Combination | Professional | 18 | 0 | 18 | No |
| 23 | AI Agentic Trading and Autonomous Risk Controls | Professional | 18 | 0 | 18 | No |
| 24 | Institutional Macro Desk Simulation | Professional | 18 | 0 | 18 | No |
| 25 | Advanced Options-Based FX Hedging | Professional | 18 | 0 | 18 | No |
| 26 | High-Frequency Event Trading Lab | Professional | 18 | 0 | 18 | No |
| 27 | DeFi and Tokenized FX Market Structure | Professional | 18 | 0 | 18 | No |
| 28 | Cross-Border Payment Flow Trading Models | Professional | 18 | 0 | 18 | No |
| 29 | Institutional Liquidity Prediction with ML | Professional | 18 | 0 | 18 | No |
| 30 | Professional Certification and Final Competency Exam | Professional | 18 | 0 | 18 | No |
| 31 | Multi-Agent Autonomous Trading Lab | Professional | 18 | 0 | 18 | No |
| 32 | FX Prime Brokerage and Institutional Operations | Professional | 18 | 0 | 18 | No |
| 33 | Real-Time Risk Engine Design | Professional | 18 | 0 | 18 | No |
| 34 | Global Macro Trading Simulation and Graduation | Professional | 18 | 0 | 18 | No |
| 35 | Live Execution Mastery Lab | Professional | 18 | 0 | 18 | No |
| 36 | Prop-Firm and Funded Account Challenge Lab | Professional | 18 | 0 | 18 | No |
| 37 | Portfolio Scaling and Capital Growth Lab | Professional | 18 | 0 | 18 | No |
| 38 | Professional Mastery Assessment and Elite Track Graduation | Professional | 18 | 0 | 18 | No |
| 39 | Institutional Residency I: Live Desk Shadowing | Professional | 18 | 0 | 18 | No |
| 40 | Institutional Residency II: High-Pressure Decisioning | Professional | 18 | 0 | 18 | No |
| 41 | Institutional Residency III: Desk Placement Simulation | Professional | 18 | 0 | 18 | No |
| 42 | Final Institutional Residency Graduation | Professional | 18 | 0 | 18 | No |

## Risks and Gaps

- Marketing/overview copy can drift from actual curriculum size if hardcoded.
- Quiz coverage is not yet aligned with full chapter count.
- Static authored lesson coverage is concentrated in Week 1; all later weeks depend on AI/fallback quality and prompt constraints.

## Recommended Next Improvements

1. Expand chapter quiz coverage from Week 1 to all weeks in `chapterQuizRegistry.ts`.
2. Increase static authored lesson coverage for higher-priority weeks (at least all Beginner and Intermediate modules).
3. Add a lightweight automated check that compares displayed curriculum counts to runtime `courseCurriculum` totals.
4. Add optional per-week generation QA snapshots so fallback output quality can be reviewed before release.
