// app/dashboard.tsx
import DatePickerField from '@/components/ui/DatePickerField';
import { Issue, Store } from '@/types/types';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Dialog, FAB, Portal, Text, TextInput } from 'react-native-paper';
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
        <Appbar.Action icon="store-plus" onPress={() => setDialogVisible(true)} />
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
                <Card.Title title={store.name} />
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

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogVisible(true)} label="Add Store" />

      {/* Add Store Dialog */}
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

      {/* Search Dialog */}
      <Portal>
        <Dialog visible={searchVisible} onDismiss={() => setSearchVisible(false)}>
          <Dialog.Title>Search Issued Items</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={filters.name}
              onChangeText={t => setFilters(p => ({ ...p, name: t }))}
              style={styles.input}
            />
            <TextInput
              label="Approving Authority"
              value={filters.approvingAuthority}
              onChangeText={t => setFilters(p => ({ ...p, approvingAuthority: t }))}
              style={styles.input}
            />
            <TextInput
              label="Condition"
              value={filters.condition}
              onChangeText={t => setFilters(p => ({ ...p, condition: t }))}
              style={styles.input}
            />
            <DatePickerField label="Date" value={filters.date} onChange={t => setFilters(p => ({ ...p, date: t }))} />
            <TextInput
              label="Issue Time"
              value={filters.issueTime}
              onChangeText={t => setFilters(p => ({ ...p, issueTime: t }))}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={clearFilters}>Clear</Button>
            <Button mode="contained" onPress={applyFilters}>Apply Filters</Button>
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
  cover: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { fontWeight: 'bold' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});
