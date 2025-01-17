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
  BackHandler,
  useColorScheme
} from 'react-native';
import {
  applyWallpaper,
  backgroundFetchHeadlessTask,
  fetchLocalStore,
  localStorageKey,
  localStore,
  saveFileToAppStorage
} from '../components/utilFunctions';

function App(): React.JSX.Element {
  const [isWallpaperModalVisible, setIsWallpaperModalVisible] = useState<boolean>(false);
  const [localStorage, setLocalStorage] = useState<localStore>();
  const isDarkMode = useColorScheme() === 'dark';
  
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
      
      await updateLocalStorage({imageArray: tempArray});
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        Alert.alert("Error", "Something went wrong please try again!");
      }
    }
  };
  
  const onWallpaperModalOpen = () => {
    if(!isDarkMode)
      StatusBar.setBarStyle("light-content");
    setIsWallpaperModalVisible(true);
  }
  const onWallpaperModalClose = () => {
    if(!isDarkMode)
      StatusBar.setBarStyle("dark-content");
    setIsWallpaperModalVisible(false);
  };

  const removeImage = async (urlToRemove: string) =>{
    try{
      await RNFS.unlink(urlToRemove.substring(7));
      let tempArray: string[] = localStorage!.imageArray.filter(uri => uri != urlToRemove);
      
      if(tempArray.length==0){
        await BackgroundFetch.stop();
      }
      
      await updateLocalStorage({
        imageArray: tempArray,
        previousWalls: [-1],
        isTaskRegistered: tempArray.length==0? false: localStorage!.isTaskRegistered
      })
    }catch(err){
      console.error("Error occured while file deletion: ", err);
    }
  };
  
  const setWallpaper = async (duration: number, isRandom: boolean, screen: string) => {
   if(screen!=null)
      try {
        await initBackgroundFetch(duration);
        await updateLocalStorage({isRandom: isRandom, screen: screen, isTaskRegistered: true});
        await applyWallpaper();
        await updateLocalStorage({});
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

  const stopBackgroundTask = () => {
    Alert.alert("Stop Wallpapers", "Do you want to stop the wallpaper service?",
      [
        {
          text: "Cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            await BackgroundFetch.stop();
            await updateLocalStorage({previousWalls: [-1], isTaskRegistered: false});
            ToastAndroid.show('Wallpaper service has been stopped', ToastAndroid.SHORT);
          },
          style: "destructive"
        },
      ],
      { cancelable: true } // Allows dismissal by tapping outside the alert on Android
    )
  }

  const updateLocalStorage = async (newData: Partial<localStore>) => {
    try {
      var localSt: localStore = await fetchLocalStore();
      
      // Update state
      const updatedData: localStore = { ...localSt, ...newData };
      setLocalStorage(updatedData);

      // Update AsyncStorage
      await AsyncStorage.setItem(localStorageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.error("Failed to update local storage:", error);
    }
  };

  useEffect(()=>{
    fetchLocalStore().then((localSt: localStore)=>{
      setLocalStorage(localSt)
    }).finally(async () => {
      await BootSplash.hide({fade: true});
    });
  },[])
  
  useEffect(() => {
    const backAction = () => {
      if (isWallpaperModalVisible) {
        onWallpaperModalClose();
        return true;
      }
      return false; // Allow default back button behavior if no modals are open
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener
  }, [isWallpaperModalVisible]);

  return (
    <SafeAreaView style={[styles.app, {backgroundColor: isDarkMode? "black": "white"}]}>
      <StatusBar barStyle={isDarkMode?'light-content' : 'dark-content'} backgroundColor={isDarkMode? "black": "white"} />
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
              <Text style={{textAlign: "center", fontSize: 16, color: isDarkMode? "white": "black"}}>Select some pictures to get started 👇</Text>
            </View>
          }
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity activeOpacity={0.6} style={[styles.button, {backgroundColor: "lightgreen"}]} onPress={pickImageAsync}>
              <Text  style={styles.buttonLabel}>Add Pictures</Text>
            </TouchableOpacity>
            <View style={styles.nestedButtonContainer}>
            <TouchableOpacity activeOpacity={0.6} style={[styles.button, {backgroundColor: "#c0f1f1", flex: 1/2}]} onPress={onWallpaperModalOpen} disabled={Number(localStorage?.imageArray.length)==0}>
              <Text  style={[styles.buttonLabel, {color: `${Number(localStorage?.imageArray.length)==0?"#fafafa":"black"}`}]}>Set Wallpaper</Text>
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
