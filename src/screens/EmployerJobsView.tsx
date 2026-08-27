import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ChevronDownIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { fetchEmployerJobs, deleteJob, updateJob } from '../api/employer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Job {
  id: number;
  employerId: number;
  creditsRequired: number;
  jobTitle: string;
  jobType: string;
  isNightShift: boolean;
  isActive: boolean;
  workLocation: string;
  officeAddress: string;
  compensationType: string;
  minSalary: number;
  maxSalary: number;
  perks: string[];
  joiningFee: boolean;
  minEducation: string;
  englishLevel: string;
  experienceType: string;
  relatedRoles: string[];
  additionalReqs: string;
  description: string;
  walkIn: boolean;
  walkInAddress: string;
  walkInStart: string;
  walkInEnd: string;
  walkInTimings: string;
  otherInstructions: string;
  contactPreference: string;
  notifyPreference: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
  postedOn: string;
  location: string;
  status: "Active" | "Expired";
  isEightHour: boolean;
  gender: "MALE" | "FEMALE" | "ANY";
}

const PERK_OPTIONS = [
  "Flexible Working Hours",
  "Weekly Payout",
  "Health Insurance",
  "PF",
  "Annual Bonus",
  "Overtime Pay",
  "Joining Bonus",
  "Travel Allowance (TA)",
  "Petrol Allowance",
  "Mobile Allowance",
  "Internet Allowance",
  "Laptop",
  "ESI (ESIC)",
  "Food/Meals",
  "Accommodation",
  "5 Working Days",
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

interface EditJobModalProps {
  job: Job;
  visible: boolean;
  onClose: () => void;
  onSave: (updatedJob: Partial<Job>) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, visible, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Job>>({ ...job });
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    setFormData({ ...job });
  }, [job, visible]);

  const handlePerkToggle = (perk: string) => {
    const currentPerks = formData.perks || [];
    const newPerks = currentPerks.includes(perk)
      ? currentPerks.filter((p) => p !== perk)
      : [...currentPerks, perk];
    setFormData((prev) => ({ ...prev, perks: newPerks }));
  };

  const handleAddRole = () => {
    if (currentRole && !formData.relatedRoles?.includes(currentRole)) {
      const currentRoles = formData.relatedRoles || [];
      setFormData((prev) => ({
        ...prev,
        relatedRoles: [...currentRoles, currentRole],
      }));
    }
    setCurrentRole("");
  };

  const handleRemoveRole = (roleToRemove: string) => {
    const newRoles =
      formData.relatedRoles?.filter((role) => role !== roleToRemove) || [];
    setFormData((prev) => ({ ...prev, relatedRoles: newRoles }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Edit Job</Text>
        <TouchableOpacity onPress={onClose}>
          <XMarkIcon size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.jobTitle}
            onChangeText={(text) => setFormData(p => ({ ...p, jobTitle: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData(p => ({ ...p, description: text }))}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>8 Hours Duty</Text>
          <Switch
            value={formData.isEightHour}
            onValueChange={(val) => setFormData(p => ({ ...p, isEightHour: val }))}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Night Shift</Text>
          <Switch
            value={formData.isNightShift}
            onValueChange={(val) => setFormData(p => ({ ...p, isNightShift: val }))}
          />
        </View>

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionLabel}>Compensation & Perks</Text>
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Min Salary</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.minSalary || '')}
              onChangeText={(text) => setFormData(p => ({ ...p, minSalary: Number(text) }))}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Max Salary</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.maxSalary || '')}
              onChangeText={(text) => setFormData(p => ({ ...p, maxSalary: Number(text) }))}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Perks</Text>
          <View style={styles.tagContainer}>
            {PERK_OPTIONS.map((perk) => (
              <TouchableOpacity
                key={perk}
                onPress={() => handlePerkToggle(perk)}
                style={[
                  styles.tag,
                  formData.perks?.includes(perk) && styles.tagActive
                ]}
              >
                <Text style={[styles.tagText, formData.perks?.includes(perk) && styles.tagTextActive]}>
                  {perk}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionLabel}>Candidate Requirements</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender Preference</Text>
          <View style={styles.radioContainer}>
            {["ANY", "MALE", "FEMALE"].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.radioOption}
                onPress={() => setFormData(p => ({ ...p, gender: g as any }))}
              >
                <View style={[styles.radioCircle, (formData.gender || "ANY") === g && styles.radioActive]} />
                <Text style={styles.radioText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Minimum Education</Text>
          <View style={styles.pickerContainer}>
            {EDUCATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setFormData(p => ({ ...p, minEducation: opt }))}
                style={[styles.tag, formData.minEducation === opt && styles.tagActive]}
              >
                <Text style={[styles.tagText, formData.minEducation === opt && styles.tagTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>English Level</Text>
          <View style={styles.pickerContainer}>
            {ENGLISH_LEVEL_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setFormData(p => ({ ...p, englishLevel: opt }))}
                style={[styles.tag, formData.englishLevel === opt && styles.tagActive]}
              >
                <Text style={[styles.tagText, formData.englishLevel === opt && styles.tagTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Related Roles</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={currentRole}
              onChangeText={setCurrentRole}
              placeholder="e.g., Software Engineer"
            />
            <TouchableOpacity onPress={handleAddRole} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.tagContainer, { marginTop: 10 }]}>
            {formData.relatedRoles?.map((role) => (
              <View key={role} style={styles.roleTag}>
                <Text style={styles.roleTagText}>{role}</Text>
                <TouchableOpacity onPress={() => handleRemoveRole(role)}>
                  <XMarkIcon size={14} color="#f97316" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.row}>
          <Text style={[styles.label, { marginBottom: 0 }]}>Schedule a Walk-in Interview?</Text>
          <Switch
            value={formData.walkIn}
            onValueChange={(val) => setFormData(p => ({ ...p, walkIn: val }))}
          />
        </View>

        {formData.walkIn && (
          <View style={styles.walkInContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Walk-in Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.walkInAddress}
                onChangeText={(text) => setFormData(p => ({ ...p, walkInAddress: text }))}
              />
            </View>
            {/* Note: Date pickers are complex in RN, using text for now or simple placeholders */}
            <Text style={styles.hint}>Format dates in API logic later</Text>
          </View>
        )}

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(formData)}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default function EmployerJobsView() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [currentJobToEdit, setCurrentJobToEdit] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Expired'>('All');

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEmployerJobs(token);
      // Adjusting to handle nested jobs or direct array
      const jobsData = Array.isArray(response) ? response : (response.jobs || []);
      const mappedJobs = jobsData.map((job: any) => ({
        ...job,
        status: job.isActive ? "Active" : "Expired",
        postedOn: new Date(job.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      }));
      setJobs(mappedJobs);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (jobId: number) => {
    setMenuOpen(null);
    Alert.alert(
      "Delete Job",
      "Are you sure you want to PERMANENTLY DELETE this job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) return;
              await deleteJob(jobId, token);
              setJobs(prev => prev.filter(j => j.id !== jobId));
            } catch (err) {
              Alert.alert("Error", "Failed to delete job.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (job: Job) => {
    setCurrentJobToEdit(job);
    setIsEditModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = async (updatedData: Partial<Job>) => {
    if (!currentJobToEdit || !token) return;
    try {
      await updateJob(currentJobToEdit.id, updatedData, token);
      setJobs(prev => prev.map(j => j.id === currentJobToEdit.id ? { ...j, ...updatedData } as Job : j));
      setIsEditModalOpen(false);
      setCurrentJobToEdit(null);
    } catch (err) {
      Alert.alert("Error", "Failed to update job.");
    }
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <View style={styles.jobCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{item.jobTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#dcfce7' : 'rgba(254, 249, 195, 0.5)' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Active' ? '#15803d' : '#c2410c' }]}>
              {item.status === 'Active' ? 'Active' : 'Under Review'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen(menuOpen === item.id ? null : item.id)} style={styles.menuBtn}>
          <EllipsisVerticalIcon size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {menuOpen === item.id && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleEdit(item)}>
            <PencilSquareIcon size={20} color="#334155" />
            <Text style={styles.menuItemText}>Edit Job</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => handleDelete(item.id)}>
            <TrashIcon size={20} color="#ef4444" />
            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Delete Job</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <MapPinIcon size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detail}>
          <BriefcaseIcon size={14} color="#64748b" />
          <Text style={styles.detailText}>{item.jobType}</Text>
        </View>
      </View>

      <View style={styles.salaryRow}>
        <CurrencyRupeeIcon size={16} color="#16a34a" />
        <Text style={styles.salaryText}>
          {item.minSalary.toLocaleString()} - {item.maxSalary.toLocaleString()} / month
        </Text>
      </View>

      <View style={styles.cardFooter}>
         <Text style={styles.postedText}>Posted on: {item.postedOn}</Text>
      </View>
    </View>
  );

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'All') return true;
    return job.status === activeTab;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>All Jobs</Text>
          <Text style={styles.headerSubtitle}>Total Jobs: {jobs.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => navigation.navigate('PostJob')}
        >
          <Text style={styles.postBtnText}>Post New Job</Text>
          <PlusIcon size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['All', 'Active', 'Expired'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchJobs} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No jobs found.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchJobs}
        />
      )}

      {currentJobToEdit && (
        <EditJobModal
          visible={isEditModalOpen}
          job={currentJobToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f97316',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fb923c',
  },
  postBtn: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuBtn: {
    padding: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: 150,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: '40%',
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    flexShrink: 1,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  salaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16a34a',
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  postedText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: '#ffedd5',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#f97316',
  },

  // Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalScroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  tagActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  tagText: {
    fontSize: 12,
    color: '#64748b',
  },
  tagTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  radioActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  radioText: {
    fontSize: 14,
    color: '#475569',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    fontWeight: '700',
    color: '#475569',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  roleTagText: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '700',
  },
  walkInContainer: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#ffedd5',
    marginTop: 10,
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 30,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f97316',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
