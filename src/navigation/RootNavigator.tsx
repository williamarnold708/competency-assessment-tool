import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminBulkAddItemsScreen from '../screens/AdminBulkAddItemsScreen';
import AdminCandidatesScreen from '../screens/AdminCandidatesScreen';
import AdminItemBankScreen from '../screens/AdminItemBankScreen';
import AdminItemFormScreen from '../screens/AdminItemFormScreen';
import AdminTaskDetailScreen from '../screens/AdminTaskDetailScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import NewAuditSetupScreen from '../screens/NewAuditSetupScreen';
import RecordScreen from '../screens/RecordScreen';
import ResultScreen from '../screens/ResultScreen';
import SignoffScreen from '../screens/SignoffScreen';
import { color } from '../theme/tokens';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: color.bg },
};

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg }}>
        <ActivityIndicator color={color.text} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="NewAuditSetup" component={NewAuditSetupScreen} />
            <Stack.Screen name="Checklist" component={ChecklistScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Signoff" component={SignoffScreen} />
            <Stack.Screen name="Record" component={RecordScreen} />
            <Stack.Screen name="AdminItemBank" component={AdminItemBankScreen} />
            <Stack.Screen name="AdminTaskDetail" component={AdminTaskDetailScreen} />
            <Stack.Screen name="AdminBulkAddItems" component={AdminBulkAddItemsScreen} />
            <Stack.Screen name="AdminItemForm" component={AdminItemFormScreen} />
            <Stack.Screen name="AdminCandidates" component={AdminCandidatesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
