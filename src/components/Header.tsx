import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, Modal, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

          {user ? (
            /* Logged in — show user avatar & dropdown */
            <View style={styles.userSection}>
              <TouchableOpacity style={styles.avatarBtn} onPress={() => {/* Could open profile menu */}}>
                <View style={[styles.avatar, { backgroundColor: user.role === 'EMPLOYER' ? '#fbb040' : '#39b54a' }]}>
                  <Text style={styles.avatarText}>{getInitials(user.full_name || user.phone)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.full_name || user.phone || 'User'}
                  </Text>
                  <Text style={styles.userRole}>
                    {user.role === 'EMPLOYER' ? 'Employer' : 'Candidate'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Svg width={18} height={18} fill="none" viewBox="0 0 24 24">
                  <Path stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
  // Logged in user styles
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  userInfo: {
    maxWidth: 100,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  userRole: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
});
