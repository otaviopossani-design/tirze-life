import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { gcm } from '@noble/ciphers/aes';
import { bytesToHex, hexToBytes, utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';
import type { StateStorage } from 'zustand/middleware';

const KEY_NAME = 'tirzelife.encryption.v1';
let readable = false;
let queue: Promise<unknown> = Promise.resolve();
async function key(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(KEY_NAME);
  if (existing) return hexToBytes(existing);
  // Não substituir a chave de um histórico já existente.
  if (await AsyncStorage.getItem('tirze-life-v1')) throw new Error('Chave local indisponível.');
  const generated = await Crypto.getRandomBytesAsync(32);
  await SecureStore.setItemAsync(KEY_NAME, bytesToHex(generated), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return generated;
}
// Serializa as gravações para impedir que uma escrita antiga substitua a nova.
function serial(task: () => Promise<void>) {
  const next = queue.then(task);
  queue = next.catch(() => undefined);
  return next;
}
export const privateStorage: StateStorage = {
  async getItem(name) {
    const encrypted = await AsyncStorage.getItem(name);
    if (!encrypted) { readable = true; return null; }
    const envelope: { nonce: string; ciphertext: string } = JSON.parse(encrypted);
    const plaintext = gcm(await key(), hexToBytes(envelope.nonce), utf8ToBytes(name))
      .decrypt(hexToBytes(envelope.ciphertext));
    const value = bytesToUtf8(plaintext);
    JSON.parse(value); // Falha fechada antes de permitir qualquer escrita.
    readable = true;
    return value;
  },
  setItem: (name, value) => serial(async () => {
    if (!readable) throw new Error('Histórico ainda não foi desbloqueado.');
    const nonce = await Crypto.getRandomBytesAsync(12);
    const ciphertext = gcm(await key(), nonce, utf8ToBytes(name)).encrypt(utf8ToBytes(value));
    await AsyncStorage.setItem(name, JSON.stringify({
      nonce: bytesToHex(nonce), ciphertext: bytesToHex(ciphertext),
    }));
  }),
  removeItem: name => serial(async () => { await AsyncStorage.removeItem(name); }),
};
export const createId = () => Crypto.randomUUID();
