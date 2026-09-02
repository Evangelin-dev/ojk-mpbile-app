import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { publishJob } from '../api/employer';
import Svg, { Path } from 'react-native-svg';
import { Header } from '../components/Header';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const JOB_TYPE_OPTIONS = [
  "Full Time",
  "Part Time",
  "Both",
];
const WORK_LOCATION_OPTIONS = [
  "Work From Office",
  "Work From Home",
  "Field Job",
];
const COMPENSATION_TYPE_OPTIONS = [
  "Fixed Only",
  "Fixed + Incentive",
  "Incentive Only",
];
const PERK_OPTIONS = [
  "Flexible Working Hours",
  "Weekly Payout",
  "Health Insurance",
  "PF",
  "Annual Bonus",
  "Overtime Pay",
  "Food/Meals",
  "Accommodation",
];
const EDUCATION_OPTIONS = [
  "Below 10th",
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Graduate",
  "Post Graduate",
];
const ENGLISH_LEVEL_OPTIONS = ["No English", "Basic English", "Good English"];
const CONTACT_PREFERENCE_OPTIONS = ["Call", "WhatsApp", "Email"];

const debounce = (func: (...args: any[]) => any, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function PostJobScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  // --- Location Autocomplete States ---
  const [jobLocSuggestions, setJobLocSuggestions] = useState<any[]>([]);
  const [isJobLocSearching, setIsJobLocSearching] = useState(false);
  const [officeAddrSuggestions, setOfficeAddrSuggestions] = useState<any[]>([]);
  const [isOfficeAddrSearching, setIsOfficeAddrSearching] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    jobType: "Full Time",
    workLocation: "Work From Office",
    location: "",
    officeAddress: "",
    isNightShift: false,
    isEightHour: false,
    compensationType: "Fixed Only",
    minSalary: 0,
    maxSalary: 0,
    perks: [] as string[],
    joiningFee: false,
    minEducation: "Graduate",
    englishLevel: "Good English",
    experienceType: "Any",
    gender: "ANY",
    relatedRoles: [] as string[],
    additionalReqs: "",
    walkIn: false,
    walkInAddress: "",
    walkInStart: "",
    walkInEnd: "",
    walkInTimings: "",
    otherInstructions: "",
    contactPreference: "Call",
    notifyPreference: "Instant",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Trigger location search if applicable
    if (field === 'location' && value.length >= 3) {
      fetchLocationSuggestions(value, setJobLocSuggestions, setIsJobLocSearching);
    } else if (field === 'location') {
      setJobLocSuggestions([]);
    }

    if (field === 'officeAddress' && value.length >= 3) {
      fetchLocationSuggestions(value, setOfficeAddrSuggestions, setIsOfficeAddrSearching);
    } else if (field === 'officeAddress') {
      setOfficeAddrSuggestions([]);
    }
  };

  const fetchLocationSuggestions = useCallback(
    debounce(
      async (
        text: string,
        setSuggestions: (s: any[]) => void,
        setLoading: (l: boolean) => void
      ) => {
        const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
        if (!apiKey) return;
        if (!text || text.length < 3) {
          setSuggestions([]);
          return;
        }
        setLoading(true);
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&apiKey=${apiKey}&filter=countrycode:in`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          setSuggestions(data.features || []);
        } catch (error) {
          console.error("[Geoapify] Error:", error);
        } finally {
          setLoading(false);
        }
      },
      500
    ),
    []
  );

  const handleSuggestionSelect = (field: string, suggestion: any) => {
    const formatted = suggestion.properties.formatted || suggestion.properties.name;
    setFormData(prev => ({ ...prev, [field]: formatted }));
    if (field === 'location') setJobLocSuggestions([]);
    if (field === 'officeAddress') setOfficeAddrSuggestions([]);
  };

  const handlePerkToggle = (perk: string) => {
    const newPerks = formData.perks.includes(perk)
      ? formData.perks.filter((p) => p !== perk)
      : [...formData.perks, perk];
    handleInputChange("perks", newPerks);
  };

  const handleSubmit = async () => {
    if (!formData.jobTitle || !formData.description || !formData.location) {
      Alert.alert("Error", "Please fill in all mandatory fields.");
      return;
    }
    try {
      if (!token) {
        Alert.alert("Error", "You must be logged in to post a job.");
        return;
      }
      // Map jobTitle to title for the backend expectation
      const { jobTitle, ...otherFields } = formData;
      const payload = {
        ...otherFields,
        title: jobTitle,
        creditsRequired: 5, // Match the required Prisma field
      };

      await publishJob(payload, token);
      Alert.alert("Success", "Job Posted Successfully!");
      navigation.navigate("MainTabs", { screen: "Home" });
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Internal server error");
    }
  };

  const steps = ["Details", "Pay", "Reqs", "Interview", "Review"];

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            activeStep >= index ? styles.activeStepCircle : styles.inactiveStepCircle
          ]}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <Text style={[
            styles.stepLabel,
            activeStep === index ? styles.activeStepLabel : styles.inactiveStepLabel
          ]}>{step}</Text>
        </View>
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <View style={styles.formSection}>
            <Text style={styles.label}>Job Title / Designation *</Text>
            <TextInput
              style={styles.input}
              value={formData.jobTitle}
              onChangeText={(val) => handleInputChange("jobTitle", val)}
              placeholder="e.g. Software Developer"
              placeholderTextColor="#64748b"
            />

            <Text style={styles.label}>Job Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(val) => handleInputChange("description", val)}
              multiline
              numberOfLines={4}
              placeholder="Details about the role..."
              placeholderTextColor="#64748b"
            />

            <Text style={styles.label}>Job Location *</Text>
            <View style={{ zIndex: 1000, elevation: 5, position: 'relative' }}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(val) => handleInputChange("location", val)}
                  placeholder="City, State"
                  placeholderTextColor="#64748b"
                />
                {isJobLocSearching && (
                  <ActivityIndicator style={styles.inputLoader} size="small" color="#f97316" />
                )}
              </View>

              {jobLocSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {jobLocSuggestions.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionSelect('location', s)}
                    >
                      <Text style={styles.suggestionText}>{s.properties.formatted}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.label}>Job Type</Text>
            <View style={styles.optionsGrid}>
              {JOB_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleInputChange("jobType", opt)}
                  style={[styles.optionBtn, formData.jobType === opt && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.jobType === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Night Shift</Text>
              <Switch
                value={formData.isNightShift}
                onValueChange={(val) => handleInputChange("isNightShift", val)}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>8 Hours Duty</Text>
              <Switch
                value={formData.isEightHour}
                onValueChange={(val) => handleInputChange("isEightHour", val)}
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.formSection}>
            <Text style={styles.label}>Work Mode</Text>
            <View style={styles.optionsGrid}>
              {WORK_LOCATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleInputChange("workLocation", opt)}
                  style={[styles.optionBtn, formData.workLocation === opt && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.workLocation === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.workLocation === "Work From Office" && (
              <>
                <Text style={styles.label}>Office Address</Text>
                <View style={{ zIndex: 1000, elevation: 5, position: 'relative' }}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={formData.officeAddress}
                      onChangeText={(val) => handleInputChange("officeAddress", val)}
                      placeholder="Full office address"
                      placeholderTextColor="#64748b"
                    />
                    {isOfficeAddrSearching && (
                      <ActivityIndicator style={styles.inputLoader} size="small" color="#f97316" />
                    )}
                  </View>

                  {officeAddrSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {officeAddrSuggestions.map((s, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionSelect('officeAddress', s)}
                        >
                          <Text style={styles.suggestionText}>{s.properties.formatted}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            <Text style={styles.label}>Compensation Type</Text>
            <View style={styles.optionsGrid}>
              {COMPENSATION_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleInputChange("compensationType", opt)}
                  style={[styles.optionBtn, formData.compensationType === opt && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.compensationType === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Min Salary (/mo)</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.minSalary)}
                  onChangeText={(val) => handleInputChange("minSalary", Number(val))}
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Max Salary (/mo)</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.maxSalary)}
                  onChangeText={(val) => handleInputChange("maxSalary", Number(val))}
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <Text style={styles.label}>Perks</Text>
            <View style={styles.optionsGrid}>
              {PERK_OPTIONS.map((perk) => (
                <TouchableOpacity
                  key={perk}
                  onPress={() => handlePerkToggle(perk)}
                  style={[styles.optionBtn, formData.perks.includes(perk) && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.perks.includes(perk) && styles.optionTextActive]}>{perk}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.formSection}>
            <Text style={styles.label}>Gender Preference</Text>
            <View style={styles.optionsGrid}>
              {["ANY", "MALE", "FEMALE"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => handleInputChange("gender", g)}
                  style={[styles.optionBtn, formData.gender === g && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.gender === g && styles.optionTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Minimum Education</Text>
            <View style={styles.optionsGrid}>
              {EDUCATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleInputChange("minEducation", opt)}
                  style={[styles.optionBtn, formData.minEducation === opt && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.minEducation === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>English Level</Text>
            <View style={styles.optionsGrid}>
              {ENGLISH_LEVEL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleInputChange("englishLevel", opt)}
                  style={[styles.optionBtn, formData.englishLevel === opt && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.englishLevel === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Experience Requirement</Text>
            <TextInput
              style={styles.input}
              value={formData.experienceType}
              onChangeText={(val) => handleInputChange("experienceType", val)}
              placeholder="e.g. Any, 1-2 years"
              placeholderTextColor="#64748b"
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.formSection}>
            <Text style={styles.label}>Contact Preference</Text>
            <View style={styles.optionsGrid}>
              {CONTACT_PREFERENCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => handleInputChange("contactPreference", opt)}
                  style={[styles.optionBtn, formData.contactPreference === opt && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionText, formData.contactPreference === opt && styles.optionTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Is it a Walk-In?</Text>
              <Switch
                value={formData.walkIn}
                onValueChange={(val) => handleInputChange("walkIn", val)}
              />
            </View>

            {formData.walkIn && (
              <>
                <Text style={styles.label}>Walk-In Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.walkInAddress}
                  onChangeText={(val) => handleInputChange("walkInAddress", val)}
                  placeholderTextColor="#64748b"
                />
                <Text style={styles.label}>Timings</Text>
                <TextInput
                  style={styles.input}
                  value={formData.walkInTimings}
                  onChangeText={(val) => handleInputChange("walkInTimings", val)}
                  placeholder="e.g. 10 AM - 4 PM"
                  placeholderTextColor="#64748b"
                />
              </>
            )}
          </View>
        );
      case 4:
        return (
          <View style={styles.formSection}>
            <Text style={styles.previewTitle}>Review Details</Text>
            <View style={styles.previewCard}>
              <PreviewItem label="Title" value={formData.jobTitle} />
              <PreviewItem label="Location" value={formData.location} />
              <PreviewItem label="Type" value={formData.jobType} />
              <PreviewItem label="Mode" value={formData.workLocation} />
              <PreviewItem label="Salary" value={`${formData.minSalary} - ${formData.maxSalary}`} />
              <PreviewItem label="Education" value={formData.minEducation} />
              <PreviewItem label="English" value={formData.englishLevel} />
              <PreviewItem label="Gender" value={formData.gender} />
            </View>
          </View>
        );
    }
  };

  const PreviewItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.previewItem}>
      <Text style={styles.previewLabel}>{label}:</Text>
      <Text style={styles.previewValue}>{value || "Not set"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Jobs' })}
          style={styles.topBackBtn}
        >
          <ArrowLeftIcon size={20} color="#ea580c" />
          <Text style={styles.topBackBtnText}>Back to Jobs</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Post a New Job</Text>
        {renderStepper()}
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={activeStep === 0}
          onPress={() => setActiveStep(s => s - 1)}
          style={[styles.footerBtn, activeStep === 0 && styles.disabledBtn]}
        >
          <Text style={styles.footerBtnText}>Back</Text>
        </TouchableOpacity>

        {activeStep < 4 ? (
          <TouchableOpacity
            onPress={() => setActiveStep(s => s + 1)}
            style={[styles.footerBtn, styles.nextBtn]}
          >
            <Text style={styles.footerBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.footerBtn, styles.submitBtn]}
          >
            <Text style={styles.footerBtnText}>Post Job</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f9fafb',
  },
  topBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBackBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ea580c',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeStepCircle: {
    backgroundColor: '#f97316',
  },
  inactiveStepCircle: {
    backgroundColor: '#e2e8f0',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeStepLabel: {
    color: '#f97316',
  },
  inactiveStepLabel: {
    color: '#64748b',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1,
    overflow: 'visible',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#e2e8f0',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputLoader: {
    position: 'absolute',
    right: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    maxHeight: 250,
    zIndex: 99999,
    elevation: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  optionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  previewCard: {
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  previewLabel: {
    color: '#64748b',
    fontWeight: '600',
  },
  previewValue: {
    color: '#1e293b',
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    minWidth: 100,
    alignItems: 'center',
  },
  footerBtnText: {
    fontWeight: '700',
    color: '#475569',
  },
  nextBtn: {
    backgroundColor: '#f97316',
  },
  submitBtn: {
    backgroundColor: '#22c55e',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
