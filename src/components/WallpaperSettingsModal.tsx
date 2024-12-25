import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput, Switch, TouchableOpacity, Linking } from 'react-native';
import { PropsWithChildren } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  setWallpaper: (duration: number, isRandom: boolean, screen: string) => void;
}>;

export default function WallpaperSettings({ isVisible, onClose, setWallpaper }: Props) {
  const [duration, setDuration] = useState<number>(30); // Store duration in minutes
  const [isRandom, setIsRandom] = useState<boolean>(false); // Track whether wallpapers are random or serial
  const [screen, setScreen] = useState<string>(); // Store the screen where to set wallpaper

  const toggleSwitch = () => setIsRandom((prev) => !prev);

  return (
    <Modal animationType="none" transparent={true} visible={isVisible}>
      <View style={styles.modalBackground} onTouchEnd={onClose}>
        <View style={styles.modalContent} onTouchEnd={(e)=> e.stopPropagation()}>
          {/* Title and Close Button */}
          <View style={[styles.container, {marginBottom: 10}]}>
            <Text style={styles.title}>Customize Behavior</Text>
            <Pressable onPress={onClose}>
              <Icon name="close" size={20} />
            </Pressable>
          </View>

          <View style={styles.bodyContainer}>
            {/* Duration Input */}
            <View style={styles.container}>
              <Text style={styles.label}>Duration (in hours)</Text>
              <View style={{flexDirection: "row", flex: 2/3,}}>
                <TouchableOpacity
                  style={{flex: 1, backgroundColor: "#c0f1f1", borderRadius: 5, justifyContent: "center"}}
                  onPress={()=> setDuration(oldDuration => oldDuration - 30)}
                  disabled={duration==30}
                  >
                  <Text style={{textAlign: "center", fontSize: 16, color: `${duration>30? "black": "#fafafa"}`}}>-</Text>
                </TouchableOpacity>
                <Text style={{flex: 1, textAlign: "center", fontSize: 16, margin: 3}}>{duration/60}</Text>
                <TouchableOpacity
                  style={{flex: 1, backgroundColor: "#c0f1f1", borderRadius: 5, justifyContent: "center"}}
                  onPress={()=> setDuration(oldDuration => oldDuration + 30)}
                  disabled={duration==1440}
                  >
                  <Text style={{textAlign: "center", fontSize: 16, color: `${duration<1440? "black": "#fafafa"}`}}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
         
            <View style={{marginVertical: 10, position: "relative"}}>
            <Dropdown
              style={[styles.dropdown, {borderColor: `${screen==undefined ? "red" : 'gray'}`}]}
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
            <Text style={{position: "absolute", bottom: -20, padding: 3, color: `${screen==undefined?"red": "white"}`, fontSize:12, fontWeight: 300}}>Please select a wallpaper screen</Text>
            </View>

            {/* Random/Serial Switch */}
            <View style={styles.container}>
              <Text style={styles.label}>Shuffle between Wallpapers</Text>
              <Switch
                value={isRandom}
                onValueChange={toggleSwitch}
                thumbColor={`${isRandom? "lightgreen" : "#c0f1f1"}`}
                trackColor={{ false: "#c0f1f1", true: "lightgreen" }}
              />
            </View>

            {/* Set Wallpaper Button */}
            <TouchableOpacity
              activeOpacity={0.6}
              style={[styles.button, { backgroundColor: 'lightgreen' }]}
              onPress={() => setWallpaper(duration, isRandom, screen!)}
            >
              <Text style={styles.buttonLabel}>Set Wallpaper</Text>
            </TouchableOpacity>
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
    backgroundColor: "rgba(75,75,75, 0.7)",
  },
  modalContent: {
    height: 280,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderStyle: "solid",
    borderWidth: 1,
  },
  container: {
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
    justifyContent: "space-between",
    paddingTop: 5
  },
  label: {
    flex: 1,
    fontSize: 14,
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
    height: 40,
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
