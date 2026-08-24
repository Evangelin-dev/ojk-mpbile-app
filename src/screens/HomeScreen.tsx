import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Header } from '../components/Header';
import { TrendingRoleCard } from '../components/TrendingRoleCard';
import { TestimonialTrain } from '../components/TestimonialTrain';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const industries = [
  { name: 'Textiles', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=320&fit=crop' },
  { name: 'Hospitality', image: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=400&h=320&fit=crop' },
  { name: 'Retail', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=320&fit=crop' },
  { name: 'Construction', image: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=400&h=320&fit=crop' },
  { name: 'Manufacturing', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=320&fit=crop' },
];

const trendingRoles = [
  'Telecalling', 'Field Sales', 'Accounts', 'Delivery',
  'Business Dev', 'HR', 'Data Entry', 'Security',
];

const testimonials = [
  { name: 'John Doe', role: 'Software Engineer', rating: 5, text: 'Great platform, found my dream job!', photo: 'https://ui-avatars.com/api/?name=JD&background=0D8ABC&color=fff&size=128' },
  { name: 'Jane Smith', role: 'Marketing', rating: 5, text: 'The process was seamless and quick.', photo: 'https://ui-avatars.com/api/?name=JS&background=0D8ABC&color=fff&size=128' },
  { name: 'Sam Wilson', role: 'Sales', rating: 4, text: 'Highly recommend to everyone looking for jobs.', photo: 'https://ui-avatars.com/api/?name=SW&background=0D8ABC&color=fff&size=128' },
];

const cardData = [
  { trending: '🔥 Trending', title: 'Jobs for Freshers', color: '#16a34a', borderColor: '#16a34a' },
  { trending: '🏠 Popular', title: 'Work from Home', color: '#eab308', borderColor: '#eab308' },
  { trending: '🎓 New', title: 'Internship', color: '#f97316', borderColor: '#f97316' },
  { trending: '⏰ Flexible', title: 'Part Time', color: '#0d9488', borderColor: '#0d9488' },
];

export default function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

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
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <View style={styles.searchDivider} />
            <View style={styles.searchRow}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                <Path d="M12 21c4.97-4.97 8-8.03 8-11A8 8 0 1 0 4 10c0 2.97 3.03 6.03 8 11z" stroke="#9ca3af" strokeWidth={2} />
                <Circle cx={12} cy={10} r={3} stroke="#9ca3af" strokeWidth={2} />
              </Svg>
              <TextInput
                placeholder="City, state, or zip code"
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search Jobs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== POPULAR SEARCHES CARDS ===== */}
        <View style={styles.sectionBg}>
          <Text style={styles.sectionTitle}>Popular Searches on OJK</Text>
          <View style={styles.cardGrid}>
            {cardData.map((card, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.popularCard, { borderColor: card.borderColor }]}
                activeOpacity={0.8}
              >
                <Text style={styles.cardTrending}>{card.trending}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <TouchableOpacity style={[styles.cardBtn, { borderColor: card.color }]}>
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
              <View key={idx} style={styles.roleWrap}>
                <TrendingRoleCard role={role} />
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllBtnText}>View All Roles</Text>
          </TouchableOpacity>
        </View>

        {/* ===== TESTIMONIALS ===== */}
        <View style={styles.sectionGreen}>
          <View style={styles.testimonialHeader}>
            <Text style={styles.sectionTitle}>Testimonials</Text>
            <TouchableOpacity style={styles.addTestimonialBtn}>
              <Text style={styles.addTestimonialText}>Add</Text>
            </TouchableOpacity>
          </View>
          <TestimonialTrain testimonials={testimonials} />
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

          <TouchableOpacity style={styles.postJobBtn}>
            <Text style={styles.postJobBtnText}>+ Post a Job</Text>
          </TouchableOpacity>
          <Text style={styles.employerNote}>Free to get started. No credit card required.</Text>
        </View>

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
});
