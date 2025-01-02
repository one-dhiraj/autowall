import NoImage from '../assets/images/no-image.png'
import ImageCard from '../components/ImageCard'
import WallpaperSettings from '../components/WallpaperSettingsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker, {types} from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import BackgroundFetch from "react-native-background-fetch";
import BootSplash from "react-native-bootsplash";

import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  Alert,
} from 'react-native';
import { applyWallpaper, backgroundFetchHeadlessTask, localStore, saveFileToAppStorage } from '../components/utilFunctions';

function App(): React.JSX.Element {
  const [isWallpaperModalVisible, setIsWallpaperModalVisible] = useState<boolean>(false);
  const [localStorage, setLocalStorage] = useState<localStore>();
  
  const pickImageAsync = async () => {
    try {
      let tempArray: string[] = localStorage!.imageArray;
    
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
      
      let tempLocal = {...localStorage!, imageArray: tempArray};
      setLocalStorage(tempLocal);
      await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        Alert.alert("Error", "Something went wrong please try again!");
      }
    }
  };
  
  const onWallpaperModalClose = () => {
    setIsWallpaperModalVisible(false);
  };

  const removeImage = async (urlToRemove: string) =>{
    try{
      await RNFS.unlink(urlToRemove.substring(7));
      let tempArray: string[] = localStorage!.imageArray.filter(uri => uri != urlToRemove);
      
      let tempLocal = {
        ...localStorage!,
        imageArray: tempArray,
        previousIndex: tempArray.length>localStorage!.previousIndex ? localStorage!.previousIndex : -1
      };
      setLocalStorage(tempLocal);
      
      if(tempLocal.imageArray.length==0)
        stopBackgroundTask();

      await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
    }catch(err){
      console.error("Error occured while file deletion: ", err);
    }
  };
  
  const setWallpaper = async (duration: number, isRandom: boolean, screen: string) => {
   if(screen!=null)
      try {
        await initBackgroundFetch(duration);
        let tempLocal = {...localStorage!, isRandom, screen, isTaskRegistered: true};
        setLocalStorage(tempLocal);
        await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
        await applyWallpaper();
        onWallpaperModalClose();
        ToastAndroid.show('Wallpapers configured successfully!', ToastAndroid.SHORT);
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
      BackgroundFetch.finish(taskId);
    });
  }

  const stopBackgroundTask = async () => {
    await BackgroundFetch.stop();
    let tempLocal = {...localStorage!, isTaskRegistered: false};
    setLocalStorage(tempLocal);
    await AsyncStorage.setItem('localStorage', JSON.stringify(tempLocal));
  }

  useEffect(()=>{
    const fetchLocalStore = async () => {
      const localSt = await AsyncStorage.getItem('localStorage');
      if(localSt){
        setLocalStorage(JSON.parse(localSt));
      }else{
        setLocalStorage({
          imageArray: [],
          isRandom: false,
          screen: "HOME",
          isTaskRegistered: false,
          previousIndex: -1,
        });
      }
    }

    fetchLocalStore().finally(async () => {
      await BootSplash.hide({fade: true});
    });
  },[])
  
  return (
    <SafeAreaView style={styles.app}>
      <StatusBar barStyle={'dark-content'} backgroundColor={"transparent"} />
        <View style={styles.appContainer}>
          {localStorage?.imageArray.length !=0 ?
            <ScrollView>
              <View style={styles.imageCard}>
                {localStorage?.imageArray.map((url, index) =>
                  <ImageCard key={index} url={url} removeImage={removeImage} />
                )}
              </View>
            </ScrollView>
          :
            <View style={styles.noImageContainer}>
              <View style={{width: "100%", height: 400}}>
                <Image source={NoImage} style={{width: "100%", height: "100%", resizeMode: "contain"}}/>
              </View>
              <Text style={{textAlign: "center", fontSize: 16}}>Select two or more pictures to proceed 👇</Text>
            </View>
          }
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity activeOpacity={0.6} style={[styles.button, {backgroundColor: "lightgreen"}]} onPress={pickImageAsync}>
              <Text  style={styles.buttonLabel}>Add Pictures</Text>
            </TouchableOpacity>
            <View style={styles.nestedButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} style={[styles.button, {backgroundColor: "#c0f1f1", flex: 1/2}]} onPress={()=> setIsWallpaperModalVisible(true)} disabled={Number(localStorage?.imageArray.length)<2}>
              <Text  style={[styles.buttonLabel, {color: `${Number(localStorage?.imageArray.length)<2?"#fafafa":"black"}`}]}>Set Wallpaper</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} style={[styles.button, {backgroundColor: "#c0f1f1", flex: 1/2}]} onPress={stopBackgroundTask} disabled={!localStorage?.isTaskRegistered}>
              <Text  style={[styles.buttonLabel, {color: `${!localStorage?.isTaskRegistered?"#fafafa":"black"}`}]}>Stop Wallpapers</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
        <WallpaperSettings isVisible={isWallpaperModalVisible} onClose={onWallpaperModalClose} setWallpaper={setWallpaper}/>
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
    paddingTop: 20,
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
    flex: 1,
    justifyContent: "center",
  },

  buttonContainer: {
    gap: 5,
  },
  nestedButtonContainer: {
    flexDirection: "row",
    gap: 5
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
