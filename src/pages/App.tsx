import NoImage from '../assets/images/no-image.png'
import ImageCard from '../components/ImageCard'
import WallpaperSettings from '../components/WallpaperSettingsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker, {types} from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import BackgroundFetch from "react-native-background-fetch";

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
import { backgroundFetchHeadlessTask, localStore, saveFileToAppStorage } from '../components/utilFunctions';

function App(): React.JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [localStorage, setLocalStorage] = useState<localStore>({
    imageArray: [],
    isRandom: false,
    screen: "HOME",
    isTaskRegistered: false,
    previousIndex: -1,
  });
  
  const pickImageAsync = async () => {
    try {
      let tempArray: string[] = localStorage.imageArray;
    
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
      
      let tempLocal = {...localStorage, imageArray: tempArray};
      setLocalStorage(tempLocal);
      await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
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
      let tempArray: string[] = localStorage.imageArray.filter(uri => uri != urlToRemove);
      
      let tempLocal = {...localStorage, imageArray: tempArray};
      setLocalStorage(tempLocal);
      await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
    }catch(err){
      console.error("Error occured while file deletion: ", err);
    }
  };
  
  const setWallpaper = async (duration: number, isRandom: boolean, screen: string) => {
    if(screen==null)
      Alert.alert("Please select a screen to apply the wallpaper on");
    else
      try {
        await initBackgroundFetch(duration);
        let tempLocal = {...localStorage, isRandom, screen, isTaskRegistered: true};
        setLocalStorage(tempLocal);
        await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
        onModalClose();
      } catch (error) {
        console.error('Failed to set wallpapers:', error);
      }
  };

  /// Configure BackgroundFetch.
  const initBackgroundFetch = async (duration: number) => {
    const status: number = await BackgroundFetch.configure({
      minimumFetchInterval: duration,      // <-- minutes (15 is minimum allowed)
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      // Android options
      forceAlarmManager: false,      // <-- Set true to bypass JobScheduler.
    }, backgroundFetchHeadlessTask
    , (taskId:string) => {
      // Oh No!  Our task took too long to complete and the OS has signalled
      // that this task must be finished immediately.
      console.log('[Fetch] TIMEOUT taskId:', taskId);
      BackgroundFetch.finish(taskId);
    });

    console.log("Background task configured: ", status);
  }

  const stopBackgroundTask = async () => {
    await BackgroundFetch.stop();
    let tempLocal = {...localStorage, isTaskRegistered: false};
    setLocalStorage(tempLocal);
    await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
  }

  useEffect(()=>{
    const fetchLocalStore = async () => {
      const localSt = await AsyncStorage.getItem('localStorage');
      if(localSt)
        setLocalStorage(JSON.parse(localSt));
    }

    fetchLocalStore();
  },[])
  
  return (
    <SafeAreaView style={styles.app}>
      
        <View style={styles.appContainer}>
        <ScrollView>
          {localStorage.imageArray.length !=0 ?
            <View style={styles.imageCard}>
              {localStorage.imageArray.map((url, index) =>
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
            <Pressable style={[styles.button, {backgroundColor: "#c0f1f1", width: "48%"}]} onPress={()=> setIsModalVisible(true)} disabled={localStorage.imageArray.length==0}>
              <Text  style={[styles.buttonLabel, {color: `${localStorage.imageArray.length==0?"#fafafa":"black"}`}]}>Set Wallpaper</Text>
            </Pressable>
            <Pressable style={[styles.button, {backgroundColor: "#c0f1f1", width: "48%"}]} onPress={stopBackgroundTask} disabled={!localStorage.isTaskRegistered}>
              <Text  style={[styles.buttonLabel, {color: `${!localStorage.isTaskRegistered?"#fafafa":"black"}`}]}>Stop Wallpapers</Text>
            </Pressable>
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
