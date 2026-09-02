import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { TrendingRoleCard } from '../components/TrendingRoleCard';
import { TestimonialTrain } from '../components/TestimonialTrain';
import { useAuth } from '../context/AuthContext';
import { fetchTestimonials, submitTestimonial } from '../api/auth';
import { StarIcon } from 'react-native-heroicons/solid';
import { StarIcon as StarOutlineIcon } from 'react-native-heroicons/outline';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const industries = [
  { name: 'Textiles', image: '/assets/industries/textiles.jpg' },
  { name: 'Hospitality', image: '/assets/industries/hospitality.jpg' },
  { name: 'Retail', image: '/assets/industries/retail.avif' },
  { name: 'Construction', image: '/assets/industries/construction.jpg' },
  { name: 'Manufacturing', image: '/assets/industries/manufacturing.jpg' },
];

const trendingRoles = [
  'Telecalling', 'Field Sales', 'Accounts', 'Delivery',
  'Business Dev', 'HR', 'Data Entry', 'Security',
];

const debounce = (func: (...args: any[]) => any, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  // --- Location Autocomplete ---
  const [locSuggestions, setLocSuggestions] = useState<any[]>([]);
  const [isLocSearching, setIsLocSearching] = useState(false);

  // --- Testimonials ---
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialContent, setTestimonialContent] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const data = await fetchTestimonials();
      if (data && data.testimonials) {
        const approved = data.testimonials
          .filter((t: any) => t.status === 'APPROVED')
          .map((t: any) => {
            const candidateName = t.user?.candidateProfile?.name || 'Anonymous';
            const profileImg = t.user?.candidateProfile?.profileImage;

            return {
              name: candidateName,
              role: t.user?.role || 'Job Seeker',
              rating: t.rating,
              text: t.content,
              photo: profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=0D8ABC&color=fff&size=128`,
            };
          });
        setTestimonialsData(approved);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const fetchLocationSuggestions = useCallback(
    debounce(async (text: string) => {
      const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
      if (!apiKey || !text || text.length < 3) {
        setLocSuggestions([]);
        return;
      }
      setIsLocSearching(true);
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        text
      )}&apiKey=${apiKey}&filter=countrycode:in`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setLocSuggestions(data.features || []);
      } catch (error) {
        console.error("Geoapify Error:", error);
      } finally {
        setIsLocSearching(false);
      }
    }, 500),
    []
  );

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (text.length >= 3) {
      fetchLocationSuggestions(text);
    } else {
      setLocSuggestions([]);
    }
  };

  const handleSearch = () => {
    navigation.navigate('Jobs', {
      screen: 'JobList',
      params: { q: searchTerm, exp: experience, location: location }
    });
  };

  const handleViewAll = () => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('Jobs', { screen: 'JobList' });
    }
  };

  const handleEmployerAction = () => {
    if (user?.role === 'EMPLOYER') {
      navigation.navigate('Dashboard', { screen: 'EmployerDashboard' });
    } else {
      navigation.navigate('Login'); // Or specific EmployerSignIn if exists
    }
  };

  const handleAddTestimonial = () => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      setShowTestimonialModal(true);
    }
  };

  const submitMyTestimonial = async () => {
    if (!testimonialContent.trim()) {
      Alert.alert('Error', 'Please enter some feedback.');
      return;
    }
    setSubmittingTestimonial(true);
    try {
      await submitTestimonial(testimonialContent, testimonialRating, token!);
      Alert.alert('Success', 'Your testimonial has been submitted for approval.');
      setShowTestimonialModal(false);
      setTestimonialContent('');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit testimonial.');
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const cardData = [
    { trending: '🔥 Trending', title: 'Jobs for Freshers', color: '#16a34a', borderColor: '#16a34a' },
    { trending: '🏠 Popular', title: 'Work from Home', color: '#eab308', borderColor: '#eab308' },
    { trending: '🎓 New', title: 'Internship', color: '#f97316', borderColor: '#f97316' },
    { trending: '⏰ Flexible', title: 'Part Time', color: '#0d9488', borderColor: '#0d9488' },
  ];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ===== HERO SECTION ===== */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find Your Dream Job</Text>

          <View style={styles.taglineRow}>
            <Text style={styles.taglineText}>Instantly</Text>
            <Text style={styles.taglineSep}>|</Text>
            <Text style={styles.taglineText}>Reliably</Text>
            <Text style={styles.taglineSep}>|</Text>
            <Text style={styles.taglineText}>Locally</Text>
          </View>

          <View style={styles.subtitleBox}>
            <Text style={styles.subtitleText}>
              Discover opportunities that match your skills and location.
            </Text>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <View style={styles.searchRow}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                <Circle cx={11} cy={11} r={8} stroke="#9ca3af" strokeWidth={2} />
                <Path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                placeholder="Job title, keywords, or company"
                placeholderTextColor="#64748b"
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <View style={styles.searchDivider} />

            {/* Experience Selector */}
            <View style={styles.searchRow}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                <Rect x="4" y="4" width="16" height="16" rx="4" stroke="#9ca3af" strokeWidth={2} />
                <Path d="M8 12h8" stroke="#9ca3af" strokeWidth={2} />
              </Svg>
              <View style={styles.expOptions}>
                {['fresher', '1-2', '3-5', '5+'].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    onPress={() => setExperience(exp === experience ? '' : exp)}
                    style={[styles.expBtn, experience === exp && styles.expBtnActive]}
                  >
                    <Text style={[styles.expBtnText, experience === exp && styles.expBtnTextActive]}>
                      {exp === 'fresher' ? 'Fresher' : `${exp} Yrs`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.searchDivider} />

            <View style={[styles.searchRow, { zIndex: 1000, elevation: 1000 }]}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                <Path d="M12 21c4.97-4.97 8-8.03 8-11A8 8 0 1 0 4 10c0 2.97 3.03 6.03 8 11z" stroke="#9ca3af" strokeWidth={2} />
                <Circle cx={12} cy={10} r={3} stroke="#9ca3af" strokeWidth={2} />
              </Svg>
              <View style={{ flex: 1, position: 'relative' }}>
                <TextInput
                  placeholder="City, state, or zip code"
                  placeholderTextColor="#64748b"
                  style={styles.searchInput}
                  value={location}
                  onChangeText={handleLocationChange}
                  onFocus={() => { if (location.length >= 3) setIsLocSearching(false); }}
                />
                {isLocSearching && (
                  <ActivityIndicator style={{ position: 'absolute', right: 0 }} size="small" color="#9ca3af" />
                )}

                {locSuggestions.length > 0 && (
                  <View style={styles.suggestionsList}>
                    {locSuggestions.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setLocation(s.properties.formatted);
                          setLocSuggestions([]);
                        }}
                      >
                        <Text style={styles.suggestionText}>{s.properties.formatted}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search Jobs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== POPULAR SEARCHES CARDS ===== */}
        <View style={styles.sectionBg}>
          <Text style={styles.sectionTitle}>Popular Searches on OJK Jobs</Text>
          <View style={styles.cardGrid}>
            {cardData.map((card, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.popularCard, { borderColor: card.borderColor }]}
                activeOpacity={0.8}
                onPress={handleViewAll}
              >
                <Text style={styles.cardTrending}>{card.trending}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { borderColor: card.color }]}
                  onPress={handleViewAll}
                >
                  <Text style={[styles.cardBtnText, { color: card.color }]}>View all →</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ===== PLATFORM FEATURES ===== */}
        <View style={styles.sectionWhite}>
          <Text style={styles.sectionTitle}>Platform Features</Text>
          <View style={styles.featuresRow}>
            {[
              { icon: '✓', color: '#16a34a', title: 'Verified Jobs', desc: 'Every job listing is manually verified for authenticity.' },
              { icon: '⏱', color: '#2563eb', title: 'Resume Builder', desc: 'Create a professional resume in minutes.' },
              { icon: '🎯', color: '#9333ea', title: 'Career Guidance', desc: 'Get personalized career advice from experts.' },
            ].map((feat, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feat.color + '15' }]}>
                  <Text style={{ fontSize: 24, color: feat.color }}>{feat.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== TRENDING ROLES ===== */}
        <View style={styles.sectionGradient}>
          <Text style={styles.sectionTitle}>Trending Roles</Text>
          <View style={styles.rolesGrid}>
            {trendingRoles.map((role, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.roleWrap}
                onPress={handleViewAll}
              >
                <TrendingRoleCard role={role} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={handleViewAll}
          >
            <Text style={styles.viewAllBtnText}>View All Roles</Text>
          </TouchableOpacity>
        </View>

        {/* ===== TESTIMONIALS ===== */}
        <View style={styles.sectionGreen}>
          <View style={styles.testimonialHeader}>
            <Text style={styles.sectionTitle}>Testimonials</Text>
            <TouchableOpacity
              style={styles.addTestimonialBtn}
              onPress={handleAddTestimonial}
            >
              <Text style={styles.addTestimonialText}>Add</Text>
            </TouchableOpacity>
          </View>
          {loadingTestimonials ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <TestimonialTrain testimonials={testimonialsData.length > 0 ? testimonialsData : []} />
          )}
        </View>

        {/* ===== EMPLOYERS SECTION ===== */}
        <View style={styles.sectionWhite}>
          <View style={styles.employerBadge}>
            <Text style={styles.employerBadgeText}>FOR EMPLOYERS</Text>
          </View>
          <Text style={styles.employerTitle}>Hire the Best Talent</Text>
          <Text style={styles.employerSubtitle}>
            Post jobs, search candidates, and manage hiring — all in one place.
          </Text>

          <View style={styles.benefitsList}>
            {['Verified candidate profiles', 'Fast hiring process', '24/7 support'].map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={styles.benefitCheck}>✓</Text>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=500&h=700&fit=crop' }}
            style={styles.employerImage}
          />

          <TouchableOpacity
            style={styles.postJobBtn}
            onPress={handleEmployerAction}
          >
            <Text style={styles.postJobBtnText}>+ Post a Job</Text>
          </TouchableOpacity>
          <Text style={styles.employerNote}>Free to get started. No credit card required.</Text>
        </View>

        {/* Testimonial Modal */}
        <Modal
          visible={showTestimonialModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add your testimonial</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Your Testimonial"
                multiline
                numberOfLines={4}
                value={testimonialContent}
                onChangeText={setTestimonialContent}
                placeholderTextColor="#64748b"
              />
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setTestimonialRating(star)}>
                    {star <= testimonialRating ? (
                      <StarIcon size={24} color="#eab308" />
                    ) : (
                      <StarOutlineIcon size={24} color="#d1d5db" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowTestimonialModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmit}
                  onPress={submitMyTestimonial}
                  disabled={submittingTestimonial}
                >
                  {submittingTestimonial ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ===== INDUSTRIES ===== */}
        <View style={styles.sectionBg}>
          <Text style={styles.sectionTitle}>Popular Industries</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {industries.map((ind, idx) => (
              <View key={idx} style={styles.industryCard}>
                <Image source={{ uri: ind.image }} style={styles.industryImage} />
                <View style={styles.industryLabel}>
                  <Text style={styles.industryName}>{ind.name}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },

  // Hero
  heroSection: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 36,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  taglineText: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '600',
  },
  taglineSep: {
    color: '#9ca3af',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  subtitleBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  subtitleText: {
    fontSize: 15,
    color: '#1e3a5f',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Search
  searchBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#374151',
    paddingVertical: 8,
  },
  expOptions: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 10,
    gap: 6,
  },
  expBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  expBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  expBtnText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  expBtnTextActive: {
    color: '#fff',
  },
  suggestionsList: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 13,
    color: '#374151',
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  searchButton: {
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    margin: 8,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Sections
  sectionBg: {
    backgroundColor: '#f9fafb',
    paddingVertical: 28,
  },
  sectionWhite: {
    backgroundColor: '#fff',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  sectionGradient: {
    backgroundColor: '#f0f9ff',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  sectionGreen: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Popular Cards
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  popularCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardTrending: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  cardBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  cardBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },

  // Features
  featuresRow: {
    gap: 12,
  },
  featureCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Trending Roles
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleWrap: {
    width: '48%',
    marginBottom: 12,
  },
  viewAllBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  viewAllBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  // Testimonials
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  addTestimonialBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTestimonialText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Employer
  employerBadge: {
    alignSelf: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  employerBadgeText: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
  },
  employerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  employerSubtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitCheck: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  benefitText: {
    color: '#4b5563',
    fontSize: 15,
  },
  employerImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    marginBottom: 20,
  },
  postJobBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  postJobBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  employerNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Industries
  industryCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  industryImage: {
    width: '100%',
    height: 100,
  },
  industryLabel: {
    padding: 12,
    alignItems: 'center',
  },
  industryName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    backgroundColor: '#e2e8f0',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCancelText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  modalSubmit: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  modalSubmitText: {
    color: '#fff',
    fontWeight: '600',
  },
});
