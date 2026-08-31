import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import Svg, { Path, Circle } from 'react-native-svg';
import { fetchJobs } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import EmployerJobsView from './EmployerJobsView';
import { indianStatesAndDistricts, StateData } from '../utils/indianStatesAndDistricts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Employer {
  id: number;
  companyName: string;
  profileImage?: string;
}

interface Job {
  id: number;
  jobTitle: string;
  jobType: string;
  isNightShift: boolean;
  location: string | null;
  workLocation: string;
  officeAddress: string;
  minSalary: number;
  maxSalary: number;
  perks: string[];
  walkIn: boolean;
  createdAt: string;
  employer: Employer;
}

export default function BrowseJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(route.params?.q || '');
  const [locationTerm, setLocationTerm] = useState(route.params?.location || '');
  const [experienceTerm, setExperienceTerm] = useState(route.params?.exp || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [stateSearchInput, setStateSearchInput] = useState('');
  const [districtSearchInput, setDistrictSearchInput] = useState('');

  // Location Suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isLocationSearching, setIsLocationSearching] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  // Hardcoding the key as a fallback because .env might not be picked up without a full restart
  const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || process.env.VITE_GEOAPIFY_API_KEY || '205ddcae564743f68d28da3a448a889e';

  // Filter States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState<string[]>([]);

  const filteredStates = useMemo(() => {
    if (!stateSearchInput) return indianStatesAndDistricts;
    return indianStatesAndDistricts.filter(s =>
      s.name.toLowerCase().includes(stateSearchInput.toLowerCase())
    );
  }, [stateSearchInput]);

  const availableDistricts = useMemo(() => {
    const stateData = indianStatesAndDistricts.find(s => s.name === selectedState);
    return stateData ? stateData.districts : [];
  }, [selectedState]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearchInput) return availableDistricts;
    return availableDistricts.filter(d =>
      d.toLowerCase().includes(districtSearchInput.toLowerCase())
    );
  }, [districtSearchInput, availableDistricts]);

  const fetchLocationSuggestions = async (text: string) => {
    if (!GEOAPIFY_API_KEY) {
      return;
    }
    if (!text || text.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsLocationSearching(true);
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}&filter=countrycode:in`;
      const response = await fetch(url);
      const data = await response.json();
      setLocationSuggestions(data.features || []);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    } finally {
      setIsLocationSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationTerm && locationTerm.length >= 3 && showLocationSuggestions) {
        fetchLocationSuggestions(locationTerm);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [locationTerm, showLocationSuggestions]);

  useEffect(() => {
    // If we have params from navigation, update state
    if (route.params) {
      const q = route.params.q || '';
      const loc = route.params.location || '';
      const exp = route.params.exp || '';

      setSearchTerm(q);
      setLocationTerm(loc);
      setExperienceTerm(exp);

      loadJobs(1, q, loc, exp);
    } else {
      loadJobs(1);
    }
  }, [route.params]);

  const loadJobs = async (pageNumber = 1, searchQ?: string, searchLoc?: string, searchExp?: string) => {
    try {
      setLoading(true);
      setError(null);

      const finalQ = searchQ !== undefined ? searchQ : searchTerm;
      const finalLoc = searchLoc !== undefined ? searchLoc : locationTerm;
      const finalExp = searchExp !== undefined ? searchExp : experienceTerm;

      const params: any = {
        page: pageNumber,
        limit: 10,
      };

      if (finalQ) params.q = finalQ;

      const loc = selectedDistrict || selectedState || finalLoc;
      if (loc) params.location = loc;

      if (finalExp) params.exp = finalExp;

      // Map display labels to API values
      if (selectedDate.length > 0) {
        params.datePosted = selectedDate.map(d => {
          if (d.includes('24')) return '24h';
          if (d.includes('3')) return '3d';
          if (d.includes('7')) return '7d';
          return d;
        });
      }

      if (selectedWorkMode.length > 0) {
        params.workMode = selectedWorkMode.map(m => {
          if (m.toLowerCase() === 'work from home') return 'Work From Home';
          if (m.toLowerCase() === 'work from office') return 'Work From Office';
          if (m.toLowerCase() === 'field job') return 'Field Job';
          return m;
        });
      }

      if (selectedShift.length > 0) {
        params.workShift = selectedShift.map(s => {
          if (s.toLowerCase().includes('day')) return 'day';
          if (s.toLowerCase().includes('night')) return 'night';
          if (s.toLowerCase().includes('8 hours')) return '8hours';
          return s;
        });
      }

      console.log('[BrowseJobs] API Params:', params);
      const data = await fetchJobs(params);

      if (data.jobs) {
        setJobs(data.jobs);
        setTotalPages(data.totalPages || 1);
        setTotalJobs(data.total || data.jobs.length);
        setPage(data.page || pageNumber);
      } else if (Array.isArray(data)) {
        setJobs(data);
        setTotalPages(1);
        setTotalJobs(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'Check out these job opportunities on OJK Jobs! Download the app now and find your dream job.',
        url: 'https://ojkjobs.com', // Replace with actual app store link if available
        title: 'Share Jobs',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleLocationSuggestionClick = (suggestion: any) => {
    const text = suggestion.properties.formatted || suggestion.properties.name || suggestion.properties.city;
    setLocationTerm(text);
    setSelectedState('');
    setSelectedDistrict('');
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    // Optionally trigger search immediately
    loadJobs(1);
  };

  const renderItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('JobDetail', { job: item })}
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.employer.profileImage }} style={styles.companyLogo} />
        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
          <Text style={styles.companyName}>{item.employer.companyName}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📍 {item.location}</Text>
        <Text style={styles.infoText}>💼 {item.jobType}</Text>
      </View>
      <Text style={styles.salaryText}>
        ₹{item.minSalary.toLocaleString()} - ₹{item.maxSalary.toLocaleString()} / month
      </Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.workLocation}</Text></View>
        {item.isNightShift && <View style={styles.badge}><Text style={styles.badgeText}>Night Shift</Text></View>}
      </View>
    </TouchableOpacity>
  );

  if (user?.role === 'EMPLOYER') {
    return (
      <View style={styles.container}>
        <Header />
        <EmployerJobsView />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Search Bar with Filter Toggle */}
      <View style={styles.searchSection}>
        <View style={styles.topSearchRow}>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={styles.searchBox}>
              <Svg width={18} height={18} fill="none" viewBox="0 0 24 24">
                <Circle cx={11} cy={11} r={8} stroke="#9ca3af" strokeWidth={2} />
                <Path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                placeholder="Job title, company..."
                style={styles.input}
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={() => loadJobs(1)}
                returnKeyType="search"
              />
            </View>
            <View style={styles.searchBox}>
              <Svg width={18} height={18} fill="none" viewBox="0 0 24 24">
                <Path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 7.2c0 7.3-8 11.8-8 11.8z" stroke="#9ca3af" strokeWidth={2} />
                <Circle cx={12} cy={9} r={2.5} stroke="#9ca3af" strokeWidth={2} />
              </Svg>
              <TextInput
                placeholder="City, state..."
                style={styles.input}
                value={locationTerm}
                onChangeText={(text) => {
                  setLocationTerm(text);
                  setShowLocationSuggestions(true);
                  if (text) {
                    setSelectedState('');
                    setSelectedDistrict('');
                  }
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                onSubmitEditing={() => loadJobs(1)}
                returnKeyType="search"
              />
              {isLocationSearching && <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 8 }} />}
            </View>
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(true)}
          >
            <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
              <Path d="M3 4.5h18m-15 6h12m-9 6h6" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Main Screen Location Suggestions */}
        {showLocationSuggestions && locationSuggestions.length > 0 && (
          <View style={styles.suggestionOverlay}>
            <ScrollView style={styles.suggestionList} keyboardShouldPersistTaps="always">
              {locationSuggestions.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionItem}
                  onPress={() => handleLocationSuggestionClick(s)}
                >
                  <Text style={styles.suggestionText}>{s.properties.formatted}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Showing {totalJobs} Jobs</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ textAlign: 'center', color: 'red', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={() => loadJobs(1)}
          ListFooterComponent={() => (
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  onPress={() => page > 1 && loadJobs(page - 1)}
                  disabled={page === 1}
                >
                  <Text style={styles.pageBtnText}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
                <TouchableOpacity
                  style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                  onPress={() => page < totalPages && loadJobs(page + 1)}
                  disabled={page === totalPages}
                >
                  <Text style={styles.pageBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null
          )}
        />
      )}

      {/* Post Job FAB for Employers */}
      {user?.role === 'EMPLOYER' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('PostJob')}
        >
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
            <Path d="M12 5v14m-7-7h14" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => {
                setSelectedState('');
                setSelectedDistrict('');
                setLocationTerm('');
                setSelectedDate([]);
                setSelectedWorkMode([]);
                setSelectedShift([]);
              }}>
                <Text style={[styles.closeBtn, { color: '#3b82f6', marginRight: 15 }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.filterScroll}>

              {/* Job Title */}
              <Text style={styles.filterLabel}>Search Job Title</Text>
              <TextInput
                placeholder="Job title, company..."
                style={styles.filterInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />

              {/* Experience */}
              <Text style={styles.filterLabel}>Experience</Text>
              <View style={styles.optionsGrid}>
                {['fresher', '1-2', '3-5', '5+'].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    onPress={() => setExperienceTerm(exp === experienceTerm ? '' : exp)}
                    style={[styles.optionBtn, experienceTerm === exp && styles.optionBtnActive]}
                  >
                    <Text style={[styles.optionText, experienceTerm === exp && styles.optionTextActive]}>
                      {exp === 'fresher' ? 'Fresher' : `${exp} Years`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Location */}
              <Text style={styles.filterLabel}>Location (General Search)</Text>
              <View>
                <TextInput
                  placeholder="City, state..."
                  style={styles.filterInput}
                  value={locationTerm}
                  onChangeText={(text) => {
                    setLocationTerm(text);
                    setShowLocationSuggestions(true);
                    if (text) {
                      setSelectedState('');
                      setSelectedDistrict('');
                    }
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <View style={styles.modalSuggestionList}>
                    {locationSuggestions.map((s, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.suggestionItem}
                        onPress={() => {
                          handleLocationSuggestionClick(s);
                          setShowLocationSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{s.properties.formatted}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* State Dropdown */}
              <Text style={styles.filterLabel}>Select State</Text>
              <TouchableOpacity
                style={styles.dropdownPlaceholder}
                onPress={() => setShowStateModal(true)}
              >
                <Text style={selectedState ? styles.dropdownTextSelected : styles.dropdownText}>
                  {selectedState || 'Select State'}
                </Text>
                <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                  <Path d="M19 9l-7 7-7-7" stroke="#64748b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>

              {/* District Dropdown */}
              {selectedState !== '' && (
                <>
                  <Text style={styles.filterLabel}>Select District</Text>
                  <TouchableOpacity
                    style={styles.dropdownPlaceholder}
                    onPress={() => setShowDistrictModal(true)}
                  >
                    <Text style={selectedDistrict ? styles.dropdownTextSelected : styles.dropdownText}>
                      {selectedDistrict || 'Select District'}
                    </Text>
                    <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                      <Path d="M19 9l-7 7-7-7" stroke="#64748b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </>
              )}

              {/* Date Posted */}
              <Text style={styles.filterLabel}>Date posted</Text>
              {['Last 24 hours', 'Last 3 days', 'Last 7 days'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(selectedDate, setSelectedDate, opt)}
                >
                  <View style={[styles.checkbox, selectedDate.includes(opt) && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}

              {/* Work Mode */}
              <Text style={styles.filterLabel}>Work Mode</Text>
              {['Work from home', 'Work from office', 'Field Job'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(selectedWorkMode, setSelectedWorkMode, opt)}
                >
                  <View style={[styles.checkbox, selectedWorkMode.includes(opt) && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}

              {/* Work Shift */}
              <Text style={styles.filterLabel}>Work Shift</Text>
              {['Day shift', 'Night shift', '8 Hours shift'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(selectedShift, setSelectedShift, opt)}
                >
                  <View style={[styles.checkbox, selectedShift.includes(opt) && styles.checkboxActive]} />
                  <Text style={styles.checkboxLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}

              <View style={{ height: 30 }} />
            </ScrollView>

            <TouchableOpacity
                style={[styles.applyFiltersBtn, { marginBottom: Platform.OS === 'ios' ? 20 : 0 }]}
                onPress={() => {
                  setShowFilters(false);
                  loadJobs();
                }}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.stateModalOverlay}>
          <View style={styles.stateModalContent}>
            <View style={styles.stateModalHeader}>
              <Text style={styles.stateModalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Text style={styles.closeBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stateSearchBox}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                <Circle cx={11} cy={11} r={8} stroke="#9ca3af" strokeWidth={2} />
                <Path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                placeholder="Search state..."
                style={styles.stateSearchInput}
                value={stateSearchInput}
                onChangeText={setStateSearchInput}
              />
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stateItem}
                  onPress={() => {
                    setSelectedState(item.name);
                    setSelectedDistrict('');
                    setShowStateModal(false);
                    setStateSearchInput('');
                  }}
                >
                  <Text style={[
                    styles.stateItemText,
                    selectedState === item.name && styles.stateItemTextSelected
                  ]}>
                    {item.name}
                  </Text>
                  {selectedState === item.name && (
                    <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                      <Path d="M5 13l4 4L19 7" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.stateSeparator} />}
            />
          </View>
        </View>
      </Modal>
      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.stateModalOverlay}>
          <View style={styles.stateModalContent}>
            <View style={styles.stateModalHeader}>
              <Text style={styles.stateModalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Text style={styles.closeBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stateSearchBox}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                <Circle cx={11} cy={11} r={8} stroke="#9ca3af" strokeWidth={2} />
                <Path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <TextInput
                placeholder="Search district..."
                style={styles.stateSearchInput}
                value={districtSearchInput}
                onChangeText={setDistrictSearchInput}
              />
            </View>

            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stateItem}
                  onPress={() => {
                    setSelectedDistrict(item);
                    setShowDistrictModal(false);
                    setDistrictSearchInput('');
                  }}
                >
                  <Text style={[
                    styles.stateItemText,
                    selectedDistrict === item && styles.stateItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {selectedDistrict === item && (
                    <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                      <Path d="M5 13l4 4L19 7" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.stateSeparator} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  suggestionOverlay: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    zIndex: 2000,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#334155',
  },
  modalSuggestionList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  shareBtn: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 15,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    flexShrink: 1,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.85,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  closeBtn: {
    color: '#ef4444',
    fontWeight: '700',
  },
  filterScroll: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  optionBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  dropdownPlaceholder: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#64748b',
    fontSize: 14,
  },
  dropdownTextSelected: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  stateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stateModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.7,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  stateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  stateSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  stateSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  stateItemText: {
    fontSize: 15,
    color: '#475569',
  },
  stateItemTextSelected: {
    color: '#2563eb',
    fontWeight: '700',
  },
  stateSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#475569',
  },
  applyFiltersBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyFiltersText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
