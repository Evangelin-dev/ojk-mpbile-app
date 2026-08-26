import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';
import { fetchBlogs } from '../api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

export default function BlogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(5);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await fetchBlogs();
      // Handle both nested 'blogs' key and direct array response
      const blogsData = Array.isArray(data) ? data : (data.blogs || []);
      setBlogs(blogsData);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const displayedBlogs = blogs.slice(0, displayLimit);

  const renderItem = ({ item }: { item: BlogItem }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BlogDetail', { blog: item })}
      style={styles.card}
      activeOpacity={0.9}
    >
      {item.featuredImg && (
        <Image
          source={{ uri: item.featuredImg }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>By {item.author.username}</Text>
          <Text style={styles.metaText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text
          style={styles.cardExcerpt}
          numberOfLines={3}
        >
          {item.content.replace(/<[^>]*>?/gm, '')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />;
    if (error) return <Text style={{ textAlign: 'center', color: 'red', marginVertical: 20 }}>{error}</Text>;
    if (displayLimit >= blogs.length) return <View style={{ height: 20 }} />;

    return (
      <TouchableOpacity
        style={styles.showMoreBtn}
        onPress={() => setDisplayLimit(displayLimit + 5)}
      >
        <Text style={styles.showMoreText}>Show More</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={displayedBlogs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Blog</Text>
            <Text style={styles.pageSubtitle}>Latest updates and career advice</Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardExcerpt: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  showMoreBtn: {
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  showMoreText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
