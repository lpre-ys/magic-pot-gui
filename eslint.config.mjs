import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

export default tseslint.config(
  {
    name: 'app/files-to-ignore',
    ignores: ['out/**', '.vite/**', 'coverage/**', 'submodules/**'],
  },

  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,tsx}'],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.electron,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      // import-x 4系の解決方式。tsconfig を見て exports フィールドまで解決できる
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
  },
)
