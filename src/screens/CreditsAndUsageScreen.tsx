import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ChevronLeftIcon,
  PlusIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { fetchWalletUsage } from '../api/employer';
import { useAuth } from '../context/AuthContext';

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  meta: object;
  created_at: string;
}

interface WalletUsageData {
  balance: number;
  transactions: Transaction[];
  credits_added: Transaction[];
  credits_spent: Transaction[];
  credits_returned: Transaction[];
}

const creditFilters = [
  { label: "All", value: "all" },
  { label: "Credits added", value: "added" },
  { label: "Credits spent", value: "spent" },
  { label: "Credits returned", value: "returned" },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function CreditsAndUsageScreen() {
  const navigation = useNavigation<any>();
  const { token, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletUsageData | null>(null);
  const [creditFilter, setCreditFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [token, authLoading]);

  const loadData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWalletUsage(token);
      setWalletData(data);
    } catch (err: any) {
      console.error("Failed to fetch wallet usage:", err);
      setError(err?.message || "Could not load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  const transactionsToDisplay = () => {
    if (!walletData) return [];
    switch (creditFilter) {
      case 'added':
        return walletData.credits_added;
      case 'spent':
        return walletData.credits_spent;
      case 'returned':
        return walletData.credits_returned;
      case 'all':
      default:
        return walletData.transactions;
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionMain}>
        <Text style={styles.transactionTitle}>
          {item.amount > 0 ? "Credits Added" : "Credits Spent"}
        </Text>
        <Text style={styles.transactionReason}>{item.reason}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: item.amount > 0 ? '#16a34a' : '#dc2626' }
        ]}>
          {item.amount > 0 ? `+${item.amount}` : item.amount}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.topCards}>
        {/* Available Credits Card */}
        <View style={styles.balanceCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Available Credits</Text>
          </View>
          <Text style={styles.balanceText}>
            {loading ? '...' : walletData?.balance ?? 0}
          </Text>
        </View>

        {/* Update Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <PlusIcon size={20} color="#fbb040" />
          </View>
          <Text style={styles.infoText}>
            You can now view detailed credit usage reports in the billing section.
          </Text>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Transaction History</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {creditFilters.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                creditFilter === f.value && styles.filterBtnActive
              ]}
              onPress={() => setCreditFilter(f.value)}
            >
              <Text style={[
                styles.filterBtnText,
                creditFilter === f.value && styles.filterBtnTextActive
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Credits & usage</Text>
      </View>

      {loading && !walletData ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fbb040" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactionsToDisplay()}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found for this filter.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7E0',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFF7E0',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#253858',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topCards: {
    gap: 16,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#fbb040',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.1)',
  },
  badge: {
    backgroundColor: '#FFF7E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.3)',
  },
  badgeText: {
    color: '#fbb040',
    fontSize: 12,
    fontWeight: '700',
  },
  balanceText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#253858',
    marginTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.1)',
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#b97a13',
    lineHeight: 18,
  },
  historyHeader: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#253858',
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContainer: {
    gap: 8,
    paddingRight: 16,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF7E0',
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.2)',
  },
  filterBtnActive: {
    backgroundColor: '#fbb040',
    borderColor: '#fbb040',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionMain: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#253858',
    marginBottom: 4,
  },
  transactionReason: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fbb040',
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
});
