import React, { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native';
import {
  StyleSheet,
  View,
  Modal,
  Image,
  TouchableOpacity,
  BackHandler
} from 'react-native'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

type props = {
  url: string,
  removeImage: (url: string) => void,
}

export default function ImageCard({url, removeImage}: props) { 
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const isDarkMode = useColorScheme() === 'dark';

  const onModalOpen = () => {
    setIsModalVisible(true);
  }

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const backAction = () => {
      if (isModalVisible) {
        onModalClose();
        return true;
      }
      return false; // Allow default back button behavior if no modals are open
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the listener
  }, [isModalVisible]);

  return (
    <View style={styles.app}>
      <TouchableOpacity activeOpacity={0.75} onLongPress={onModalOpen}>
        <Image source={{uri: url}} style={styles.image}/>
      </TouchableOpacity>
      
      {/* Modal for Image */}
      <Modal statusBarTranslucent transparent={true} visible={isModalVisible} animationType="fade" onRequestClose={onModalClose}>
        <View style={[styles.modalBackground, {backgroundColor: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"}]} onTouchEnd={onModalClose}>
          <View style={styles.modalContent} onTouchEnd={(e)=>e.stopPropagation()}>
            <Image source={{uri: url}} style={styles.enlargedImage}/>
            <TouchableOpacity onPress={()=>removeImage(url)} style={{position: "absolute", bottom: 10, right: 10, backgroundColor: "rgba(250, 250, 250, 0.75)", padding: 7, borderRadius: 50}}>
              <MaterialCommunityIcons name="delete" size={32}/>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  app:{
    width: "32%",
    height: 150,
    borderRadius: 10,
  },
  image:{
    height: "100%",
    borderRadius: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    justifyContent: "center",
    alignItems: 'center',
  },
  enlargedImage: {
    width: "95%",
    aspectRatio: 2/3,
    borderRadius: 10,
  },
})