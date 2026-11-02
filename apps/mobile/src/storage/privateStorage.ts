import type { StateStorage } from 'zustand/middleware';
// A prévia web é volátil: nenhum dado de saúde vai para localStorage.
const values = new Map<string, string>();
export const privateStorage: StateStorage = {
  getItem: name => values.get(name) ?? null,
  setItem: (name, value) => { values.set(name, value); },
  removeItem: name => { values.delete(name); },
};
export const createId = () => globalThis.crypto.randomUUID();
