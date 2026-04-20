import nx from '@nx/eslint-plugin';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslint from '@angular-eslint/eslint-plugin';

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        ignores: [
            '**/dist',
            '**/vite.config.*.timestamp*',
            '**/vitest.config.*.timestamp*'
        ]
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true
            }
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    depConstraints: [
                        {
                            sourceTag: 'scope:shared',
                            onlyDependOnLibsWithTags: ['scope:shared']
                        },
                        {
                            sourceTag: 'scope:shop',
                            onlyDependOnLibsWithTags: [
                                'scope:shop',
                                'scope:shared'
                            ]
                        },
                        {
                            sourceTag: 'scope:api',
                            onlyDependOnLibsWithTags: [
                                'scope:api',
                                'scope:shared'
                            ]
                        },
                        {
                            sourceTag: 'type:data',
                            onlyDependOnLibsWithTags: ['type:data']
                        }
                    ]
                }
            ]
        }
    },
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.cts',
            '**/*.mts',
            '**/*.js',
            '**/*.jsx',
            '**/*.cjs',
            '**/*.mjs'
        ],
        // Override or add rules here
        rules: {
            '@angular-eslint/component-selector': 0,
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ]
        }
    }
];
