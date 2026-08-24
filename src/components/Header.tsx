import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, Modal, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoWrap}>
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

          {/* Auth buttons */}
          <TouchableOpacity style={styles.candidateBtn}>
            <Text style={styles.candidateBtnText}>CANDIDATE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.employerBtn}>
            <Text style={styles.employerBtnText}>EMPLOYER</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 12,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    fontSize: 17,
    color: '#374151',
    fontWeight: '500',
  },
});
