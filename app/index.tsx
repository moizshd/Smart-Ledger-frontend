import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Text } from 'react-native'; // optional placeholder

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) router.replace('/dashboard');
        else router.replace('/login');
      } catch (e) {
        console.error('SecureStore error:', e);
        router.replace('/login');
      }
    };
    checkToken();
  }, []);

  return <Text>Redirecting...</Text>; // Optional fallback while checking
}
