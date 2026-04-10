import AsyncStorage from '@react-native-async-storage/async-storage';

const originalFetch = global.fetch;

global.fetch = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('auth_token');

  return originalFetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
};