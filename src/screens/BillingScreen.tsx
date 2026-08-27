import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  ChevronLeftIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchBillingHistory } from '../api/employer';
import { Header } from '../components/Header';

interface ApiPayment {
  id: number;
  razorpayOrderId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

interface BillingRecord {
  id: number;
  date: string;
  plan: string;
  expires: string;
  amount: string;
  status: 'Success' | 'Failed' | 'Pending';
  action: 'Invoice' | 'Contact us';
  razorpayOrderId: string;
}

const BILLING_RESULTS_PER_PAGE = 10;

const billingFilters = [
  { label: "All", value: "all" },
  { label: "Success", value: "success" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const transformApiToBilling = (payment: ApiPayment): BillingRecord => {
  const purchaseDate = new Date(payment.createdAt);
  let expires = '-';
  if (payment.status === 'SUCCESS') {
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(purchaseDate.getDate() + 30);
    expires = expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const statusMap = {
    'SUCCESS': 'Success',
    'FAILED': 'Failed',
    'PENDING': 'Pending'
  };

  return {
    id: payment.id,
    date: purchaseDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    plan: `Plan Purchase (₹${payment.amount})`,
    expires,
    amount: `₹ ${payment.amount}`,
    status: statusMap[payment.status] as BillingRecord['status'],
    action: payment.status === 'SUCCESS' ? 'Invoice' : 'Contact us',
    razorpayOrderId: payment.razorpayOrderId,
  };
};

const BillingScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadBillingData();
  }, [page, filter, token]);

  const loadBillingData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: BILLING_RESULTS_PER_PAGE,
      };

      if (filter !== 'all') {
        params.status = filter.toUpperCase();
      }

      const response = await fetchBillingHistory(params, token);
      if (response.success && response.data) {
        const { payments, meta } = response.data;
        setBillingHistory(payments.map(transformApiToBilling));
        setTotalPages(meta.totalPaymentPages || 1);
        setTotalResults(meta.totalPayments || 0);
      } else {
        setError("Failed to load billing data.");
      }
    } catch (err) {
      console.error("Failed to fetch billing history:", err);
      setError("Could not load billing history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoiceClick = (billing: BillingRecord) => {
    Alert.alert(
      "Invoice",
      "Invoice generation is currently only available on the web portal. Would you like to contact support for a copy?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Contact Support", onPress: () => navigation.navigate('Menu', { screen: 'support' }) }
      ]
    );
  };

  const renderBillingItem = ({ item }: { item: BillingRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Success' ? styles.statusSuccess :
          item.status === 'Failed' ? styles.statusFailed : styles.statusPending
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Success' ? styles.statusTextSuccess :
            item.status === 'Failed' ? styles.statusTextFailed : styles.statusTextPending
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.cardPlan}>{item.plan}</Text>

      <View style={styles.cardDetails}>
        <View>
          <Text style={styles.detailLabel}>Expires</Text>
          <Text style={styles.detailValue}>{item.expires}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>{item.amount}</Text>
        </View>
      </View>

      {item.action === 'Invoice' && (
        <TouchableOpacity
          style={styles.invoiceBtn}
          onPress={() => handleInvoiceClick(item)}
        >
          <ArrowDownTrayIcon size={16} color="#fbb040" />
          <Text style={styles.invoiceBtnText}>Download Invoice</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color="#fbb040" />
          </TouchableOpacity>
          <Text style={styles.title}>Billing History</Text>
        </View>

        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {billingFilters.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterBtn,
                  filter === f.value ? styles.filterBtnActive : styles.filterBtnInactive
                ]}
                onPress={() => {
                  setFilter(f.value);
                  setPage(1);
                }}
              >
                <Text style={[
                  styles.filterText,
                  filter === f.value ? styles.filterTextActive : styles.filterTextInactive
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading && page === 1 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fbb040" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadBillingData}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : billingHistory.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No transactions found.</Text>
          </View>
        ) : (
          <FlatList
            data={billingHistory}
            renderItem={renderBillingItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              totalPages > 1 ? (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    disabled={page === 1}
                    onPress={() => setPage(p => Math.max(1, p - 1))}
                    style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>Prev</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
                  <TouchableOpacity
                    disabled={page === totalPages}
                    onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                    style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>Next</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBF3',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingRight: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterBtnActive: {
    backgroundColor: '#fbb040',
    borderColor: '#fbb040',
  },
  filterBtnInactive: {
    backgroundColor: '#FFF7E0',
    borderColor: 'rgba(251, 176, 64, 0.3)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterTextInactive: {
    color: '#fbb040',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statusFailed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusPending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextSuccess: {
    color: '#16a34a',
  },
  statusTextFailed: {
    color: '#dc2626',
  },
  statusTextPending: {
    color: '#d97706',
  },
  cardPlan: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF7E0',
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.3)',
  },
  invoiceBtnText: {
    fontSize: 13,
    color: '#fbb040',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
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
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fbb040',
  },
  pageBtnDisabled: {
    opacity: 0.3,
  },
  pageBtnText: {
    color: '#fbb040',
    fontWeight: '700',
    fontSize: 13,
  },
  pageInfo: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
});

export default BillingScreen;
