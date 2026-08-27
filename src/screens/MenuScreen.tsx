import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Linking,
} from 'react-native';
import {
  BriefcaseIcon,
  ChartBarIcon,
  TicketIcon,
  CreditCardIcon,
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import SupportTicketModal from '../components/SupportTicketModal';

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [expandedSections, setExpandedItems] = useState<string[]>([]);
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);

  const handleOpenURL = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const toggleExpand = (item: string) => {
    setExpandedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const MenuItem = ({ icon, label, onPress, color = '#1e293b', showArrow = true, value, isExpandable, id }: any) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <TouchableOpacity style={styles.menuItem} onPress={isExpandable ? () => toggleExpand(id) : onPress}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <Text style={[styles.menuLabel, { color }]}>{label}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {value && <Text style={styles.menuValue}>{value}</Text>}
          {isExpandable ? (
            isExpanded ? <ChevronUpIcon size={18} color="#94a3b8" /> : <ChevronDownIcon size={18} color="#94a3b8" />
          ) : (
            showArrow && <ChevronRightIcon size={18} color="#94a3b8" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const SubMenuItem = ({ label, onPress, icon }: any) => (
    <TouchableOpacity style={styles.subMenuItem} onPress={onPress}>
      {icon}
      <Text style={styles.subMenuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Settings and activity</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MagnifyingGlassIcon size={20} color="#64748b" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#64748b"
              style={styles.searchInput}
            />
          </View>
        </View>

        <SectionHeader title="How you use OJK Jobs" />
        <MenuItem
          icon={<BriefcaseIcon size={22} color="#1e293b" />}
          label="Post Jobs"
          onPress={() => navigation.navigate('PostJob')}
        />

        {/* Database Section */}
        <MenuItem
          id="database"
          isExpandable
          icon={<CircleStackIcon size={22} color="#1e293b" />}
          label="Database"
        />
        {expandedSections.includes('database') && (
          <View style={styles.subMenuContainer}>
            <SubMenuItem
              label="Search Candidates"
              icon={<MagnifyingGlassIcon size={18} color="#64748b" />}
              onPress={() => navigation.navigate('SearchCandidates')}
            />
            <SubMenuItem
              label="Saved Searches"
              icon={<BookmarkIcon size={18} color="#64748b" />}
              onPress={() => navigation.navigate('SavedSearches')}
            />
          </View>
        )}

        <MenuItem
          icon={<ChartBarIcon size={22} color="#1e293b" />}
          label="Reports"
          onPress={() => navigation.navigate('ReportsDashboard')}
        />
        <MenuItem
          icon={<TicketIcon size={22} color="#1e293b" />}
          label="Credits & usage"
          onPress={() => navigation.navigate('CreditsAndUsage')}
        />
        <MenuItem
          icon={<CalendarDaysIcon size={22} color="#1e293b" />}
          label="Plans"
          onPress={() => navigation.navigate('EmployerPricingPlans')}
        />
        <MenuItem
          icon={<CreditCardIcon size={22} color="#1e293b" />}
          label="Billing"
          onPress={() => navigation.navigate('Billing')}
        />

        <SectionHeader title="Support & Settings" />
        <MenuItem
          id="support"
          isExpandable
          icon={<QuestionMarkCircleIcon size={22} color="#1e293b" />}
          label="Help & Support"
        />
        {expandedSections.includes('support') && (
          <View style={styles.subMenuContainer}>
            <SubMenuItem
              label="FAQ"
              onPress={() => handleOpenURL('https://www.ojkjobs.com/support')}
            />
            <SubMenuItem label="Contact us" onPress={() => setIsSupportModalVisible(true)} />
            <SubMenuItem
                label="Chat on Whatsapp"
                icon={<ChatBubbleLeftRightIcon size={18} color="#16a34a" />}
                onPress={() => handleOpenURL('https://api.whatsapp.com/send/?phone=918122577694&text&type=phone_number&app_absent=0')}
            />
          </View>
        )}
        <MenuItem
          icon={<PhoneIcon size={22} color="#1e293b" />}
          label="Contact Sales"
          onPress={() => setIsSupportModalVisible(true)}
        />

        <View style={styles.divider} />

        <MenuItem
          icon={<ArrowLeftOnRectangleIcon size={22} color="#ef4444" />}
          label="Logout"
          onPress={logout}
          color="#ef4444"
          showArrow={false}
        />

        <View style={{ height: 60 }} />
      </ScrollView>

      <SupportTicketModal
        visible={isSupportModalVisible}
        onClose={() => setIsSupportModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 10,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    padding: 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: '#64748b',
  },
  subMenuContainer: {
    backgroundColor: '#f8fafc',
    paddingLeft: 56,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  subMenuLabel: {
    fontSize: 14,
    color: '#475569',
  },
  divider: {
    height: 12,
    backgroundColor: '#f8fafc',
    marginTop: 20,
  },
});
