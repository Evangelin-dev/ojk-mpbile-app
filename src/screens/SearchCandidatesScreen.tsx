import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';

const educationOptions = [
  "10th pass", "12th pass", "ITI", "Diploma", "Graduate", "Post Graduate",
];

const educationMap: { [key: string]: string } = {
  "10th pass": "TENTH",
  "12th pass": "TWELFTH",
  "ITI": "ITI",
  "Diploma": "DIPLOMA",
  "Graduate": "GRADUATE",
  "Post Graduate": "POST_GRADUATE",
};

const experienceOptions = Array.from({ length: 31 }, (_, i) => i + " years");

const SearchCandidatesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchingFor, setSearchingFor] = useState("any");
  const [keywords, setKeywords] = useState("");
  const [city, setCity] = useState("");
  const [minExp, setMinExp] = useState("");
  const [maxExp, setMaxExp] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [education, setEducation] = useState<string[]>([]);

  // Picker Modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickingFor, setPickingFor] = useState<'min' | 'max' | null>(null);

  const handleEducationToggle = (option: string) => {
    setEducation((prev) =>
      prev.includes(option)
        ? prev.filter((e) => e !== option)
        : [...prev, option]
    );
  };

  const handleReset = () => {
    setKeywords("");
    setCity("");
    setMinExp("");
    setMaxExp("");
    setMinSalary("");
    setMaxSalary("");
    setEducation([]);
    setSearchingFor("any");
  };

  const handleSubmit = () => {
    if (!keywords.trim()) {
      Alert.alert('Error', 'Keywords are required.');
      return;
    }

    const searchCriteria: { [key: string]: any } = {};

    if (keywords) searchCriteria.keywords = keywords;
    if (city) searchCriteria.location = city;

    if (searchingFor === 'freshersOnly') {
      searchCriteria.type = 'FRESHER';
    } else if (searchingFor === 'experiencedOnly') {
      searchCriteria.type = 'EXPERIENCED';
    } else if (searchingFor === 'any') {
      searchCriteria.type = 'ANY';
    }

    if (minExp) searchCriteria.minExperience = parseInt(minExp, 10);
    if (maxExp) searchCriteria.maxExperience = parseInt(maxExp, 10);

    if (minSalary) searchCriteria.minSalary = parseFloat(minSalary);
    if (maxSalary) searchCriteria.maxSalary = parseFloat(maxSalary);

    if (education.length) {
      searchCriteria.education = education.map(opt => educationMap[opt]);
    }

    // Navigate to Search List Screen (We will need to create this)
    navigation.navigate('CandidateSearchList', { searchCriteria });
  };

  const openPicker = (type: 'min' | 'max') => {
    setPickingFor(type);
    setPickerVisible(true);
  };

  const selectExperience = (value: string) => {
    if (pickingFor === 'min') {
      setMinExp(value);
    } else {
      setMaxExp(value);
    }
    setPickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={24} color="#fbb040" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Search Candidates</Text>
        </View>

        <View style={styles.card}>
          {/* Searching For Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Searching for</Text>
            <View style={styles.radioGroup}>
              {[
                { label: 'Freshers', value: 'freshersOnly' },
                { label: 'Experienced', value: 'experiencedOnly' },
                { label: 'Any', value: 'any' }
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.radioButton}
                  onPress={() => setSearchingFor(opt.value)}
                >
                  <View style={[
                    styles.radioOuter,
                    searchingFor === opt.value && styles.radioOuterActive
                  ]}>
                    {searchingFor === opt.value && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Keywords Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Keywords <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Java, Python, React"
              value={keywords}
              onChangeText={setKeywords}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* City Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Current City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai, Bangalore"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Experience Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Experience (Years)</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.input, styles.pickerInput]}
                onPress={() => openPicker('min')}
              >
                <Text style={minExp ? styles.inputValue : styles.placeholder}>
                  {minExp || 'Min'}
                </Text>
                <ChevronDownIcon size={18} color="#b97a13" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.input, styles.pickerInput]}
                onPress={() => openPicker('max')}
              >
                <Text style={maxExp ? styles.inputValue : styles.placeholder}>
                  {maxExp || 'Max'}
                </Text>
                <ChevronDownIcon size={18} color="#b97a13" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Salary Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Annual Salary (₹)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min"
                keyboardType="numeric"
                value={minSalary}
                onChangeText={setMinSalary}
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Max"
                keyboardType="numeric"
                value={maxSalary}
                onChangeText={setMaxSalary}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Education Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Minimum Education</Text>
            <View style={styles.tagGroup}>
              {educationOptions.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.tag,
                    education.includes(opt) && styles.tagActive
                  ]}
                  onPress={() => handleEducationToggle(opt)}
                >
                  <Text style={[
                    styles.tagText,
                    education.includes(opt) && styles.tagTextActive
                  ]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetBtn}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBtn} onPress={handleSubmit}>
              <MagnifyingGlassIcon size={20} color="#fff" />
              <Text style={styles.searchBtnText}>Search Candidates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Experience Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPickerVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select {pickingFor === 'min' ? 'Minimum' : 'Maximum'} Experience
                  </Text>
                  <TouchableOpacity onPress={() => setPickerVisible(false)}>
                    <Text style={styles.closeBtn}>Close</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={['0 years', ...experienceOptions.slice(1)]}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.pickerItem}
                      onPress={() => selectExperience(item)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        (pickingFor === 'min' ? minExp : maxExp) === item && styles.pickerItemTextActive
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.pickerSeparator} />}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    color: '#253858',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.2)',
    shadowColor: '#fbb040',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  required: {
    color: '#ef4444',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#fbb040',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbb040',
  },
  radioLabel: {
    fontSize: 14,
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7E0',
  },
  inputValue: {
    color: '#b97a13',
    fontWeight: '700',
  },
  placeholder: {
    color: '#b97a13',
    opacity: 0.6,
  },
  tagGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 176, 64, 0.2)',
    backgroundColor: '#fff',
  },
  tagActive: {
    backgroundColor: '#FFF7E0',
    borderColor: '#fbb040',
  },
  tagText: {
    fontSize: 13,
    color: '#64748b',
  },
  tagTextActive: {
    color: '#b97a13',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  resetBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fbb040',
    textDecorationLine: 'underline',
  },
  searchBtn: {
    flex: 1,
    backgroundColor: '#fbb040',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#fbb040',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#253858',
  },
  closeBtn: {
    color: '#fbb040',
    fontWeight: '600',
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#475569',
  },
  pickerItemTextActive: {
    color: '#fbb040',
    fontWeight: '700',
  },
  pickerSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
});

export default SearchCandidatesScreen;
