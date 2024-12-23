import RNFS from 'react-native-fs';
import BackgroundFetch from "react-native-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceWallpaper from "react-native-device-wallpaper";

export interface localStore {
  imageArray: string[],
  isRandom: boolean,
  screen: string,
  isTaskRegistered: boolean,
  previousIndex: number,
}

const findNextIndex = (tempStore: localStore): number => {
  let arrayLength = tempStore.imageArray.length;
  
  if(!tempStore.isRandom)
    return (tempStore.previousIndex + 1) % arrayLength;
  else
    return Math.floor(Math.random() * arrayLength);
}

const saveFileToAppStorage = async (uri: string, fileName: string): Promise<string> => {
  const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // App-specific storage
  try {
    await RNFS.copyFile(uri, destinationPath);
    return destinationPath;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
};

const backgroundFetchHeadlessTask = async (event) => {
    let currentTime = new Date();
    if (event.timeout) {
        console.log(`[BackgroundFetch] HeadlessTask timeout: ${event.taskId} @ ${currentTime.toLocaleTimeString()}`);
        BackgroundFetch.finish(event.taskId);
        return;
    }

    let tempVariable = await AsyncStorage.getItem('localStorage');

    if(tempVariable === null){
      console.log('[BackgroundFetch] HeadlessTask Wallpaper result: tempVariable is null');
    }else{
      let tempStore:localStore = JSON.parse(tempVariable);
      let nextWallIndex: number = findNextIndex(tempStore);

      let setWallResult = tempStore.screen=='HOME'? await DeviceWallpaper.setWallPaper(tempStore.imageArray[nextWallIndex]):
                            tempStore.screen=='LOCK'? await DeviceWallpaper.setLockScreen(tempStore.imageArray[nextWallIndex]):
                            await DeviceWallpaper.setBoth(tempStore.imageArray[nextWallIndex]);
    
      tempStore = {...tempStore, previousIndex: nextWallIndex};
      await AsyncStorage.setItem('localStorage', JSON.stringify(tempStore));

      console.log(`[BackgroundFetch] HeadlessTask Wallpaper result: ${setWallResult} @ ${currentTime.toLocaleTimeString()}`);
    }

    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(event.taskId);
}

export {saveFileToAppStorage, backgroundFetchHeadlessTask};