import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import EditScreen from '../screens/EditScreen';
import SplashScreen from '../screens/SplashScreen';
import { createStaticNavigation } from '@react-navigation/native';

const MyStackNavigator = createStackNavigator({
  screens: {
    Home: HomeScreen,
    Edit:EditScreen ,
    Splash:SplashScreen
  },
});

export const Navigation = createStaticNavigation(MyStackNavigator);