export const PREDEFINED_STEPS = [
  { index: 0, title: 'Create release branch from main' },
  { index: 1, title: 'Update version number and CHANGELOG' },
  { index: 2, title: 'Run full test suite and fix all failures' },
  { index: 3, title: 'Complete code review and get merge approval' },
  { index: 4, title: 'Build and verify release artifacts' },
  { index: 5, title: 'Deploy to staging environment' },
  { index: 6, title: 'Run smoke tests on staging' },
  { index: 7, title: 'Get sign-off from QA and stakeholders' },
  { index: 8, title: 'Deploy to production and monitor' },
] as const;

export const STEP_COUNT = PREDEFINED_STEPS.length; // 9
