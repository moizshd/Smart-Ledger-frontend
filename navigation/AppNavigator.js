import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CategoryScreen from '../screens/CategoryScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IssueScreen from '../screens/IssueScreen';
import ItemScreen from '../screens/ItemScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import StoreScreen from '../screens/StoreScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="Item" component={ItemScreen} />
        <Stack.Screen name="Issue" component={IssueScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
