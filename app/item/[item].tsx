import { Item } from '@/types/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';
import API from '../../utils/api';

export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    API.get(`/items`).then(res => {
      const found = res.data.find((i: Item) => i._id === itemId);
      setItem(found);
    });
  }, [itemId]);

  if (!item) return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Item" />
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
        <Appbar.Content title="Item" />
      </Appbar.Header>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title={item.name} />
          <Card.Content>
            <Text>Description: {item.description}</Text>
            <Text>Condition: {item.condition}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </Card.Content>
        </Card>
        <Button mode="contained" onPress={() => router.push(`/issue/add?item=${item._id}`)}>
          Issue Item
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { marginBottom: 16, borderRadius: 12 },
});