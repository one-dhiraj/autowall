import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import React, { PropsWithChildren } from 'react'
import { useGlobalState } from '../components/utilFunctions'
import RNFS from 'react-native-fs';
import AntDesign from 'react-native-vector-icons/AntDesign'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import ImageCard from '../components/ImageCard';

type Props = PropsWithChildren<{
  albumIndex: number;
  pickImages: (tempArray: string[]) => Promise<string[]>;
  setShowAlbum: (value: React.SetStateAction<number>) => void;
}>;

export default function OneAlbum({albumIndex, pickImages, setShowAlbum}: Props) {
  const {localStorage, updateLocalStorage, isDarkMode} = useGlobalState();
  
  const addNewImages = async ()=>{
    const tempArray = localStorage?.imageArray;
    if(tempArray)
      tempArray[albumIndex] = await pickImages(tempArray[albumIndex]);
    await updateLocalStorage({imageArray: tempArray});
  }

  const removeImage = async (urlToRemove: string) =>{
    const showConfirmation = (): Promise<boolean> => {
      return new Promise((resolve) => {
        Alert.alert(
          "Empty Album",
          "This album is now empty. Do you want to remove it?",
          [
            { text: "No", style: "cancel", onPress: () => resolve(false) },
            { text: "Yes", style: "destructive", onPress: () => resolve(true) },
          ],
          { cancelable: false }
        );
      });
    };
    try{
      await RNFS.unlink(urlToRemove.substring(7));
      let tempArray: string[][] = localStorage!.imageArray;
      tempArray[albumIndex] = tempArray[albumIndex].filter(uri => uri != urlToRemove);
      
      if(tempArray[albumIndex].length==1){
        const userConfirmed = await showConfirmation();
        if (userConfirmed) {
          tempArray = tempArray.filter((_, index) => index !== albumIndex);
          setShowAlbum(-1);
        }
      }
      await updateLocalStorage({
        imageArray: tempArray,
        previousWalls: [-1],
        // isTaskRegistered: tempArray.length==0? false: localStorage!.isTaskRegistered
      })
    }catch(err){
      console.error("Error occured while file deletion: ", err);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 20, paddingHorizontal: 10, marginVertical: 10}}>
        <Text style={{textAlign: "left", flex: 1, fontSize: 16, color: isDarkMode? "white":"black", alignSelf: "flex-end"}}>{localStorage?.imageArray[albumIndex][0]}</Text>
        <TouchableOpacity onPress={addNewImages}>
          <AntDesign name="plus" size={24} color={isDarkMode?'white':"black"}/>
        </TouchableOpacity>
        <TouchableOpacity>
          <AntDesign name="edit" size={24} color={isDarkMode?'white':"black"}/>
        </TouchableOpacity>
        <TouchableOpacity>
          <SimpleLineIcons name="trash" size={24} color={isDarkMode?'white':"black"}/>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.imageCard}>
          {localStorage?.imageArray[albumIndex].slice(1).map((url, index) =>
            <ImageCard key={index} url={url} removeImage={removeImage} />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  imageCard:{
    flex:1,
    flexDirection: "row",
    flexWrap: 'wrap',
    columnGap: "2%",
    rowGap: 5,
    paddingVertical: 10
  },
})