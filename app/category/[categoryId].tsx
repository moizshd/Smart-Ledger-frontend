// app/category/[categoryId].tsx
import { Issue, Item } from '@/types/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Appbar, Button, Card, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import API from '../../utils/api';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [modalAddItem, setModalAddItem] = useState(false);
  const [modalIssueItem, setModalIssueItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', quantity: '', condition: '' });
  const [filters, setFilters] = useState({ name: '', approvingAuthority: '', condition: '', date: '', issueTime: '' });

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [dropdownItems, setDropdownItems] = useState<{ label: string; value: string }[]>([]);

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    item: '',
    name: '',
    date: '',
    quantity: '',
    approvingAuthority: '',
    issueTime: '',
    condition: '',
  });

  const [loading, setLoading] = useState(false);

  // Fetch items
  const fetchItems = async () => {
    const res = await API.get(`/items?category=${categoryId}`);
    setItems(res.data);
  };

  // Fetch issues with filtered params
  const fetchIssues = async () => {
    const rawParams = { category: categoryId, ...filters };
    const filtered = Object.fromEntries(
      Object.entries(rawParams).filter(([_, v]) => v !== '')
    );
    const query = new URLSearchParams(filtered).toString();
    const res = await API.get(`/issues?${query}`);
    setIssues(res.data);
  };

  // Sync dropdown items when items load
  useEffect(() => {
    const formatted = items.map(i => ({ label: i.name, value: i._id }));
    setDropdownItems(formatted);
    if (formatted.length > 0 && !value) {
      setValue(formatted[0].value);
      setIssueForm(prev => ({ ...prev, item: formatted[0].value }));
    }
  }, [items]);

  // Initial data load
  useEffect(() => {
    fetchItems();
    fetchIssues();
  }, [categoryId]);

  const handleChangeItem = (field: keyof typeof newItem, v: string) => {
    setNewItem(prev => ({ ...prev, [field]: v }));
  };
  const handleChangeIssue = (field: keyof typeof issueForm, v: string) => {
    setIssueForm(prev => ({ ...prev, [field]: v }));
  };

  const addItem = async () => {
    try {
      setLoading(true);
      await API.post('/items', { ...newItem, quantity: Number(newItem.quantity), category: categoryId });
      setModalAddItem(false);
      setNewItem({ name: '', description: '', quantity: '', condition: '' });
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  const issueItem = async () => {
    try {
      setLoading(true);
      await API.post('/issues', { ...issueForm, category: categoryId });
      setModalIssueItem(false);
      setIssueForm({ item: '', name: '', date: '', quantity: '', approvingAuthority: '', issueTime: '', condition: '' });
      fetchIssues();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Category" />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Text variant="titleLarge" style={styles.heading}>Items</Text>
        {items.map(item => (
          <Card key={item._id} style={styles.card}>
            <Card.Title title={item.name} subtitle={`Qty: ${item.quantity}`} />
          </Card>
        ))}

        <View style={styles.row}>
          <Button mode="contained" onPress={() => setModalAddItem(true)}>Add Item</Button>
          <Button mode="outlined" onPress={() => setModalIssueItem(true)}>Issue Item</Button>
        </View>

        {/* FILTER SECTION */}
        <Text variant="titleLarge" style={styles.heading}>Filter Issued Items</Text>
        {['name', 'approvingAuthority', 'condition', 'date', 'issueTime'].map(field => (
          <TextInput
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            value={(filters as any)[field]}
            onChangeText={t => setFilters(p => ({ ...p, [field]: t }))}
            style={styles.input}
          />
        ))}
        <Button mode="contained" onPress={fetchIssues}>Apply Filters</Button>

        {/* ISSUED ITEMS LIST */}
        <Text variant="titleLarge" style={styles.heading}>Issued Items</Text>
        {issues.map(issue => (
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
      </ScrollView>

      {/* MODAL: ADD ITEM */}
      <Portal>
        <Dialog visible={modalAddItem} onDismiss={() => setModalAddItem(false)}>
          <Dialog.Title>Add Item</Dialog.Title>
          <Dialog.Content>
            {['name', 'description', 'quantity', 'condition'].map(field => (
              <TextInput
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(newItem as any)[field]}
                onChangeText={t => handleChangeItem(field as keyof typeof newItem, t)}
                style={styles.input}
                keyboardType={field === 'quantity' ? 'numeric' : 'default'}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalAddItem(false)}>Cancel</Button>
            <Button mode="contained" onPress={addItem} loading={loading} disabled={loading}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* MODAL: ISSUE ITEM */}
      <Portal>
        <Dialog visible={modalIssueItem} onDismiss={() => setModalIssueItem(false)}>
          <Dialog.Title>Issue Item</Dialog.Title>
          <Dialog.Content>
            {/* Dropdown Picker */}
            <View style={styles.dropdownContainer}>
              <DropDownPicker
                open={open}
                value={value}
                items={dropdownItems}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setDropdownItems}
                onChangeValue={(val) => handleChangeIssue('item', val || '')}
                placeholder="Select Item"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
              />
            </View>

            {['name', 'date', 'quantity', 'approvingAuthority', 'issueTime', 'condition'].map(field => (
              <TextInput
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                value={(issueForm as any)[field]}
                onChangeText={t => handleChangeIssue(field as keyof typeof issueForm, t)}
                style={styles.input}
                keyboardType={field === 'quantity' ? 'numeric' : 'default'}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalIssueItem(false)}>Cancel</Button>
            <Button mode="contained" onPress={issueItem} loading={loading} disabled={loading}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, },
  heading: { marginVertical: 10 },
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  input: { marginBottom: 12 },
  title: { fontWeight: 'bold' },
  dropdownContainer: { zIndex: 1000, marginBottom: 15 },
  dropdown: { },
  dropDownContainer: { },
});
