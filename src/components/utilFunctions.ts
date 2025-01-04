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
  let newIndex = tempStore.previousIndex;
  while(newIndex==tempStore.previousIndex){
    let arrayLength = tempStore.imageArray.length;
    
    if(!tempStore.isRandom)
      newIndex = (tempStore.previousIndex + 1) % arrayLength;
    else
      newIndex = Math.floor(Math.random() * arrayLength);
  }

  return newIndex;
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

const applyWallpaper = async() => {
  let tempVariable = await AsyncStorage.getItem('localStorage');

  if(tempVariable === null){
    return;
  }else{
    let tempStore:localStore = JSON.parse(tempVariable);

    if(tempStore.imageArray.length != 0){
      let nextWallIndex: number = findNextIndex(tempStore);

      let setWallResult = tempStore.screen=='HOME'? await DeviceWallpaper.setWallPaper(tempStore.imageArray[nextWallIndex]):
                            tempStore.screen=='LOCK'? await DeviceWallpaper.setLockScreen(tempStore.imageArray[nextWallIndex]):
                            await DeviceWallpaper.setBoth(tempStore.imageArray[nextWallIndex]);
    
      tempStore = {...tempStore, previousIndex: nextWallIndex};
      await AsyncStorage.setItem('localStorage', JSON.stringify(tempStore));
    }
  }
}

const backgroundFetchHeadlessTask = async (event) => {
    let currentTime = new Date();
    if (event.timeout) {
        BackgroundFetch.finish(event.taskId);
        return;
    }

    await applyWallpaper();

    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(event.taskId);
}

const fetchLocalStore = async () => {
  var localSt = await AsyncStorage.getItem('localStorage');
  if(localSt){
    return JSON.parse(localSt);
  }else{
    return {
      imageArray: [],
      isRandom: false,
      screen: "HOME",
      isTaskRegistered: false,
      previousIndex: -1,
    };
  }
}

export {saveFileToAppStorage, backgroundFetchHeadlessTask, applyWallpaper, fetchLocalStore};