import React, { useState } from 'react';
import { StyleSheet, Image, Alert, View, Text, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    // const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //
    // if (!permissionResult.granted) {
    //   Alert.alert('Permission required', 'Permission to access the gallery is required!');
    //   return;
    // }
    //
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   quality: 1,
    // });
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // higher res on iOS
      aspect: [4, 3],
    });

    console.log("got it");

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    // ImagePicker saves the taken photo to disk and returns a local URI to it
    let localUri = selectedImage.uri;
    console.log("URI", localUri);
    // let filename = localUri.split('/').pop();

    const type = 'image/jpeg';

    let formData = new FormData();
    formData.append('photo', { uri: localUri, name: selectedImage.filename, type });

    try {
      // Use fetch to send the request
      const response = await fetch('http://localhost:5000/photos', {
        method: 'POST',
        body: formData,
        header: {
          'content-type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        Alert.alert('Upload successful', JSON.stringify(responseData));
      } else {
        const errorData = await response.json();
        Alert.alert('Upload failed', errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.log('Upload failed', error);
      Alert.alert('Upload failed', error.message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <View style={styles.container}>
        <Pressable style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick an Image</Text>
        </Pressable>
        {selectedImage && (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        )}
        <Pressable style={styles.button} onPress={uploadImage}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </Pressable>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
});
