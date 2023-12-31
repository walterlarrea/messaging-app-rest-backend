module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	extends: ['eslint:recommended', 'prettier'],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		indent: ['error', 'tab'],
		// 'linebreak-style': [
		//   'error',
		//   'unix'
		// ],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
		eqeqeq: 'error',
		'no-trailing-spaces': 'error',
		'object-curly-spacing': ['error', 'always'],
		'arrow-spacing': ['error', { before: true, after: true }],
		'no-console': 0,
	},
}
