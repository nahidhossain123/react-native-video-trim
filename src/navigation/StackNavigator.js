import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import { useEffect, useState } from 'react';
import { SPLASH_SCREEN_KEYS } from '../storage/keys/AppKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import OnBoardingScreen from '../screens/OnBoardingScreen';

const Stack = createStackNavigator();

const StackNavigator = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem(SPLASH_SCREEN_KEYS.HAS_LAUNCHED);
      if(hasLaunched){
        setIsFirstLaunch(false)
      }else{
        setIsFirstLaunch(true)
      }
    };

    checkLaunch();
  }, []);

  if (isFirstLaunch === null) {
    return null; // Or splash/loading spinner
  }

  return (
   <Stack.Navigator screenOptions={{headerShown:false}}>
    {isFirstLaunch &&(<Stack.Screen name='OnboardingScreen' component={OnBoardingScreen} />)}
    <Stack.Screen name='Home' component={HomeScreen} />
     <Stack.Screen name='Video' component={VideoEditorScreen} />
   </Stack.Navigator>
  )
}

export default StackNavigator


