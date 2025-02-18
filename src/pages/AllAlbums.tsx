import NoImage from '../assets/images/no-image.png'
import {
  Alert,
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { saveFileToAppStorage, useGlobalState } from '../components/utilFunctions'
import DocumentPicker, {types} from 'react-native-document-picker';
import AntDesign from 'react-native-vector-icons/AntDesign'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import NewAlbumInput from '../components/NewAlbumInput'
import OneAlbum from './OneAlbum';

export default function AllAlbums() {
  const {localStorage, updateLocalStorage, isDarkMode, stopBackgroundTask} = useGlobalState();
  const [newAlbumInput, setNewAlbumInput] = useState<boolean>(false);
  const [showAlbum, setShowAlbum] = useState<number>(-1);
  const [allAlbumMode, setAllAlbumMode] = useState<"grid"|"list">("list");

  const pickImages = async (tempArray: string[]):Promise<string[]> => {
    try {
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
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        Alert.alert("Error", "Something went wrong please try again!");
      }
    } finally {
      return tempArray;
    }
  };
    
  const onCloseNewAlbumInput = ()=>{
    setNewAlbumInput(false);
  }

  const createNewAlbum = async (albumName: string) => {
    onCloseNewAlbumInput();
    let tempArray = await pickImages([albumName]);
    if((tempArray.length>1)){
      let newImageArray = localStorage?.imageArray;
      newImageArray?.push(tempArray);
      await updateLocalStorage({imageArray: newImageArray});
    }
  }

  const deleteAlbum = async (albumIndex: number) => {
    setShowAlbum(-1);
    let tempArray = localStorage?.imageArray.filter((_, index)=> index!=albumIndex)
    if(localStorage?.isTaskRegistered && albumIndex == localStorage?.album)
      await stopBackgroundTask();
    await updateLocalStorage({imageArray: tempArray});
  }
  
  useEffect(()=>{
    const backAction = () => {
      if(showAlbum!=-1 || newAlbumInput){
        setShowAlbum(-1);
        setNewAlbumInput(false);
        return true;
      }
      
      return false; // Allow default back button behavior if no modals are open
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener
  },)
  
  return (
    <View style={{width: "95%", marginTop: 10, flex: 1}}>
      {localStorage?.imageArray.length !=0 ?
        showAlbum == -1 ?
          <View>
            <View style={{flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 20, paddingHorizontal: 10, marginVertical: 10}}>
              <TouchableOpacity onPress={()=> setNewAlbumInput(true)}>
                <AntDesign name="addfolder" size={24} color={isDarkMode?'white':"black"}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setAllAlbumMode("list")}>
                <SimpleLineIcons name="menu" size={24} color={isDarkMode?'white':"black"}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setAllAlbumMode("grid")}>
                <SimpleLineIcons name="grid" size={24} color={isDarkMode?'white':"black"}/>
              </TouchableOpacity>
            </View>
            <ScrollView>              
            {allAlbumMode == "list"?
              <View style={styles.albumList}>
              {localStorage?.imageArray.map((album, index) =>
                <Pressable key={index} style={[styles.albumCard, {borderColor: isDarkMode? "lightgrey": "grey", backgroundColor: isDarkMode? "#111": "#fafafa"}]}
                  onPress={()=>setShowAlbum(index)}>
                  <Text style={{fontSize: 15, color: isDarkMode? "white": "black", letterSpacing: 0.5, fontWeight: 300, flex: 1}}>{album[0]}</Text>
                  <View style={styles.albumCardImageRow}>
                    {album.slice(1, 4).map((fileUrl, index)=>
                      <Image style={{width: "32%",height: "100%", borderRadius: 10}} key={index} source={{uri: fileUrl}}/>
                    )}
                    {album.length>4 &&
                      <View style={{width: "32%",height: "100%", backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", position: "absolute", right: 0, borderRadius: 10}}>
                        <Text style={{textAlign: "center", fontSize: 20, fontWeight: "bold", color: "white"}}>+{album.length - 4}{`\n`}more</Text>
                      </View>}
                  </View>
                </Pressable>
              )}
              </View>
            :
              <View style={styles.albumGrid}>
              {localStorage?.imageArray.map((album, index) =>
                <Pressable key={index} style={{width: "30%"}}
                  onPress={()=>setShowAlbum(index)}>
                    <Image source={{uri: album[1]}} style={{height: 150, borderRadius: 10}}></Image>
                    <Text style={{color: isDarkMode?"white": "black", textAlign: "center", fontWeight: "300", marginTop: 3, fontSize: 13}}>{album[0]}</Text>
                </Pressable>
              )}
              </View>
            }
            </ScrollView>
          </View>
          :
          <OneAlbum albumIndex={showAlbum} pickImages={pickImages} deleteAlbum={deleteAlbum}/>
        :
        <View style={styles.noImageContainer}>
          <View style={{width: "100%", height: 400}}>
            <Image source={NoImage} style={{width: "100%", height: "100%", resizeMode: "contain"}}/>
          </View>
          <TouchableOpacity style={{flexDirection: "row", justifyContent: "center", alignItems: "flex-end", width: "99%", gap: 10}} onPress={()=> setNewAlbumInput(true)}>
          <Text style={{textAlign: "center", fontSize: 16, color: isDarkMode? "white": "black"}}>Create an album to get started</Text>
            <AntDesign name="plus" size={24} color={isDarkMode?'white':"black"}/>
          </TouchableOpacity>
        </View>
      }

      <NewAlbumInput isVisible={newAlbumInput} onClose={onCloseNewAlbumInput} placeholder={`Album ${(localStorage?.imageArray?.length ?? 0)+1}`} createNewAlbum={createNewAlbum}/>
    </View>
  )
}

const styles = StyleSheet.create({
  albumList: {
    gap: 8,
    marginVertical: 10,
  },
  albumGrid:{
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: "5%",
    rowGap: 15,
    paddingHorizontal: "2%",
    marginTop: 20,
    marginBottom: 10,
  },
  albumCard:{
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    flexDirection: "row"
  },
  albumCardImageRow: {
    flexDirection: "row",
    height: 100,
    gap: "2%",
    flex:2
  },
  
  noImageContainer:{
    flex: 1,
    justifyContent: "center",
  },
})