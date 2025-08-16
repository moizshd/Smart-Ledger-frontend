import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token) => {
  await SecureStore.setItemAsync('token', token);
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
};
