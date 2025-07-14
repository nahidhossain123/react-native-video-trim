import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAsyncStorage = async (key:string,value: string) => {
  await AsyncStorage.setItem(key, value);
};

export const getAsyncStorage = async (key:string) => {
  return await AsyncStorage.getItem(key);
};
