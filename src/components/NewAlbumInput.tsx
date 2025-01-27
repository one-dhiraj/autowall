import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
  TextInput,
  Modal
} from 'react-native';
import { PropsWithChildren } from 'react';
import { useGlobalState } from './utilFunctions';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  placeholder: string;
  createNewAlbum: (albumName: string) => void;
}>;

export default function NewAlbumInput({ isVisible, onClose, placeholder, createNewAlbum }: Props) {
  const slideAnim = useRef(new Animated.Value(500)).current; // Initially off-screen
  const [inputText, setInputText] = useState<string>("");
  const { isDarkMode } = useGlobalState();
  const inputRef = useRef<TextInput>(null);

  const handleClose = () => {
    setInputText("");
    inputRef?.current?.blur();
    Animated.timing(slideAnim, {
      toValue: 500, // Slide out of the view
      duration:200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      onClose(); // Notify the parent to update visibility
    });
  };

  useEffect(() => {
    if (isVisible) {
      setInputText(placeholder)
      Animated.timing(slideAnim, {
        toValue: 0, // Fully visible (original position)
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(()=>inputRef?.current?.focus());
    } else {
      handleClose();
    }
  }, [isVisible]);

  return (
    <Modal
      statusBarTranslucent
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={[styles.overlay, {backgroundColor: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"}]}
        onTouchEnd={handleClose}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? '#111' : 'white',
              borderColor: isDarkMode ? 'grey' : 'lightgrey',
              shadowColor: isDarkMode ? 'white' : 'black',
              transform: [{ translateY: slideAnim }],
            },
          ]}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                borderColor: isDarkMode ? 'grey' : 'lightgrey',
                color: isDarkMode ? 'white' : 'black',
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => createNewAlbum(inputText)}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 15,
    padding: 15,
    position: 'relative',
    borderWidth: 0.5,
    elevation: 6,
    justifyContent: 'space-between',
  },
  textInput: {
    height: 50,
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 25,
    fontSize: 18
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  cancelButton: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: 'lightgrey',
    flex: 1 / 3,
  },
  nextButton: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: 'lightgreen',
    flex: 1 / 3,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
