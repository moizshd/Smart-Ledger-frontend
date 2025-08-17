// app/dashboard.tsx
import { Issue, Store } from '@/types/types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, IconButton, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import API from '../utils/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [summary, setSummary] = useState({ stores: 0, items: 0, issued: 0 });
  const [newStore, setNewStore] = useState({ name: '', image: '' });
  const [loading, setLoading] = useState(false);
  // loading flags
  const [fetchingStores, setFetchingStores] = useState(false);
  const [fetchingIssues, setFetchingIssues] = useState(false);

  // Edit/Delete state
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  // Search state
  const [searchVisible, setSearchVisible] = useState(false);
  const [filters, setFilters] = useState({ name: '', approvingAuthority: '', condition: '', date: '', issueTime: '' });
  const [issuedResults, setIssuedResults] = useState<Issue[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchStores = async () => {
    setFetchingStores(true);
    try {
      const res = await API.get('/stores?parent=null')

      setStores(res.data);
      setSummary(prev => ({ ...prev, stores: res.data.length }));
    } finally {
      setFetchingStores(false);
    }
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

  const openAddStore = () => {
    setEditingStoreId(null);
    setNewStore({ name: '', image: '' });
    setDialogVisible(true);
  };

  const openEditStore = (store: Store & Partial<{ image: string }>) => {
    setEditingStoreId(store._id);
    setNewStore({ name: store.name, image: (store as any).image || '' });
    setDialogVisible(true);
  };

  const submitStore = async () => {
    try {
      setLoading(true);
      if (editingStoreId) {
        const res = await API.put(`/stores/${editingStoreId}`, { name: newStore.name, image: newStore.image, parentStore: null });
        setStores(prev => prev.map(s => (s._id === editingStoreId ? res.data : s)));
      } else {
        await API.post('/stores', newStore);
        fetchStores();
      }
      setDialogVisible(false);
      setEditingStoreId(null);
      setNewStore({ name: '', image: '' });
    } catch (e:any) {
      const msg = e?.response?.data?.message || 'Operation failed';
      setSnackbar({ visible: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteStoreId) return;
    try {
      setLoading(true);
      await API.delete(`/stores/${deleteStoreId}`);
      setStores(prev => prev.filter(s => s._id !== deleteStoreId));
      setDeleteStoreId(null);
    } catch (e:any) {
      const msg = e?.response?.data?.message || 'Delete failed';
      setSnackbar({ visible: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setFetchingIssues(true);
    try {
      const rawParams = { ...filters } as Record<string, string>;
      const filtered = Object.fromEntries(Object.entries(rawParams).filter(([_, v]) => v !== ''));
      const query = new URLSearchParams(filtered).toString();
      const res = await API.get(`/issues?${query}`);
      setIssuedResults(res.data);
      setIsFiltered(true);
      setSearchVisible(false);
    } finally {
      setFetchingIssues(false);
    }
  };

  const clearFilters = () => {
    setFilters({ name: '', approvingAuthority: '', condition: '', date: '', issueTime: '' });
    setIssuedResults([]);
    setIsFiltered(false);
    setSearchVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Dashboard" subtitle={`Stores ${summary.stores} · Items ${summary.items} · Issued ${summary.issued}`} />
        <Appbar.Action icon="store-plus" onPress={openAddStore} />
        <Appbar.Action icon="magnify" onPress={() => setSearchVisible(true)} />
        <Appbar.Action icon="logout" onPress={() => router.replace('/login')} />
      </Appbar.Header>

      {!isFiltered ? (
        fetchingStores ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator animating size="large" />
          </View>
        ) : (
          <ScrollView style={styles.container}>
            <Text variant="titleLarge" style={styles.heading}>Your Stores</Text>

            {stores.map(store => (
              <Card key={store._id} style={styles.card} onPress={() => router.push(`/store/${store._id}`)}>
                {store.image ? (
                  <Card.Cover source={{ uri: store.image }} style={styles.cover} />
                ) : null}
                <Card.Title
                  title={store.name}
                  right={() => (
                    <View style={{ flexDirection: 'row' }}>
                      <IconButton icon="pencil" onPress={() => openEditStore(store as any)} />
                      <IconButton icon="trash-can" onPress={() => setDeleteStoreId(store._id)} />
                    </View>
                  )}
                />
              </Card>
            ))}
          </ScrollView>
        )
      ) : (
        fetchingIssues ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator animating size="large" />
          </View>
        ) : (
          <ScrollView style={styles.container}>
            <Text variant="titleLarge" style={styles.heading}>Issued Items</Text>
            {issuedResults.map(issue => (
              <Card key={issue._id} style={styles.card}>
                <Card.Content>
                  <Text style={styles.title}>{issue.name}</Text>
                  <Text>Qty: {issue.quantity}</Text>
                  <Text>Approved by: {issue.approvingAuthority}</Text>
                  <Text>Date: {issue.date} | Time: {issue.issueTime}</Text>
                  <Text>Condition: {issue.condition}</Text>
                </Card.Content>
              </Card>
            ))}
            <Button mode="text" onPress={clearFilters}>Clear filters</Button>
          </ScrollView>
        )
      )}

      <FAB icon="plus" style={styles.fab} onPress={openAddStore} label="Add Store" />

      {/* Add/Edit Store Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => { setDialogVisible(false); setEditingStoreId(null); }}>
          <Dialog.Title>{editingStoreId ? 'Edit Store' : 'Add Store'}</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogScroll} contentContainerStyle={{ paddingBottom: 8 }}>
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
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => { setDialogVisible(false); setEditingStoreId(null); }}>Cancel</Button>
            <Button mode="contained" onPress={submitStore} loading={loading} disabled={loading}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete confirm */}
      <Portal>
        <Dialog visible={!!deleteStoreId} onDismiss={() => setDeleteStoreId(null)}>
          <Dialog.Title>Delete Store</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this store?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteStoreId(null)}>Cancel</Button>
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
  title: { fontWeight: 'bold' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  dialogScroll: { maxHeight: 420 },
});
