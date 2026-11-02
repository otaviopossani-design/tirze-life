export default { esbuild: { tsconfigRaw: { compilerOptions: { target: 'ES2022', useDefineForClassFields: true } } }, test: { include: ['tests/**/*.test.ts'], environment: 'node' } };
