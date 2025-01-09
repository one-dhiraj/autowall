import RNFS from 'react-native-fs';
import BackgroundFetch from "react-native-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceWallpaper from "react-native-device-wallpaper";

export interface localStore {
  version: number,
  imageArray: string[],
  isRandom: boolean,
  screen: string,
  isTaskRegistered: boolean,
  previousWalls: number[],
}

const localStorageKey: string = 'localStorage';
const localStorageVersion: number = 2;

const findNextIndex = (tempStore: localStore): number => {
  let newIndex;
  let arrayLength = tempStore.imageArray.length;
  
  if(!tempStore.isRandom)
    newIndex = (tempStore.previousWalls[tempStore.previousWalls.length - 1] + 1) % arrayLength;
  else{
    do {
      newIndex = Math.floor(Math.random() * arrayLength);
    } while (tempStore.previousWalls.includes(newIndex));
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
  let tempStore:localStore = await fetchLocalStore();

  if(!tempStore.isTaskRegistered || tempStore.imageArray.length == 0){
    return;
  }else{
    let nextWallIndex: number = findNextIndex(tempStore);

    let setWallResult = tempStore.screen=='HOME'? await DeviceWallpaper.setWallPaper(tempStore.imageArray[nextWallIndex]):
                        tempStore.screen=='LOCK'? await DeviceWallpaper.setLockScreen(tempStore.imageArray[nextWallIndex]):
                        await DeviceWallpaper.setBoth(tempStore.imageArray[nextWallIndex]);
  
    if(tempStore.previousWalls.length == tempStore.imageArray.length)
      tempStore = {...tempStore, previousWalls: [-1]};
    else
      tempStore = {...tempStore, previousWalls: [...tempStore.previousWalls, nextWallIndex]};
    
    await AsyncStorage.setItem(localStorageKey, JSON.stringify(tempStore));
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

const fetchLocalStore = async (): Promise<localStore> => {
  var localSt = await AsyncStorage.getItem(localStorageKey);
  if(localSt){
    let returnObj = JSON.parse(localSt);
    if(returnObj.version !== localStorageVersion){
      returnObj = {...returnObj, version: localStorageVersion, previousWalls: [-1]}
    }
    return returnObj;
  }else{
    return {
      version: localStorageVersion,
      imageArray: [],
      isRandom: false,
      screen: "HOME",
      isTaskRegistered: false,
      previousWalls: [-1]
    };
  }
}

export {saveFileToAppStorage, backgroundFetchHeadlessTask, applyWallpaper, fetchLocalStore, localStorageKey};