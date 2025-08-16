// Edit Category: app/category/edit.tsx
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Image, StyleSheet, TextInput, View } from 'react-native';
import API from '../../utils/api';

export default function EditCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    API.get(`/categories`).then(res => {
      const cat = res.data.find((c: any) => c._id === categoryId);
      setName(cat?.name || '');
      setImage(cat?.image || '');
    });
  }, [categoryId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const base64img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(base64img);
    }
  };

  const updateCategory = async () => {
    await API.put(`/categories/${categoryId}`, { name, image });
    Alert.alert('Updated', 'Category updated');
    router.back();
  };

  const deleteCategory = async () => {
    await API.delete(`/categories/${categoryId}`);
    Alert.alert('Deleted', 'Category deleted');
    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput value={name} onChangeText={setName} placeholder="Category Name" style={styles.input} />
      {image ? <Image source={{ uri: image }} style={{ width: 100, height: 100 }} /> : null}
      <Button title="Pick Image" onPress={pickImage} />
      <Button title="Update Category" onPress={updateCategory} />
      <Button title="Delete Category" onPress={deleteCategory} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20,backgroundColor: '#fff' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
});
