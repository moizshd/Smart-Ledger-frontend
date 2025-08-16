// File: app/item/edit.tsx
import { Item } from '@/types/types';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';
import API from '../../utils/api';

export default function EditItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [image, setImage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/items').then(res => {
      const i = res.data.find((d: Item) => d._id === itemId);
      if (i) {
        setItem(i);
        if ((i as any).image) setImage((i as any).image);
      }
    });
  }, [itemId]);

  const handleChange = (field: keyof Item, value: string) => {
    if (item) setItem(prev => ({ ...prev!, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, base64: true });
    if (!result.canceled && result.assets[0]) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const updateItem = async () => {
    try {
      setLoading(true);
      await API.put(`/items/${itemId}`, { ...item, image });
      Alert.alert('Updated', 'Item updated');
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    try {
      setLoading(true);
      await API.delete(`/items/${itemId}`);
      Alert.alert('Deleted', 'Item deleted');
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Item" />
      </Appbar.Header>
      <View style={{ padding: 16 }}>
        <Text>Loading...</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Item" />
      </Appbar.Header>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput value={item.name} onChangeText={t => handleChange('name', t)} label="Name" style={styles.input} />
            <TextInput value={item.description} onChangeText={t => handleChange('description', t)} label="Description" style={styles.input} />
            <TextInput value={item.condition} onChangeText={t => handleChange('condition', t)} label="Condition" style={styles.input} />
            <TextInput value={String(item.quantity)} onChangeText={t => handleChange('quantity', t as any)} label="Quantity" keyboardType="numeric" style={styles.input} />
            {image ? <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 8, alignSelf: 'center', marginVertical: 8 }} /> : null}
            <Button mode="outlined" onPress={pickImage} style={{ marginBottom: 8 }}>Upload Image</Button>
            <Button mode="contained" onPress={updateItem} loading={loading} disabled={loading} style={{ marginBottom: 8 }}>Update Item</Button>
            <Button mode="contained-tonal" onPress={deleteItem} disabled={loading}>Delete Item</Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 },
  card: { borderRadius: 12 },
});