import Store from "electron-store";
import { StoreType, StoreValueType } from "./types";

class StoreService {
  store: Store<StoreType> = new Store();

  /**
   * @param key string
   */
  get(key: string): StoreValueType {
    return this.store.get(key);
  }

  set(key: string, value?: StoreValueType): void {
    this.store.set(key, value);
  }
}

export default new StoreService();
