import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
} from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchCurrentPlan, createPlanOrder, verifyPlanPayment } from '../api/employer';
import { Header } from '../components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PlanID = 'FREE' | 'STARTER' | 'STANDARD' | 'PRO';

interface Plan {
  id: PlanID;
  name: string;
  price: string;
  priceDetails?: string;
  features: string[];
  isPopular?: boolean;
}

interface CurrentPlan {
  planType: PlanID;
  perks: string[];
  startDate: string;
  endDate: string;
  jobsUsed: number;
}

const PLANS_DATA: Plan[] = [
  {
    id: 'FREE',
    name: 'Free Plan',
    price: '₹0',
    priceDetails: '/lifetime',
    features: ['1 Job Post', 'Basic Support', 'Standard Visibility'],
    isPopular: false,
  },
  {
    id: 'STARTER',
    name: 'Starter Plan',
    price: '₹999',
    priceDetails: '/month',
    features: ['5 Job Posts', 'Priority Support', 'Enhanced Visibility', 'Email Notifications'],
    isPopular: false,
  },
  {
    id: 'STANDARD',
    name: 'Standard Plan',
    price: '₹2499',
    priceDetails: '/month',
    features: ['15 Job Posts', 'Dedicated Account Manager', 'Premium Visibility', 'SMS Alerts'],
    isPopular: true,
  },
  {
    id: 'PRO',
    name: 'Pro Plan',
    price: '₹4999',
    priceDetails: '/month',
    features: ['Unlimited Job Posts', 'Custom Branding', 'Top Search Results', 'API Access'],
    isPopular: false,
  },
];

const EmployerPricingPlansScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentPlan();
  }, [token]);

  const loadCurrentPlan = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetchCurrentPlan(token);
      if (response.success && response.plan) {
        setCurrentPlan(response.plan);
      }
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const difference = end - now;
    if (difference < 0) return 0;
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const totalJobsIncluded = useMemo(() => {
    if (!currentPlan) return 1;
    const planDetails = PLANS_DATA.find((p) => p.id === currentPlan.planType);
    if (!planDetails) return 1;
    const feature = planDetails.features.find((f) => f.toLowerCase().includes('job post'));
    if (!feature) return 1;
    const match = feature.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }, [currentPlan]);

  const handlePurchase = async (plan: Plan) => {
    if (plan.id === 'FREE') {
      Alert.alert('Notice', 'The Free plan is already available to you!');
      return;
    }

    if (!token) {
      Alert.alert('Authentication Required', 'Please login to purchase a plan.');
      navigation.navigate('Login');
      return;
    }

    setPurchasingPlan(plan.id);

    try {
      // 1. Create Order on Backend
      const orderData = await createPlanOrder(plan.id, token);

      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || 'Could not create order');
      }

      // Simulation mode for Expo Go
      Alert.alert(
        'Simulate Payment',
        `Order created for ${plan.name} (${orderData.order.id}). This is a simulation for testing in Expo Go.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setPurchasingPlan(null) },
          {
            text: 'Success',
            onPress: async () => {
              try {
                // NOTE: In simulation mode, the signature check might fail if not handled by backend
                // This is just to show the UI flow
                Alert.alert('Success', `Payment simulation complete! Your ${plan.name} request was sent.`);
                loadCurrentPlan();
              } catch (err: any) {
                Alert.alert('Error', 'Verification failed in simulation.');
              } finally {
                setPurchasingPlan(null);
              }
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Purchase initiation error:', error);
      Alert.alert('Error', error.message || 'Could not initiate purchase.');
      setPurchasingPlan(null);
    }
  };

  if (isLoading && !currentPlan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fbb040" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color="#fbb040" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pricing Plans</Text>
          <Text style={styles.subtitle}>Choose the plan that's right for your business</Text>
        </View>

        {/* Active Plan Card */}
        {currentPlan && (
          <View style={styles.activePlanCard}>
            <View style={styles.activePlanHeader}>
              <View>
                <Text style={styles.activePlanLabel}>Your Active Plan</Text>
                <Text style={styles.activePlanName}>{currentPlan.planType}</Text>
              </View>
              <SparklesIcon size={32} color="#fbb040" />
            </View>

            <View style={styles.activePlanDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>
                  {currentPlan.planType === 'FREE' ? '∞' : calculateDaysLeft(currentPlan.endDate)}
                </Text>
                <Text style={styles.detailLabel}>Days Left</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailValue}>
                  {currentPlan.jobsUsed}
                  {currentPlan.planType !== 'FREE' && (
                    <Text style={styles.detailValueSmall}> / {totalJobsIncluded}</Text>
                  )}
                </Text>
                <Text style={styles.detailLabel}>Jobs Used</Text>
              </View>
            </View>

            <View style={styles.perksList}>
              {currentPlan.perks.map((perk, index) => (
                <View key={index} style={styles.perkItem}>
                  <CheckCircleIcon size={16} color="#fbb040" />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {PLANS_DATA.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.isPopular && styles.popularCard,
                currentPlan?.planType === plan.id && styles.currentPlanCardHighlight,
              ]}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                {plan.priceDetails && <Text style={styles.planPriceDetail}>{plan.priceDetails}</Text>}
              </View>

              <View style={styles.planDivider} />

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <CheckCircleIcon size={18} color={plan.isPopular ? '#fbb040' : '#9ca3af'} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.buyBtn,
                  plan.isPopular ? styles.buyBtnPopular : styles.buyBtnOutline,
                  currentPlan?.planType === plan.id && styles.buyBtnDisabled,
                ]}
                onPress={() => handlePurchase(plan)}
                disabled={purchasingPlan === plan.id || currentPlan?.planType === plan.id}
              >
                {purchasingPlan === plan.id ? (
                  <ActivityIndicator color={plan.isPopular ? '#fff' : '#fbb040'} />
                ) : (
                  <Text
                    style={[
                      styles.buyBtnText,
                      plan.isPopular ? styles.buyBtnTextPopular : styles.buyBtnTextOutline,
                    ]}
                  >
                    {currentPlan?.planType === plan.id ? 'Active Plan' : 'Buy Now'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Need a custom plan for your enterprise?</Text>
          <TouchableOpacity onPress={() => Alert.alert('Contact Sales', 'Please call us at +91 123 456 7890 or email sales@ojkjobs.com')}>
            <Text style={styles.contactLink}>Contact Sales</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBF3',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: -4,
  },
  backBtnText: {
    fontSize: 16,
    color: '#fbb040',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePlanCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#fbb040',
    shadowColor: '#fbb040',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    marginBottom: 32,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  activePlanLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activePlanName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563eb',
    textTransform: 'capitalize',
  },
  activePlanDetails: {
    flexDirection: 'row',
    backgroundColor: '#FFF7E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: 'rgba(251, 176, 64, 0.2)',
    marginHorizontal: 10,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fbb040',
  },
  detailValueSmall: {
    fontSize: 16,
    color: '#94a3b8',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  perksList: {
    gap: 8,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 13,
    color: '#475569',
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  popularCard: {
    borderColor: '#fbb040',
    borderWidth: 2,
    shadowColor: '#fbb040',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  currentPlanCardHighlight: {
    backgroundColor: '#f8fafc',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#fbb040',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 8,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
  },
  planPriceDetail: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  planDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  featuresList: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  buyBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnPopular: {
    backgroundColor: '#fbb040',
  },
  buyBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fbb040',
  },
  buyBtnDisabled: {
    backgroundColor: '#e2e8f0',
    borderColor: '#e2e8f0',
  },
  buyBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buyBtnTextPopular: {
    color: '#fff',
  },
  buyBtnTextOutline: {
    color: '#fbb040',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  contactLink: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbb040',
    textDecorationLine: 'underline',
  },
});

export default EmployerPricingPlansScreen;
