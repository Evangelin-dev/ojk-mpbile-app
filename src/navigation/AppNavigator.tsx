import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import BlogScreen from '../screens/BlogScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import BrowseJobsScreen from '../screens/BrowseJobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import PostJobScreen from '../screens/PostJobScreen';
import EmployerProfileScreen from '../screens/EmployerProfileScreen';
import EmployerDashboardScreen from '../screens/EmployerDashboardScreen';
import EmployerApplicationsScreen from '../screens/EmployerApplicationsScreen';
import CreditsAndUsageScreen from '../screens/CreditsAndUsageScreen';
import MenuScreen from '../screens/MenuScreen';
import Svg, { Path, Rect, Circle, Text as SvgText } from 'react-native-svg';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  UserGroupIcon,
  Bars3Icon,
} from 'react-native-heroicons/outline';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const JobStack = createNativeStackNavigator();

// Stack for Jobs
function JobStackNavigator() {
  return (
    <JobStack.Navigator screenOptions={{ headerShown: false }}>
      <JobStack.Screen name="JobList" component={BrowseJobsScreen} />
      <JobStack.Screen name="JobDetail" component={JobDetailScreen} />
    </JobStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return (
              <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </Svg>
            );
          } else if (route.name === 'Jobs') {
            return (
              <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </Svg>
            );
          } else if (route.name === 'Applications') {
            return (
              <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </Svg>
            );
          } else if (route.name === 'Actions') {
            return <Bars3Icon size={size} color={color} />;
          } else if (route.name === 'Dashboard') {
            return <Squares2X2Icon size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Jobs"
        component={JobStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset the stack to the first screen when clicking the tab
            navigation.navigate('Jobs', { screen: 'JobList' });
          },
        })}
      />
      <Tab.Screen name="Dashboard" component={EmployerDashboardScreen} />
      <Tab.Screen name="Applications" component={EmployerApplicationsScreen} />
      <Tab.Screen
        name="Actions"
        component={View}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Menu');
          },
        })}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="EmployerProfile" component={EmployerProfileScreen} />
        <Stack.Screen name="CreditsAndUsage" component={CreditsAndUsageScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="PostJob" component={PostJobScreen} />
        <Stack.Screen
          name="Login" 
          component={LoginScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
});
