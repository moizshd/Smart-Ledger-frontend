// Edit Store: app/store/edit.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import API from '../../utils/api';

export default function EditStoreScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    API.get(`/stores`).then(res => {
      const store = res.data.find((s: any) => s._id === storeId);
      setName(store?.name || '');
    });
  }, [storeId]);

  const updateStore = async () => {
    await API.put(`/stores/${storeId}`, { name });
    Alert.alert('Success', 'Store updated');
    router.replace('/dashboard');
  };

  const deleteStore = async () => {
    await API.delete(`/stores/${storeId}`);
    Alert.alert('Deleted', 'Store removed');
    router.replace('/dashboard');
  };

  return (
    <View style={styles.container}>
      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <Button title="Update Store" onPress={updateStore} />
      <Button title="Delete Store" onPress={deleteStore} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20,backgroundColor: '#fff' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
});
