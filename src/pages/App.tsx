import WallpaperSettings from '../components/WallpaperSettingsModal'
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundFetch from "react-native-background-fetch";
import BootSplash from "react-native-bootsplash";
import IonIcon from 'react-native-vector-icons/Ionicons'

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
  BackHandler,
  useColorScheme,
  Dimensions,
} from 'react-native';
import {
  applyWallpaper,
  backgroundFetchHeadlessTask,
  fetchLocalStore,
  GlobalStateContext,
  localStorageKey,
  localStore,
} from '../components/utilFunctions';
import AllAlbums from './AllAlbums';
import Settings from '../components/SettingsModal';
import { Alert } from 'react-native';

function App(): React.JSX.Element {
  const { width } = Dimensions.get("window");

  const [isWallpaperModalVisible, setIsWallpaperModalVisible] = useState<boolean>(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [localStorage, setLocalStorage] = useState<localStore>();
  const userSystemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(userSystemTheme==='dark');
  const isTablet = width >= 768;

  const [navOption, setNavOption] = useState(1);
  
  const onWallpaperModalOpen = () => {
    setIsWallpaperModalVisible(true);
  }
  const onWallpaperModalClose = () => {
    setIsWallpaperModalVisible(false);
  };

  const onSettingsModalOpen = () => {
    setIsSettingsModalVisible(true);
  }
  const onSettingsModalClose = () => {
    setIsSettingsModalVisible(false);
  };

  const handleBottomNav = (index: number)=>{
    if(index==1){
      onWallpaperModalClose();
      onSettingsModalClose();
    }else if(index==2){
      onSettingsModalClose();
      if(localStorage?.imageArray != undefined && localStorage.imageArray.length > 0)
        onWallpaperModalOpen();
      else{
        ToastAndroid.show('Kindly create an album first', ToastAndroid.LONG);
        return;
      }
    }else if(index==3){
      onWallpaperModalClose();
      onSettingsModalOpen();
    }
    setNavOption(index);
  }

  const setWallpaper = async (duration: number, isRandom: boolean, screen: string, album: number) => {
    if(localStorage?.imageArray[album].length == 1){
      handleBottomNav(1);
      ToastAndroid.show('Add some wallpapers to the album first!', ToastAndroid.SHORT);
      return;
    }
    if(screen!=null && album!=null)
      try {
        await initBackgroundFetch(duration);
        await updateLocalStorage({isRandom: isRandom, screen: screen, isTaskRegistered: true, album: album});
        await applyWallpaper();
        await updateLocalStorage({});
        handleBottomNav(1);
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
    await updateLocalStorage({previousWalls: [0], isTaskRegistered: false});
    ToastAndroid.show('Wallpaper service has been stopped', ToastAndroid.SHORT);
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
      if (isWallpaperModalVisible || isSettingsModalVisible) {
        handleBottomNav(1);
        return true;
      }
      return false; // Allow default back button behavior if no modals are open
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener
  }, [isWallpaperModalVisible, isSettingsModalVisible]);

  useEffect(()=>{
    setIsDarkMode(userSystemTheme==='dark');
  }, [userSystemTheme])

  return (
    <GlobalStateContext.Provider value={{localStorage, updateLocalStorage, isDarkMode, setIsDarkMode, isTablet, stopBackgroundTask}}>
    <SafeAreaView style={[styles.app, {backgroundColor: isDarkMode? "black": "white"}]}>
      <StatusBar barStyle={isDarkMode?'light-content' : 'dark-content'} backgroundColor={isDarkMode? "black": "white"} />
        <View style={styles.appContainer}>

          <View style={{flex: 1, alignItems: "center"}}>
            <AllAlbums />
          </View>

          <View style={[styles.bottomNavBar, {backgroundColor: isDarkMode? "black": "white"}]}>
            <TouchableOpacity activeOpacity={0.5} onPressOut={()=> handleBottomNav(1)}>
              <Text style={{textAlign:"center", fontWeight: navOption==1?"500":"400", letterSpacing: 0.3, color: navOption==1? isDarkMode? "white": "black" : "grey", borderBottomColor: navOption==1? isDarkMode? "white": "black": isDarkMode? "black": "white", borderBottomWidth: 2}}>Albums</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPressOut={()=> handleBottomNav(2)}>
              <Text style={{textAlign:"center", fontWeight: navOption==2?"500":"400", letterSpacing: 0.3, color: navOption==2? isDarkMode? "white": "black" : "grey", borderBottomColor: navOption==2? isDarkMode? "white": "black": isDarkMode? "black": "white", borderBottomWidth: 2}}>Simple</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPressOut={()=> handleBottomNav(3)}>
              <IonIcon  name={navOption==3?'menu':"menu-outline"} size={30} color={navOption==3? isDarkMode? "white": "black" : "grey"}/>
            </TouchableOpacity>
          </View>
          
          {(isWallpaperModalVisible || isSettingsModalVisible) && <View onTouchEnd={()=>handleBottomNav(1)} style={{backgroundColor: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)", width: "100%", height: "100%", position: "absolute"}}></View>}
          <WallpaperSettings isVisible={isWallpaperModalVisible} onClose={onWallpaperModalClose} setWallpaper={setWallpaper}/>
          <Settings isVisible={isSettingsModalVisible} onClose={onSettingsModalClose}/>
        </View>
    </SafeAreaView>
    </GlobalStateContext.Provider>
  )
}

const styles = StyleSheet.create({
  app:{
    flex: 1,
    alignItems: "center",
  },
  appContainer:{
    flex: 1,
    width: "100%",
  },
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 5,
    height: 50,
    zIndex: 1
  }
})

export default App;
