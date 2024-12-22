import React, { Key, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View, Modal, Dimensions, Image } from 'react-native'

type props = {
  url: string,
  removeImage: (url: string) => void,
}


export default function ImageCard({url, removeImage}: props) {
  
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.app}>
      <Pressable onLongPress={()=>setIsModalVisible(true)}>
        <Image source={{uri: url}} style={styles.image}/>
      </Pressable>
      
      {/* Modal for Image */}
      <Modal transparent={true} visible={isModalVisible} animationType="fade">
        <View style={styles.modalBackground} onTouchEnd={onModalClose}>
          <View style={styles.modalContent}>
            {/* Enlarged Image */}
            <Image
              source={{uri: url}}
              style={styles.enlargedImage}
              />
            {/* Remove Button */}
            <Pressable style={styles.removeButton} onPress={()=> removeImage(url)}>
              <Text style={styles.removeButtonText}>Remove Image</Text>
            </Pressable>
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
    backgroundColor: "rgba(0,0,0, 0.75)",
  },
  modalContent: {
    justifyContent: "center",
    alignItems: 'center',
    width: "100%",
    
  },
  enlargedImage: {
    aspectRatio: 1,
    height: "77%",
    resizeMode: "contain",
  },
  removeButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})