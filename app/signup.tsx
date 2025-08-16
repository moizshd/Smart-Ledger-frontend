import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import API from '../utils/api';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      await API.post('/auth/signup', { email, password });
      Alert.alert('Signup successful', 'Now log in.');
      router.replace('/login');
    } catch (err:any) {
      Alert.alert('Signup failed', err.response?.data?.message || 'Something went wrong');
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
          <Text variant="headlineMedium" style={styles.title}>Create account</Text>
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
          <Button mode="contained" onPress={handleSignup} loading={loading} disabled={loading} style={styles.cta}>
            Sign Up
          </Button>
          <Button mode="text" onPress={() => router.push('/login')}>Already have an account? Login</Button>
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