import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EditScreen from '../screens/EditScreen';
import SplashScreen from '../screens/SplashScreen';
import { useEffect, useState } from 'react';
import { SPLASH_SCREEN_KEYS } from '../storage/keys/AppKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VideoEditorScreen from '../screens/VideoEditorScreen';
import TestScreen1 from '../screens/VideoScreen';
import DetailsScreen from '../screens/DetailsScreen';
import VideoScreen from '../screens/VideoScreen';

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
    {isFirstLaunch &&(<Stack.Screen name='SplashScreen' component={SplashScreen} />)}
    <Stack.Screen name='Home' component={HomeScreen} />
     <Stack.Screen name='VideoEditor' component={VideoEditorScreen} />
     <Stack.Screen name='Video' component={VideoScreen} />
     <Stack.Screen name='DetailsScreen' component={DetailsScreen} sharedElements={() => ['video']} />
    <Stack.Screen name='Edit' component={EditScreen}    options={{
          gestureEnabled: false,  
        }} />
   </Stack.Navigator>
  )
}

export default StackNavigator


