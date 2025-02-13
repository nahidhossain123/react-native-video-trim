import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EditScreen from '../screens/EditScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
   <Stack.Navigator screenOptions={{headerShown:false}}>
    {/* <Stack.Screen name='SplashScreen' component={SplashScreen} /> */}
    <Stack.Screen name='Home' component={HomeScreen} />
    <Stack.Screen name='Edit' component={EditScreen} />
   </Stack.Navigator>
  )
}

export default StackNavigator

