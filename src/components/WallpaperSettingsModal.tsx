import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Switch,
  TouchableOpacity,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { PropsWithChildren } from 'react';
import { SelectList } from 'react-native-dropdown-select-list'
import Icon from 'react-native-vector-icons/Ionicons';
import { useGlobalState } from './utilFunctions';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  setWallpaper: (duration: number, isRandom: boolean, screen: string) => void;
}>;

export default function WallpaperSettings({ isVisible, onClose, setWallpaper }: Props) {
  const [duration, setDuration] = useState<number>(30); // Store duration in minutes
  const [isRandom, setIsRandom] = useState<boolean>(false); // Track whether wallpapers are random or serial
  const [screen, setScreen] = useState<string>(); // Store the screen where to set wallpaper
  const [isSettingWallpaper, setIsSettingWallpaper] = useState<boolean>(false);
  const { isDarkMode } = useGlobalState();

  const toggleSwitch = () => setIsRandom((prev) => !prev);
  const slideAnim = useRef(new Animated.Value(400)).current; // Initially off-screen

  // Animate modal out when it closes
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 400, // Slide out of the view
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {
      onClose(); // Notify the parent to update visibility
    });
  };

  const updateDuration = (multiplier:number, currHour: number) => {
    let change:number = 30;
    if(currHour >= 24)
      change = 360;
    else if(currHour >= 6)
      change = 60;

    setDuration(oldDuration => oldDuration + (multiplier*change))
  }

  const handleSetWallpaper = () => {
    let screenVal='BOTH';
    if(screen=='Lock Screen')
      screenVal='LOCK';
    else if(screen=='Home Screen')
      screenVal='HOME';
    
    setIsSettingWallpaper(true);
    setWallpaper(duration, isRandom, screenVal);
  }

  useEffect(()=>{
    setIsSettingWallpaper(false);
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0, // Fully visible (original position)
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }else{
      handleClose();
    }
  },[isVisible])


  return (
    <Animated.View style={[styles.modalContent, {backgroundColor: isDarkMode? "#111": "white", borderColor: isDarkMode? "grey": "lightgrey", shadowColor: isDarkMode? "white": "black", transform: [{ translateY: slideAnim }] }]} onTouchEnd={(e)=> e.stopPropagation()}>
      {/* Title and Close Button */}
      <View style={[styles.container, {marginBottom: 25}]}>
        <Text style={[styles.title, {color: isDarkMode? "white": "black"}]}>Customize Wallpaper Behavior</Text>
        {/* <Pressable onPress={handleClose}>
          <Icon name="close" size={20} color={isDarkMode? "white": "black"} />
        </Pressable> */}
      </View>

      <View style={styles.bodyContainer}>
        <View style={{position: "relative"}}>
        <Text style={{position: "absolute", top: -20, padding: 2, color: `${screen==undefined?"red": isDarkMode? "#111": "white"}`, fontSize:12, fontWeight: 300}}>Please select a wallpaper screen</Text>
        <SelectList
          data={[
            {key: '2', value: 'Lock Screen'},
            {key: '1', value: 'Home Screen'},
            {key: '3', value: 'Both the Screens'}
          ]}
          setSelected={setScreen}
          placeholder={`${screen==undefined?'Select wallpaper screen': screen}`}
          search={false}
          save={'value'}
          boxStyles={{...styles.dropdown, borderColor: `${screen==undefined? "red": "grey"}`}}
          dropdownStyles={{...styles.dropContainer, backgroundColor: isDarkMode? "#111": "white"}}
          inputStyles={{marginLeft: 5, color: isDarkMode? "white": "black"}}
          dropdownTextStyles={{color: isDarkMode? "white": "black"}}
          arrowicon={<Icon name="chevron-down" size={16} color={isDarkMode? "white": "black"} style={{marginRight: 5, paddingTop: 4}}/>}
        />
        </View>

        {/* Duration Input */}
        <View style={styles.container}>
          <Text style={[styles.label, {color: isDarkMode? "white": "black"}]}>Duration (in hours)</Text>
          <View style={{flexDirection: "row", flex: 2/3,}}>
            <TouchableOpacity
              style={{flex: 1, backgroundColor: "#c0f1f1", borderRadius: 5, justifyContent: "center", opacity: duration>30? 1: 0.4}}
              onPress={()=> updateDuration(-1, duration/60)}
              disabled={duration==30}
              >
              <Text style={{textAlign: "center", fontSize: 16, color: `${duration>30? "black": isDarkMode? "black": "grey"}`}}>-</Text>
            </TouchableOpacity>
            <Text style={{flex: 1, textAlign: "center", fontSize: 16, margin: 3, color: isDarkMode? "white": "black"}}>{duration/60}</Text>
            <TouchableOpacity
              style={{flex: 1, backgroundColor: "#c0f1f1", borderRadius: 5, justifyContent: "center", opacity: duration<2880? 1: 0.4}}
              onPress={()=> updateDuration(1, duration/60)}
              disabled={duration==2880}
              >
              <Text style={{textAlign: "center", fontSize: 16, color: `${duration<2880? "black": isDarkMode? "black": "grey"}`}}>+</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Random/Serial Switch */}
        <View style={styles.container}>
          <Text style={[styles.label, {color: isDarkMode? "white": "black"}]}>Shuffle between Wallpapers</Text>
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
          style={[styles.button, { backgroundColor: 'lightgreen', opacity: Number(`${screen==undefined ? 0.5 : 1}`) }]}
          onPress={handleSetWallpaper}
          disabled={screen==undefined || isSettingWallpaper}
        >
          {isSettingWallpaper?
            <>
            <ActivityIndicator size="small" color="grey" />
            <Text style={{color: 'grey', fontSize: 16}}>  Setting Wallpapers</Text>
            </>
            :
            <Text style={{color: `${screen==undefined ? '#fff' : '#000'}`, fontSize: 16,}}>Set Wallpapers</Text>
          }
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: 275,
    width: "95%",
    maxWidth: 500,
    borderRadius: 20,
    padding: 15,
    bottom: 60,
    left: "2.5%",
    position: "absolute",
    borderWidth: 0.5,
    elevation: 6
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
  },
  label: {
    fontSize: 14,
    marginLeft: 5
  },
  dropdown: {
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  dropContainer: {
    backgroundColor: "white",
    position: "absolute",
    zIndex: 1,
    top: 40,
    width: "100%",
    borderRadius: 10,
    borderWidth: 0.5,
  },
  button: {
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    
  },
});
