import React, { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native';
import { StyleSheet, Text, View, Modal, Image, TouchableOpacity, BackHandler } from 'react-native'

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
        <View style={[styles.modalBackground, {backgroundColor: isDarkMode? "rgba(0, 0, 0, 0.7)" : "rgba(234, 228, 228, 0.8)"}]} onTouchEnd={onModalClose}>
          <View style={styles.modalContent}>
            {/* Enlarged Image */}
            <View style={{width: "95%"}}>
            <Image
              source={{uri: url}}
              style={styles.enlargedImage}
              />

            </View>
            {/* Remove Button */}
            <TouchableOpacity activeOpacity={0.8} style={styles.removeButton} onPress={()=> removeImage(url)}>
              <Text style={styles.removeButtonText}>Remove Image</Text>
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
    width: "100%",
  },
  enlargedImage: {
    width: "100%",
    aspectRatio: 2/3,
    borderRadius: 5,
    resizeMode: "contain",
  },
  removeButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 20,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})