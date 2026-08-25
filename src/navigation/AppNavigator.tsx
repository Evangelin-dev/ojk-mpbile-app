import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import BlogScreen from '../screens/BlogScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';
import BrowseJobsScreen from '../screens/BrowseJobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import PostJobScreen from '../screens/PostJobScreen';
import * as Placeholders from '../screens/PlaceholderScreens';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const BlogStack = createNativeStackNavigator();
const JobStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// --- Sidebar Icons ---
const SidebarIcon = ({ name, color, size = 20 }: { name: string, color: string, size?: number }) => {
  switch (name) {
    case 'Dashboard':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></Svg>;
    case 'Jobs':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></Svg>;
    case 'Database':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m0 10c0 1.657-3.582 3-8 3s-8-1.343-8-3V7m16 0c0 1.657-3.582 3-8 3S4 8.657 4 7m16 0c0-1.657-3.582-3-8-3S4 5.343 4 7" /></Svg>;
    case 'Applications':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Svg>;
    case 'Reports':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></Svg>;
    case 'Credits':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.72 1.055M12 8V7m0 11v-1m0 0c-1.11 0-2.08-.407-2.72-1.055M12 17V7m-5 1h10a2 2 0 012 2v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4a2 2 0 012-2z" /></Svg>;
    case 'Plans':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></Svg>;
    case 'Billing':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></Svg>;
    case 'Support':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></Svg>;
    case 'Sales':
      return <Svg width={size} height={size} fill="none" viewBox="0 0 24 24"><Path stroke={color} strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></Svg>;
    default:
      return null;
  }
};

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#fff' }}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoRow}>
          <Svg width={40} height={40} viewBox="0 0 100 100">
             <Circle cx="50" cy="50" r="40" fill="#2563eb" />
             <Text style={{ fill: '#fff', fontSize: 40, fontWeight: 'bold' }}>OJK</Text>
          </Svg>
          <Text style={styles.logoText}>OJK JOBS</Text>
        </View>
      </View>

      <DrawerItem
        label="Dashboard"
        icon={({ color }) => <SidebarIcon name="Dashboard" color={color} />}
        onPress={() => props.navigation.navigate('Dashboard')}
      />
      <DrawerItem
        label="Jobs"
        icon={({ color }) => <SidebarIcon name="Jobs" color={color} />}
        onPress={() => props.navigation.navigate('JobsList')}
      />
      <DrawerItem
        label="Database"
        icon={({ color }) => <SidebarIcon name="Database" color={color} />}
        onPress={() => props.navigation.navigate('Database')}
      />
      <DrawerItem
        label="Job Applications"
        icon={({ color }) => <SidebarIcon name="Applications" color={color} />}
        onPress={() => props.navigation.navigate('Applications')}
      />
      <DrawerItem
        label="Reports"
        icon={({ color }) => <SidebarIcon name="Reports" color={color} />}
        onPress={() => props.navigation.navigate('Reports')}
      />
      <DrawerItem
        label="Credits & usage"
        icon={({ color }) => <SidebarIcon name="Credits" color={color} />}
        onPress={() => props.navigation.navigate('Credits')}
      />
      <DrawerItem
        label="Plans"
        icon={({ color }) => <SidebarIcon name="Plans" color={color} />}
        onPress={() => props.navigation.navigate('Plans')}
      />
      <DrawerItem
        label="Billing"
        icon={({ color }) => <SidebarIcon name="Billing" color={color} />}
        onPress={() => props.navigation.navigate('Billing')}
      />
      <View style={styles.drawerDivider} />
      <DrawerItem
        label="Help & Support"
        icon={({ color }) => <SidebarIcon name="Support" color={color} />}
        onPress={() => props.navigation.navigate('Support')}
      />
      <DrawerItem
        label="Contact Sales"
        icon={({ color }) => <SidebarIcon name="Sales" color={color} />}
        onPress={() => props.navigation.navigate('Sales')}
      />
    </DrawerContentScrollView>
  );
}

function EmployerDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#2563eb',
        drawerInactiveTintColor: '#475569',
        drawerLabelStyle: {
          fontWeight: '600',
          fontSize: 14,
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={Placeholders.DashboardScreen} />
      <Drawer.Screen name="JobsList" component={JobStackNavigator} />
      <Drawer.Screen name="Database" component={Placeholders.DatabaseScreen} />
      <Drawer.Screen name="Applications" component={Placeholders.ApplicationsScreen} />
      <Drawer.Screen name="Reports" component={Placeholders.ReportsScreen} />
      <Drawer.Screen name="Credits" component={Placeholders.CreditsScreen} />
      <Drawer.Screen name="Plans" component={Placeholders.PlansScreen} />
      <Drawer.Screen name="Billing" component={Placeholders.BillingScreen} />
      <Drawer.Screen name="Support" component={Placeholders.SupportScreen} />
      <Drawer.Screen name="Sales" component={Placeholders.SalesScreen} />
    </Drawer.Navigator>
  );
}

// Stack for Blog
function BlogStackNavigator() {
  return (
    <BlogStack.Navigator screenOptions={{ headerShown: false }}>
      <BlogStack.Screen name="BlogList" component={BlogScreen} />
      <BlogStack.Screen name="BlogDetail" component={BlogDetailScreen} />
    </BlogStack.Navigator>
  );
}

// Stack for Jobs
function JobStackNavigator() {
  return (
    <JobStack.Navigator screenOptions={{ headerShown: false }}>
      <JobStack.Screen name="JobList" component={BrowseJobsScreen} />
      <JobStack.Screen name="JobDetail" component={JobDetailScreen} />
      <JobStack.Screen name="PostJob" component={PostJobScreen} />
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
          } else if (route.name === 'Blog') {
            return (
              <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </Svg>
            );
          } else if (route.name === 'Profile') {
            return (
              <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
                <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </Svg>
            );
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Jobs" component={JobStackNavigator} />
      <Tab.Screen name="Blog" component={BlogStackNavigator} />
      <Tab.Screen name="Profile" component={EmployerDrawerNavigator} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
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
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
    marginHorizontal: 20,
  },
});
