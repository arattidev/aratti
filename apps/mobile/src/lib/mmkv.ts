import Constants from "expo-constants";
import { MMKV } from "react-native-mmkv";

const isExpoGo = Constants.appOwnership === "expo";
const memoryStore = new Map<string, string>();

let mmkv: MMKV | null = null;

if (!isExpoGo) {
  try {
    mmkv = new MMKV({
      id: "aratti-storage",
    });
  } catch {
    mmkv = null;
  }
}

export { mmkv };

export const mmkvStorage = {
  setItem: (name: string, value: string) => {
    if (mmkv) {
      mmkv.set(name, value);
      return;
    }

    memoryStore.set(name, value);
  },
  getItem: (name: string) => {
    if (mmkv) {
      const value = mmkv.getString(name);
      return value ?? null;
    }

    return memoryStore.get(name) ?? null;
  },
  removeItem: (name: string) => {
    if (mmkv) {
      mmkv.delete(name);
      return;
    }

    memoryStore.delete(name);
  },
};
