import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import API from '../utils/api';
import { saveToken } from '../utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post('/auth/login', { email, password });
      await saveToken(res.data.token);
      router.replace('/dashboard');
    } catch (err:any) {
      Alert.alert('Login failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>Welcome back</Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={styles.cta}>
            Login
          </Button>
          <Button mode="text" onPress={() => router.push('/signup')}>Don't have an account? Sign up</Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 120, height: 120 },
  card: { borderRadius: 16 },
  title: { marginBottom: 12 },
  input: { marginBottom: 12 },
  cta: { marginTop: 4 },
});