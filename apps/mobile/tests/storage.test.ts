import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ data: new Map<string, string>(), keys: new Map<string, string>() }));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => mocks.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { mocks.data.set(key, value); },
    removeItem: async (key: string) => { mocks.data.delete(key); },
  },
}));
vi.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
  getItemAsync: async (key: string) => mocks.keys.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => { mocks.keys.set(key, value); },
}));
vi.mock('expo-crypto', () => ({
  getRandomBytesAsync: async (size: number) => crypto.getRandomValues(new Uint8Array(size)),
  randomUUID: () => crypto.randomUUID(),
}));
beforeEach(() => { mocks.data.clear(); mocks.keys.clear(); vi.resetModules(); });

it('criptografa os dados, restaura o conteúdo e usa nonce novo em cada gravação', async () => {
  const { privateStorage } = await import('../src/storage/privateStorage.native');
  await privateStorage.getItem('tirze-life-v1');
  const payload = JSON.stringify({ name: 'Dado privado', dose: 2.5 });
  await privateStorage.setItem('tirze-life-v1', payload);
  const first = mocks.data.get('tirze-life-v1')!;
  expect(first).not.toContain('Dado privado');
  expect(await privateStorage.getItem('tirze-life-v1')).toBe(payload);
  await privateStorage.setItem('tirze-life-v1', payload);
  expect(mocks.data.get('tirze-life-v1')).not.toEqual(first);
  expect(await privateStorage.getItem('tirze-life-v1')).toBe(payload);
});
it('rejeita adulteração do conteúdo cifrado', async () => {
  const { privateStorage } = await import('../src/storage/privateStorage.native');
  await privateStorage.getItem('tirze-life-v1');
  await privateStorage.setItem('tirze-life-v1', '{"test":1}');
  const envelope = JSON.parse(mocks.data.get('tirze-life-v1')!);
  envelope.ciphertext = (envelope.ciphertext.startsWith('00') ? 'ff' : '00') + envelope.ciphertext.slice(2);
  mocks.data.set('tirze-life-v1', JSON.stringify(envelope));
  await expect(privateStorage.getItem('tirze-life-v1')).rejects.toThrow();
});
it('não substitui histórico quando a chave foi perdida', async () => {
  const original = JSON.stringify({ nonce: '00'.repeat(12), ciphertext: '00'.repeat(30) });
  mocks.data.set('tirze-life-v1', original);
  const { privateStorage } = await import('../src/storage/privateStorage.native');
  await expect(privateStorage.getItem('tirze-life-v1')).rejects.toThrow('Chave local');
  await expect(privateStorage.setItem('tirze-life-v1', '{}')).rejects.toThrow('desbloqueado');
  expect(mocks.data.get('tirze-life-v1')).toEqual(original);
});
