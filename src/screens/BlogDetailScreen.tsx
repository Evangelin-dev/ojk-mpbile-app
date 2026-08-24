import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Header } from '../components/Header';

interface BlogItem {
  id: number;
  title: string;
  content: string;
  featuredImg?: string;
  createdAt: string;
  author: {
    username: string;
  };
}

export default function BlogDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { blog } = route.params as { blog: BlogItem };

  if (!blog) return null;

  return (
    <View style={styles.outerContainer}>
      <Header />

      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
            <Path d="M15 18l-6-6 6-6" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Back to Blogs
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {blog.featuredImg && (
          <Image
            source={{ uri: blog.featuredImg }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            {blog.title}
          </Text>

          <View style={styles.metaContainer}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {blog.author.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.authorName}>By OJK JOBS</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(blog.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.bodyText}>
              {blog.content.replace(/<[^>]*>?/gm, '')}
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navHeader: {
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 260,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 34,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 14,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  body: {
    marginTop: 8,
  },
  bodyText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
});
