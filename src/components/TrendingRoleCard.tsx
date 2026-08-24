import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface TrendingRoleCardProps {
  role: string;
}

export const TrendingRoleCard: React.FC<TrendingRoleCardProps> = ({ role }) => {
  const [openings, setOpenings] = useState(Math.floor(Math.random() * 4000) + 10);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpenings((prev) => prev + Math.floor(Math.random() * 3));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconWrap}>
        <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={10} stroke="#9ca3af" strokeWidth={1.5} />
          <Path d="M12 8v4l2 2" stroke="#9ca3af" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={styles.roleName} numberOfLines={1} ellipsizeMode="tail">
            {role}
          </Text>
          <Svg width={20} height={20} fill="none" viewBox="0 0 24 24">
            <Path stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </Svg>
        </View>
        <Text style={styles.openings}>{openings} openings</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 70,
    width: '100%',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 15,
    flex: 1,
  },
  openings: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
});
