import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { PropsWithChildren } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import {OpenOptimizationSettings, BatteryOptEnabled } from "react-native-battery-optimization-check";
import { useGlobalState } from './utilFunctions';

type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function Settings({ isVisible, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(400)).current; // Initially off-screen
  const [isBatteryOptEnabled, setIsBatteryOptEnabled] = useState<boolean>(true);
  const { isDarkMode } = useGlobalState();

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

  useEffect(()=>{
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

    BatteryOptEnabled().then((isEnabled: boolean)=>{
      setIsBatteryOptEnabled(isEnabled);
    })
  },[isVisible])


  return (
    <Animated.View style={[styles.modalContent, {backgroundColor: isDarkMode? "#111": "white", borderColor: isDarkMode? "grey": "lightgrey", shadowColor: isDarkMode? "white": "black", transform: [{ translateY: slideAnim }] }]} onTouchEnd={(e)=> e.stopPropagation()}>
      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.option}>
          <MaterialCommunityIcons name="layers-off-outline" size={20} color={isDarkMode? "#ddd":"rgb(77, 78, 79)"}/>
          <Text style={[styles.optionText, {color: isDarkMode? "#ddd": "rgb(77, 78, 79)"}]}>Stop Wallpapers</Text>
        </TouchableOpacity>  
        <TouchableOpacity style={styles.option}>
          <MaterialCommunityIcons name="theme-light-dark" size={20} color={isDarkMode? "#ddd":"rgb(77, 78, 79)"}/>
          <Text style={[styles.optionText, {color: isDarkMode? "#ddd": "rgb(77, 78, 79)"}]}>Change{`\n`}app theme</Text>
        </TouchableOpacity>  
        <TouchableOpacity style={styles.option}>
          <MaterialCommunityIcons name="wallet" size={20} color={isDarkMode? "#ddd":"rgb(77, 78, 79)"}/>
          <Text style={[styles.optionText, {color: isDarkMode? "#ddd": "rgb(77, 78, 79)"}]}>Support{`\n`}my work</Text>
        </TouchableOpacity>  
        <TouchableOpacity style={styles.option}>
          <MaterialCommunityIcons name="information-outline" size={20} color={isDarkMode? "#ddd":"rgb(77, 78, 79)"}/>
          <Text style={[styles.optionText, {color: isDarkMode? "#ddd": "rgb(77, 78, 79)"}]}>About{`\n`}the app</Text>
        </TouchableOpacity>  
      </View>

      <TouchableOpacity disabled={!isBatteryOptEnabled} onPress={OpenOptimizationSettings}>
        <View style={[styles.container, {backgroundColor: isDarkMode? "#333": "#efefef", borderRadius: 15, paddingHorizontal: 15, paddingVertical: 5}]}>
          <Text style={{fontSize: 14, textAlign: "justify", color: isDarkMode? "#ddd": "rgb(77, 78, 79)"}}>{isBatteryOptEnabled? "Disable Battery Optimizations": "Battery Optimizations are disabled"}{`\n`}for reliable wallpaper transitions</Text>
          <MaterialCommunityIcons name={isBatteryOptEnabled?"battery-alert-variant": "battery-check"} size={26} color={isDarkMode? "#ddd":"rgb(77, 78, 79)"}/>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  modalContent: {    
    width: "95%",
    maxWidth: 500,
    borderRadius: 20,
    padding: 15,
    bottom: 60,
    left: "2.5%",
    position: "absolute",
    borderWidth: 0.5,
    elevation: 6,
    justifyContent: "space-between"
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContainer: {
    flexDirection: "row",
    marginBottom: 15
  },
  option: {
    flex: 1/4,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  optionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 3
  }
});