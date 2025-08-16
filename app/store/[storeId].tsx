// app/store/[storeId].tsx
import { Category, Store } from '@/types/types';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Dialog, FAB, Portal, Text, TextInput } from 'react-native-paper';
import API from '../../utils/api';

export default function StoreScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [modalType, setModalType] = useState<'store' | 'category'>('store');

  const [formData, setFormData] = useState({ name: '', image: '' });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
  const [storeRes, catRes] = await Promise.all([
    API.get(`/stores?parent=${storeId}`),
    API.get(`/categories?store=${storeId}`)
  ]);
  setStores(storeRes.data);
  setCategories(catRes.data);
};


  useEffect(() => {
    fetchData();
  }, [storeId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: `data:image/jpeg;base64,${result.assets[0].base64}` }));
    }
  };

  const addStoreOrCategory = async () => {
    try {
      setLoading(true);
      if (modalType === 'store') {
        await API.post('/stores', { ...formData, parentStore: storeId });
      } else {
        await API.post('/categories', { ...formData, store: storeId });
      }

      setFormData({ name: '', image: '' });
      setDialogVisible(false);
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Store" />
        <Appbar.Action icon="plus" onPress={() => { setModalType('store'); setDialogVisible(true); }} />
        <Appbar.Action icon="folder-plus" onPress={() => { setModalType('category'); setDialogVisible(true); }} />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Text variant="titleLarge" style={styles.heading}>Sub-Stores</Text>
        {stores.map(store => (
          <Card key={store._id} style={styles.card} onPress={() => router.push(`/store/${store._id}`)}>
            <Card.Title title={store.name} subtitle={`Nested store`} />
          </Card>
        ))}

        <Text variant="titleLarge" style={styles.heading}>Categories</Text>
        {categories.map(category => (
          <Card key={category._id} style={styles.card} onPress={() => router.push(`/category/${category._id}`)}>
            <Card.Title title={category.name} subtitle={category.image ? 'Image available' : 'No image'} />
          </Card>
        ))}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => { setModalType('store'); setDialogVisible(true); }} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add {modalType === 'store' ? 'Store' : 'Category'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={`${modalType === 'store' ? 'Store' : 'Category'} Name`}
              value={formData.name}
              onChangeText={t => setFormData(p => ({ ...p, name: t }))}
              style={styles.input}
            />
            <Button mode="outlined" onPress={pickImage}>Pick Image</Button>
            {formData.image ? (
              <Image source={{ uri: formData.image }} style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 8 }} />
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={addStoreOrCategory} loading={loading} disabled={loading}>Submit</Button>
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
