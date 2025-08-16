// app/dashboard.tsx
import { Store } from '@/types/types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Dialog, FAB, Portal, Text, TextInput } from 'react-native-paper';
import API from '../utils/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [summary, setSummary] = useState({ stores: 0, items: 0, issued: 0 });
  const [newStore, setNewStore] = useState({ name: '', image: '' });
  const [loading, setLoading] = useState(false);

  const fetchStores = async () => {
    const res = await API.get('/stores?parent=null')

    setStores(res.data);
    setSummary(prev => ({ ...prev, stores: res.data.length }));
  };

  useEffect(() => {
    fetchStores();
    API.get('/items').then(res => setSummary(prev => ({ ...prev, items: res.data.length })));
    API.get('/issues').then(res => setSummary(prev => ({ ...prev, issued: res.data.length })));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled && result.assets[0]) {
      setNewStore(prev => ({ ...prev, image: `data:image/jpeg;base64,${result.assets[0].base64}` }));
    }
  };

  const addStore = async () => {
    try {
      setLoading(true);
      await API.post('/stores', newStore);
      setDialogVisible(false);
      setNewStore({ name: '', image: '' });
      fetchStores();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Dashboard" subtitle={`Stores ${summary.stores} · Items ${summary.items} · Issued ${summary.issued}`} />
        <Appbar.Action icon="logout" onPress={() => router.replace('/login')} />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Text variant="titleLarge" style={styles.heading}>Your Stores</Text>

        {stores.map(store => (
          <Card key={store._id} style={styles.card} onPress={() => router.push(`/store/${store._id}`)}>
            <Card.Title title={store.name} subtitle={`ID: ${store._id}`} />
          </Card>
        ))}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogVisible(true)} label="Add Store" />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add Store</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Store Name"
              value={newStore.name}
              onChangeText={t => setNewStore(p => ({ ...p, name: t }))}
              style={styles.input}
            />
            <Button mode="outlined" onPress={pickImage}>Pick Image</Button>
            {newStore.image ? (
              <Image source={{ uri: newStore.image }} style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 8 }} />
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={addStore} loading={loading} disabled={loading}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { marginBottom: 10 },
  card: { marginBottom: 10, borderRadius: 12 },
  input: { marginBottom: 12 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
