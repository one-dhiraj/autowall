import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput, Switch } from 'react-native';
import { PropsWithChildren } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  setWallpaper: (duration: string, isRandom: boolean, screen: string) => void;
}>;

export default function WallpaperSettings({ isVisible, onClose, setWallpaper }: Props) {
  const [duration, setDuration] = useState<string>('30'); // Store duration as a string for input field
  const [isRandom, setIsRandom] = useState<boolean>(false); // Track whether wallpapers are random or serial
  const [screen, setScreen] = useState<string>(); // Store the screen where to set wallpaper

  const toggleSwitch = () => setIsRandom((prev) => !prev);

  return (
    <Modal animationType="none" transparent={true} visible={isVisible}>
      <View style={styles.modalBackground} onTouchEnd={onClose}>
        <View style={styles.modalContent} onTouchEnd={(e)=> e.stopPropagation()}>
          {/* Title and Close Button */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Customize Behavior</Text>
            <Pressable onPress={onClose}>
              <Text>X</Text>
            </Pressable>
          </View>

          <View style={styles.bodyContainer}>
            {/* Duration Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Duration (in hours):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter duration"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
         
            <Dropdown
              style={styles.dropdown}
              data={[
                {label: 'Home Screen', value: 'HOME'},
                {label: 'Lock Screen', value: 'LOCK'},
                {label: 'Both Screens', value: 'BOTH'}
              ]}
              placeholderStyle={styles.label}
              itemTextStyle={styles.label}
              selectedTextStyle={styles.label}
              itemContainerStyle={styles.itemContainer}
              labelField="label"
              valueField="value"
              placeholder={'Select wallpaper screen'}
              value={screen}
              onChange={item => setScreen(item.value)}
            />

            {/* Random/Serial Switch */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Shuffle between Wallpapers</Text>
              <Switch
                value={isRandom}
                onValueChange={toggleSwitch}
                thumbColor={"lightgreen"}
                trackColor={{ false: "lightgrey", true: "lightgreen" }}
              />
            </View>

            {/* Set Wallpaper Button */}
            <Pressable
              style={[styles.button, { backgroundColor: 'lightgreen' }]}
              onPress={() => setWallpaper(duration, isRandom, screen!)}
            >
              <Text style={styles.buttonLabel}>Set Wallpaper</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: 300,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderStyle: "solid",
    borderWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bodyContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  inputContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  dropdown: {
    marginTop: 10,
    height: 40,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  itemContainer: {
    borderRadius: 10,
    
  },
  button: {
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 3,
  },
  buttonLabel: {
    color: '#000',
    fontSize: 16,
  },
});
