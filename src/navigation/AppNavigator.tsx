import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import EmployerRegistrationScreen from '../screens/EmployerRegistrationScreen';
import CandidateRegistrationScreen from '../screens/CandidateRegistrationScreen';
import BlogScreen from '../screens/BlogScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import BrowseJobsScreen from '../screens/BrowseJobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import PostJobScreen from '../screens/PostJobScreen';
import EmployerProfileScreen from '../screens/EmployerProfileScreen';
import EmployerDashboardScreen from '../screens/EmployerDashboardScreen';
import EmployerApplicationsScreen from '../screens/EmployerApplicationsScreen';
import CandidateApplicationsScreen from '../screens/CandidateApplicationsScreen';
import CandidateProfileScreen from '../screens/CandidateProfileScreen';
import CandidateDashboardScreen from '../screens/CandidateDashboardScreen';
import LearningScreen from '../screens/LearningScreen';
import ResumeBuilderScreen from '../screens/ResumeBuilderScreen';
import CreditsAndUsageScreen from '../screens/CreditsAndUsageScreen';
import EmployerPricingPlansScreen from '../screens/EmployerPricingPlansScreen';
import ReportsDashboardScreen from '../screens/ReportsDashboardScreen';
import SearchCandidatesScreen from '../screens/SearchCandidatesScreen';
import CandidateSearchListScreen from '../screens/CandidateSearchListScreen';
import SavedSearchesScreen from '../screens/SavedSearchesScreen';
import MenuScreen from '../screens/MenuScreen';
import BillingScreen from '../screens/BillingScreen';
import ContactScreen from '../screens/ContactScreen';
import Svg, { Path, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  UserGroupIcon,
  Bars3Icon,
  NewspaperIcon,
  ChatBubbleLeftIcon,
} from 'react-native-heroicons/outline';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const JobStack = createNativeStackNavigator();
const ActionsStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

// Stack for Dashboard (to keep bottom navbar)
function DashboardStackNavigator() {
  const { user } = useAuth();
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      {user?.role === 'EMPLOYER' ? (
        <DashboardStack.Screen name="EmployerDashboard" component={EmployerDashboardScreen} />
      ) : (
        <>
          <DashboardStack.Screen name="CandidateDashboard" component={CandidateDashboardScreen} />
          <DashboardStack.Screen name="Learning" component={LearningScreen} />
          <DashboardStack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
          <DashboardStack.Screen name="CandidateProfile" component={CandidateProfileScreen} />
        </>
      )}
    </DashboardStack.Navigator>
  );
}

// Stack for Jobs
function JobStackNavigator() {
  return (
    <JobStack.Navigator screenOptions={{ headerShown: false }}>
      <JobStack.Screen name="JobList" component={BrowseJobsScreen} />
      <JobStack.Screen name="JobDetail" component={JobDetailScreen} />
    </JobStack.Navigator>
  );
}

// Stack for Actions / Settings
function ActionsStackNavigator() {
  return (
    <ActionsStack.Navigator screenOptions={{ headerShown: false }}>
      <ActionsStack.Screen name="Menu" component={MenuScreen} />
      <ActionsStack.Screen name="CreditsAndUsage" component={CreditsAndUsageScreen} />
      <ActionsStack.Screen name="EmployerPricingPlans" component={EmployerPricingPlansScreen} />
      <ActionsStack.Screen name="ReportsDashboard" component={ReportsDashboardScreen} />
      <ActionsStack.Screen name="EmployerProfile" component={EmployerProfileScreen} />
      <ActionsStack.Screen name="SearchCandidates" component={SearchCandidatesScreen} />
      <ActionsStack.Screen name="CandidateSearchList" component={CandidateSearchListScreen} />
      <ActionsStack.Screen name="SavedSearches" component={SavedSearchesScreen} />
      <ActionsStack.Screen name="Billing" component={BillingScreen} />
    </ActionsStack.Navigator>
  );
}

function TabNavigator() {
  const { user } = useAuth();

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
          } else if (route.name === 'Applications' || route.name === 'My Application') {
            return (
              <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </Svg>
            );
          } else if (route.name === 'Actions') {
            return <Bars3Icon size={size} color={color} />;
          } else if (route.name === 'Dashboard') {
            return <Squares2X2Icon size={size} color={color} />;
          } else if (route.name === 'Blog') {
            return <NewspaperIcon size={size} color={color} />;
          } else if (route.name === 'Contact') {
            return <ChatBubbleLeftIcon size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      {user ? (
        user.role === 'EMPLOYER' ? (
          <Tab.Screen
            name="Jobs"
            component={JobStackNavigator}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                navigation.navigate('Jobs', { screen: 'JobList' });
              },
            })}
          />
        ) : (
          <Tab.Screen name="My Application" component={CandidateApplicationsScreen} />
        )
      ) : (
        <Tab.Screen
          name="Jobs"
          component={JobStackNavigator}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              navigation.navigate('Jobs', { screen: 'JobList' });
            },
          })}
        />
      )}

      {user && (
        <Tab.Screen
          name="Dashboard"
          component={DashboardStackNavigator}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (user?.role === 'EMPLOYER') {
                navigation.navigate('Dashboard', { screen: 'EmployerDashboard' });
              } else {
                navigation.navigate('Dashboard', { screen: 'CandidateDashboard' });
              }
            },
          })}
        />
      )}

      {user ? (
        user.role === 'EMPLOYER' ? (
          <Tab.Screen name="Applications" component={EmployerApplicationsScreen} />
        ) : (
          <Tab.Screen
            name="Jobs"
            component={JobStackNavigator}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                navigation.navigate('Jobs', { screen: 'JobList' });
              },
            })}
          />
        )
      ) : (
        <Tab.Screen name="Blog" component={BlogScreen} />
      )}

      {user ? (
        user.role === 'EMPLOYER' ? (
          <Tab.Screen
            name="Actions"
            component={ActionsStackNavigator}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                navigation.navigate('Actions', { screen: 'Menu' });
              },
            })}
          />
        ) : (
          <Tab.Screen name="Contact" component={ContactScreen} options={{ tabBarLabel: 'Contact Us' }} />
        )
      ) : (
        <Tab.Screen name="Contact" component={ContactScreen} />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="PostJob" component={PostJobScreen} />
        <Stack.Screen name="EmployerProfile" component={EmployerProfileScreen} />
        <Stack.Screen name="EmployerPricingPlans" component={EmployerPricingPlansScreen} />
        <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
        <Stack.Screen
          name="Login" 
          component={LoginScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="EmployerRegistration"
          component={EmployerRegistrationScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="CandidateRegistration"
          component={CandidateRegistrationScreen}
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
