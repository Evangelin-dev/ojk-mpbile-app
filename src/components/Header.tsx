import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, Modal, StyleSheet, Pressable, Dimensions, StatusBar, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const Header: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleProfile = () => {
    setIsMenuOpen(false);
    if (user?.role === 'EMPLOYER') {
      navigation.navigate('EmployerProfile');
    } else {
      navigation.navigate('Dashboard', { screen: 'CandidateProfile' });
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  // Profile Icon SVG
  const ProfileIcon = () => (
    <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
      <Path
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <View
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setHeaderHeight(height);
      }}
      style={styles.headerContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          {/* Logo Section - No Hamburger here per latest request */}
          <TouchableOpacity style={styles.logoWrap} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.logoText}>OJK Jobs</Text>
          </TouchableOpacity>

          {/* Right Actions */}
          <View style={styles.rightActions}>
            {/* Language Selector */}
            <TouchableOpacity style={styles.langBtn}>
              <Text style={{ fontSize: 16 }}>🇬🇧</Text>
              <Svg width={14} height={14} fill="none" viewBox="0 0 24 24">
                <Path stroke="#374151" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </Svg>
            </TouchableOpacity>

            {user ? (
              /* Logged in — show Profile Icon */
              <View style={styles.userSection}>
                <TouchableOpacity style={styles.avatarBtn} onPress={() => setIsMenuOpen(true)}>
                  <View style={[styles.avatar, { backgroundColor: user.role === 'EMPLOYER' ? '#fbb040' : '#39b54a' }]}>
                    {user.profileImage ? (
                      <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                    ) : (
                      <ProfileIcon />
                    )}
                  </View>
                  <Svg width={14} height={14} fill="none" viewBox="0 0 24 24" style={{ marginLeft: 4 }}>
                    <Path stroke="#6b7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </Svg>
                </TouchableOpacity>
              </View>
            ) : (
              /* Not logged in — show login buttons */
              <>
                <TouchableOpacity
                  style={styles.candidateBtn}
                  onPress={() => navigation.navigate('Login', { role: 'CANDIDATE' })}
                >
                  <Text style={styles.candidateBtnText}>CANDIDATE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.employerBtn}
                  onPress={() => navigation.navigate('Login', { role: 'EMPLOYER' })}
                >
                  <Text style={styles.employerBtnText}>EMPLOYER</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Profile Dropdown Menu */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuOpen(false)}>
          <View style={[styles.menuPopup, { top: headerHeight || 60 }]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuPhone}>{user?.phone || 'No phone'}</Text>
              <Text style={styles.menuRole}>{user?.role === 'EMPLOYER' ? 'Employer' : 'Candidate'}</Text>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                <Path stroke="#4b5563" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </Svg>
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
              <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                <Path stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </Svg>
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 1000,
  },
  safeArea: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  headerBar: {
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  candidateBtn: {
    backgroundColor: '#39b54a',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  candidateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  employerBtn: {
    backgroundColor: '#fbb040',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  employerBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    width: SCREEN_WIDTH,
  },
  menuPopup: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: SCREEN_WIDTH * 0.6,
    maxWidth: 240,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuPhone: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  menuRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  logoutItem: {
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#fff1f2',
  },
});
