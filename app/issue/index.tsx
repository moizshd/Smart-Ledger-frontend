import { Issue } from '@/types/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';
import API from '../../utils/api';

export default function IssuedList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [query, setQuery] = useState('');

  const search = async () => {
    const res = await API.get(`/issues?name=${query}`);
    setIssues(res.data);
  };

  const exportCSV = async () => {
    const header = 'Name,Date,Quantity,Approving Authority,Category,Issue Time,Condition\n';
    const rows = issues.map(i => `${i.name},${i.date},${i.quantity},${i.approvingAuthority},${i.category},${i.issueTime},${i.condition}`).join('\n');
    const csv = header + rows;

    const fileUri = FileSystem.documentDirectory + 'issued_items.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri);
  };

  useEffect(() => {
    search();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Issued Items" />
        <Appbar.Action icon="download" onPress={exportCSV} />
      </Appbar.Header>
      <View style={styles.container}>
        <TextInput
          label="Search by Name / Category / Condition"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          style={styles.input}
        />
        <Button mode="contained" onPress={search} style={{ marginBottom: 16 }}>Search</Button>
        {issues.map(item => (
          <Card key={item._id} style={styles.card}>
            <Card.Title title={item.name} subtitle={`${item.category} - ${item.condition}`} />
            <Card.Content>
              <Text>{item.date} at {item.issueTime}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 12 },
});
