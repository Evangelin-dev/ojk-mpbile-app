import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../components/Header';

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Header />
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This section is coming soon.</Text>
    </View>
  </View>
);

export const DashboardScreen = () => <PlaceholderScreen title="Dashboard" />;
export const DatabaseScreen = () => <PlaceholderScreen title="Database" />;
export const ApplicationsScreen = () => <PlaceholderScreen title="Job Applications" />;
export const ReportsScreen = () => <PlaceholderScreen title="Reports" />;
export const CreditsScreen = () => <PlaceholderScreen title="Credits & Usage" />;
export const PlansScreen = () => <PlaceholderScreen title="Plans" />;
export const BillingScreen = () => <PlaceholderScreen title="Billing" />;
export const SupportScreen = () => <PlaceholderScreen title="Help & Support" />;
export const SalesScreen = () => <PlaceholderScreen title="Contact Sales" />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
});
