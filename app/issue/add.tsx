import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';
import API from '../../utils/api';

export default function IssueForm() {
  const { item } = useLocalSearchParams<{ item: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    date: '',
    quantity: '',
    approvingAuthority: '',
    category: '',
    issueTime: '',
    condition: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await API.post('/issues', { ...form, item });
      Alert.alert('Success', 'Item issued');
      router.replace('/dashboard');
    } catch (err) {
      Alert.alert('Error', 'Issuance failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Issue Item" />
      </Appbar.Header>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.heading}>Issue Item</Text>
            <TextInput label="Name" value={form.name} onChangeText={t => handleChange('name', t)} style={styles.input} />
            <TextInput label="Date (YYYY-MM-DD)" value={form.date} onChangeText={t => handleChange('date', t)} style={styles.input} />
            <TextInput label="Quantity" value={form.quantity} onChangeText={t => handleChange('quantity', t)} keyboardType="numeric" style={styles.input} />
            <TextInput label="Approving Authority" value={form.approvingAuthority} onChangeText={t => handleChange('approvingAuthority', t)} style={styles.input} />
            <TextInput label="Category" value={form.category} onChangeText={t => handleChange('category', t)} style={styles.input} />
            <TextInput label="Issue Time" value={form.issueTime} onChangeText={t => handleChange('issueTime', t)} style={styles.input} />
            <TextInput label="Condition" value={form.condition} onChangeText={t => handleChange('condition', t)} style={styles.input} />
            <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
              Submit
            </Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  card: { borderRadius: 12 },
});
