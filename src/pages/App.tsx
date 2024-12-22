import NoImage from '../assets/images/no-image.png'
import ImageCard from '../components/ImageCard'
import WallpaperSettings from '../components/WallpaperSettingsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker, {types} from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import DeviceWallpaper from "react-native-device-wallpaper";

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const saveImages = async (images: string[]) => {
    try {
      await AsyncStorage.setItem('imageArray', JSON.stringify(images));
      console.log('Images saved!');
    } catch (error) {
      console.error('Failed to save images:', error);
    }
  };
  
const loadImages = async () => {
    try {
        const savedImages = await AsyncStorage.getItem('imageArray');
        if (savedImages)
        return JSON.parse(savedImages);
        return [];
    } catch (error) {
        console.error('Failed to load images:', error);
    }
};

const saveFileToAppStorage = async (uri: string, fileName: string): Promise<string> => {
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // App-specific storage
  try {
    await RNFS.copyFile(uri, destinationPath);
    console.log(`File copied to: ${destinationPath}`);
    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

function App(): React.JSX.Element {
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  
  const pickImageAsync = async () => {
    try {
      let tempArray: string[] = await loadImages();
    
      const results = await DocumentPicker.pick({
        type: [types.images],
        allowMultiSelection: true,
      });

      await Promise.all(
        results.map(async (file) => {
          const savedPath = await saveFileToAppStorage(file.uri, file.name!);
          tempArray.push(`file://${savedPath}`);
        })
      );

      console.log("selected files successfully: ", tempArray);
      
      setImageArray(tempArray);
      saveImages(tempArray);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled the picker');
      } else {
        console.error('File picker error:', err);
      }
    }
  };
  
  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const removeImage = async (urlToRemove: string) =>{
    try{
      await RNFS.unlink(urlToRemove.substring(7));
      let tempArray: string[] = imageArray.filter(uri => uri != urlToRemove);
      setImageArray(tempArray);
      await saveImages(tempArray);
    }catch(err){
      console.error("Error occured while file deletion: ", err);
    }
  };
  
  const setWallpaper = async (duration: string, isRandom: boolean, screen: string) => {
    if(screen==null)
      Alert.alert("Please select a screen to apply the wallpaper on");
    else
      try {
        await AsyncStorage.setItem('isRandom', JSON.stringify(isRandom));
        await AsyncStorage.setItem('screen', JSON.stringify(screen));
        await AsyncStorage.setItem('lastImageIndex', JSON.stringify(0));        
        
        const setWallResult = screen=='HOME'? await DeviceWallpaper.setWallPaper(imageArray[0]) :
                              screen=='LOCK'? await DeviceWallpaper.setLockScreen(imageArray[0]):
                              await DeviceWallpaper.setBoth(imageArray[0]);

        console.log("Wallpaper result: ",setWallResult);

        onModalClose();
      } catch (error) {
        console.error('Failed to set wallpapers:', error);
      }
  };

  useEffect(()=>{
    const fetchImages = async () => {
      const defImageArray = await loadImages();
      setImageArray(defImageArray);
    };

    fetchImages();
  },[])
  
  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle={"default"}/>
        <View style={styles.appContainer}>
        <ScrollView>
          {imageArray.length !=0 ?
            <View style={styles.imageCard}>
              {imageArray.map((url, index) =>
                <ImageCard key={index} url={url} removeImage={removeImage} />
              )}
            </View>
          :
            <View style={styles.noImageContainer}>
              <View style={{width: "100%", height: 400}}>
                <Image source={NoImage} style={{width: "100%", height: "100%"}}/>
              </View>
              <Text style={{textAlign: "center", fontSize: 16}}>Select a picture to get started 👇</Text>
            </View>
          }
        </ScrollView>
          
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, {backgroundColor: "lightgreen"}]} onPress={pickImageAsync}>
              <Text  style={styles.buttonLabel}>Add Pictures</Text>
            </Pressable>
            <View style={styles.nestedButtonContainer}>
            <Pressable style={[styles.button, {backgroundColor: "#c0f1f1", width: "48%"}]} onPress={()=> setIsModalVisible(true)} disabled={imageArray.length==0}>
              <Text  style={[styles.buttonLabel, {color: `${imageArray.length==0?"#fafafa":"black"}`}]}>Set Wallpaper</Text>
            </Pressable>
            {/* <Pressable style={[styles.button, {backgroundColor: "#c0f1f1", width: "48%"}]} onPress={removeBackgroundTask} disabled={!isTaskRegistered}>
              <Text  style={[styles.buttonLabel, {color: `${!isTaskRegistered?"#fafafa":"black"}`}]}>Stop Wallpapers</Text>
            </Pressable> */}
            </View>
          </View>
        </View>
        <WallpaperSettings isVisible={isModalVisible} onClose={onModalClose} setWallpaper={setWallpaper}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  app:{
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fafafa"
  },
  appContainer:{
    flex: 1,
    justifyContent: "center",
    width: "90%",
    paddingTop: 30,
    paddingBottom: 10,
    gap: 10,
  },
  text:{
    textAlign: "center"
  },

  imageCard:{
    flex:1,
    flexDirection: "row",
    flexWrap: 'wrap',
    columnGap: "2%",
    rowGap: 5,
  },

  noImageContainer:{
    flex:1,
    height: 550,
    justifyContent: "center",
    gap: 5,
  },

  buttonContainer: {
    gap: 5,
  },
  nestedButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  
  button: {
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    
  },
  buttonLabel: {
    color: '#000',
    fontSize: 16,
  },
})

export default App;
