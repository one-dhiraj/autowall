import RNFS from 'react-native-fs';
import BackgroundFetch from "react-native-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceWallpaper from "react-native-device-wallpaper";
import { createContext, useContext } from 'react';

export interface localStore {
  version: number;
  imageArray: string[][];
  album: number;
  isRandom: boolean;
  screen: string;
  isTaskRegistered: boolean;
  previousWalls: number[];
}

interface GlobalState {
  localStorage: localStore | undefined;
  updateLocalStorage: (newData: Partial<localStore>) => Promise<void>;
  isDarkMode: boolean;
  setIsDarkMode: (value: React.SetStateAction<boolean>) => void;
  isTablet: boolean;
  stopBackgroundTask: () => Promise<void>;
}

const localStorageKey: string = 'localStorage';
const localStorageVersion: number = 3;

const findNextIndex = (tempStore: localStore): number => {
  let newIndex;
  let arrayLength = tempStore.imageArray[tempStore.album].length;
  
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

    let setWallResult = tempStore.screen=='HOME'? await DeviceWallpaper.setWallPaper(tempStore.imageArray[tempStore.album][nextWallIndex]):
                        tempStore.screen=='LOCK'? await DeviceWallpaper.setLockScreen(tempStore.imageArray[tempStore.album][nextWallIndex]):
                        await DeviceWallpaper.setBoth(tempStore.imageArray[tempStore.album][nextWallIndex]);
  
    if(tempStore.previousWalls.length == tempStore.imageArray[tempStore.album].length)
      tempStore = {...tempStore, previousWalls: [0]};
    else
      tempStore = {...tempStore, previousWalls: [...tempStore.previousWalls, nextWallIndex]};
    
    await AsyncStorage.setItem(localStorageKey, JSON.stringify(tempStore));
  }
}

const backgroundFetchHeadlessTask = async (event) => {
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

function upgradeLocalStore(currentObj: Partial<localStore>): localStore {
  const updateImageArray = (imageArray: any): string[][] => {
    
    // Check if it's a 2D array already
    if (Array.isArray(imageArray)) {
      if (Array.isArray(imageArray[0])) {
        return imageArray; // Already a 2D array, return as-is
      } else if(imageArray.length !== 0) {
        return [['Album 1', ...imageArray]]; // Convert non empty 1D array to 2D
      }
    }
    return []; // Default to empty 2D array if invalid or empty 1D array
  };

  return {
    version: localStorageVersion,
    imageArray: updateImageArray(currentObj.imageArray),
    album: currentObj.isTaskRegistered ? 0 : -1,
    isRandom: currentObj.isRandom ?? false,
    screen: currentObj.screen ?? "HOME",
    isTaskRegistered: currentObj.isTaskRegistered ?? false,
    previousWalls: currentObj.previousWalls == undefined ? [0] : [0, ...currentObj.previousWalls],
  };
}

const fetchLocalStore = async (): Promise<localStore> => {
  var localSt = await AsyncStorage.getItem(localStorageKey);
  if(localSt){
    let returnObj = JSON.parse(localSt);
    if(returnObj.version !== localStorageVersion){
      returnObj = upgradeLocalStore(returnObj);
    }
    return returnObj;
  }

  // If no data exists in storage, return the default structure
  return upgradeLocalStore({});
}

const GlobalStateContext = createContext<GlobalState | null>(null);

const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};

export {
  saveFileToAppStorage,
  backgroundFetchHeadlessTask,
  applyWallpaper,
  fetchLocalStore,
  localStorageKey,
  GlobalStateContext,
  useGlobalState
};