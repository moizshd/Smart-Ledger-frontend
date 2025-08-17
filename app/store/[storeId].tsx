// app/store/[storeId].tsx
import { Category, Store } from '@/types/types';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, IconButton, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
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
  const [fabOpen, setFabOpen] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Edit/Delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; kind: 'store' | 'category' } | null>(null);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const fetchData = async () => {
    setFetching(true);
    try {
      const [storeRes, catRes] = await Promise.all([
        API.get(`/stores?parent=${storeId}`),
        API.get(`/categories?store=${storeId}`)
      ]);
      setStores(storeRes.data);
      setCategories(catRes.data);
    } finally {
      setFetching(false);
    }
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

  const openAdd = (kind: 'store' | 'category') => {
    setModalType(kind);
    setEditingId(null);
    setFormData({ name: '', image: '' });
    setDialogVisible(true);
  };

  const openEdit = (kind: 'store' | 'category', entity: { _id: string; name: string } & Partial<{ image: string }>) => {
    setModalType(kind);
    setEditingId(entity._id);
    setFormData({ name: entity.name, image: (entity as any).image || '' });
    setDialogVisible(true);
  };

  const addOrUpdate = async () => {
    try {
      setLoading(true);
      if (editingId) {
        if (modalType === 'store') {
          const res = await API.put(`/stores/${editingId}`, { name: formData.name, image: formData.image, parentStore: storeId });
          setStores(prev => prev.map(s => (s._id === editingId ? res.data : s)));
        } else {
          const res = await API.put(`/categories/${editingId}`, { name: formData.name, image: formData.image, store: storeId });
          setCategories(prev => prev.map(c => (c._id === editingId ? res.data : c)));
        }
      } else {
        if (modalType === 'store') {
          await API.post('/stores', { ...formData, parentStore: storeId });
        } else {
          await API.post('/categories', { ...formData, store: storeId });
        }
        fetchData();
      }
      setFormData({ name: '', image: '' });
      setEditingId(null);
      setDialogVisible(false);
    } catch (e:any) {
      const msg = e?.response?.data?.message || 'Operation failed';
      setSnackbar({ visible: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      setLoading(true);
      if (deleting.kind === 'store') {
        await API.delete(`/stores/${deleting.id}`);
        setStores(prev => prev.filter(s => s._id !== deleting.id));
      } else {
        await API.delete(`/categories/${deleting.id}`);
        setCategories(prev => prev.filter(c => c._id !== deleting.id));
      }
      setDeleting(null);
    } catch (e:any) {
      const msg = e?.response?.data?.message || 'Delete failed';
      setSnackbar({ visible: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Store" />
        <Appbar.Action icon="plus" onPress={() => { openAdd('store'); }} />
        <Appbar.Action icon="folder-plus" onPress={() => { openAdd('category'); }} />
      </Appbar.Header>

      {fetching ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator animating size="large" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <Text variant="titleLarge" style={styles.heading}>Sub-Stores</Text>
          {stores.map(store => (
            <Card key={store._id} style={styles.card} onPress={() => router.push(`/store/${store._id}`)}>
              {store.image ? <Card.Cover source={{ uri: store.image }} style={styles.cover} /> : null}
              <Card.Title
                title={store.name}
                subtitle={`Nested store`}
                right={() => (
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="pencil" onPress={() => openEdit('store', store)} />
                    <IconButton icon="trash-can" onPress={() => setDeleting({ id: store._id, kind: 'store' })} />
                  </View>
                )}
              />
            </Card>
          ))}

          <Text variant="titleLarge" style={styles.heading}>Categories</Text>
          {categories.map(category => (
            <Card key={category._id} style={styles.card} onPress={() => router.push(`/category/${category._id}`)}>
              {category.image ? <Card.Cover source={{ uri: category.image }} style={styles.cover} /> : null}
              <Card.Title
                title={category.name}
                subtitle={category.image ? 'Image available' : 'No image'}
                right={() => (
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="pencil" onPress={() => openEdit('category', category)} />
                    <IconButton icon="trash-can" onPress={() => setDeleting({ id: category._id, kind: 'category' })} />
                  </View>
                )}
              />
            </Card>
          ))}
        </ScrollView>
      )}

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          { icon: 'store-plus', label: 'Add Sub-Store', onPress: () => { openAdd('store'); } },
          { icon: 'folder-plus', label: 'Add Category', onPress: () => { openAdd('category'); } },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => { setDialogVisible(false); setEditingId(null); }}>
          <Dialog.Title>{editingId ? (modalType === 'store' ? 'Edit Store' : 'Edit Category') : (modalType === 'store' ? 'Add Store' : 'Add Category')}</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogScroll} contentContainerStyle={{ paddingBottom: 8 }}>
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
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setDialogVisible(false); setEditingId(null); }}>Cancel</Button>
            <Button mode="contained" onPress={addOrUpdate} loading={loading} disabled={loading}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete confirm */}
      <Portal>
        <Dialog visible={!!deleting} onDismiss={() => setDeleting(null)}>
          <Dialog.Title>Delete {deleting?.kind === 'store' ? 'Store' : 'Category'}</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this {deleting?.kind}?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleting(null)}>Cancel</Button>
            <Button mode="contained" onPress={confirmDelete} loading={loading} disabled={loading}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbar.visible} onDismiss={() => setSnackbar({ visible: false, message: '' })} duration={3000}>
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { marginBottom: 10 },
  card: { marginBottom: 10, borderRadius: 12 },
  input: { marginBottom: 12 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
  cover: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  dialogScroll: { maxHeight: 420 },
});
