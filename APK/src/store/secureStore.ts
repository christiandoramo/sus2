import * as SecureStore from 'expo-secure-store';

export const saveData = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const getData = async (key: string) => {
  return await SecureStore.getItemAsync(key);
};

export const deleteData = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};
