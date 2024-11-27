// eslint-disable-next-line no-undef
module.exports = {
  '**/*.py': [
    'poetry run -C backend ruff check --fix',
    'poetry run -C backend ruff format',
    () => 'pnpm run lint:python',
  ],
  '**/*.{ts,tsx}': [() => 'pnpm run lint:ui', () => 'pnpm run format:ui'],
  '.github/{workflows,actions}/**': ['actionlint']
};
