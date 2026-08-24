import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/Header';

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

const dummyBlogs: BlogItem[] = [
  {
    id: 1,
    title: "How to Find Your Dream Job in 2026",
    content: "<p>Finding a job can be tough, but with the right strategy and tools like OJK Jobs, you can land your dream role faster than ever.</p><p>Start by optimizing your resume for ATS and networking with industry professionals.</p>",
    featuredImg: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
    createdAt: "2026-08-20T08:30:00Z",
    author: { username: "Admin" }
  },
  {
    id: 2,
    title: "Top 10 Skills for Modern Tech Roles",
    content: "<p>The tech landscape is shifting towards AI and Cloud Computing. Professionals who master these areas will be in high demand.</p><p>Soft skills like communication and problem-solving remain equally important.</p>",
    featuredImg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    createdAt: "2026-08-22T14:20:00Z",
    author: { username: "CareerCoach" }
  },
  {
    id: 3,
    title: "Navigating the Future of Work",
    content: "<p>Remote and hybrid models are here to stay. Learn how to stay productive while maintaining a healthy work-life balance.</p>",
    featuredImg: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    createdAt: "2026-08-24T10:00:00Z",
    author: { username: "FutureExpert" }
  },
  {
    id: 4,
    title: "Understanding AI in Recruitment",
    content: "<p>Artificial Intelligence is changing how companies hire. Learn how to leverage AI tools for your job search.</p>",
    featuredImg: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    createdAt: "2026-08-25T09:00:00Z",
    author: { username: "TechGuide" }
  },
  {
    id: 5,
    title: "Building a Personal Brand Online",
    content: "<p>Your online presence is your new resume. Here is how to build a brand that attracts recruiters.</p>",
    featuredImg: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    createdAt: "2026-08-26T11:00:00Z",
    author: { username: "Admin" }
  },
  {
    id: 6,
    title: "The Importance of Networking",
    content: "<p>Networking is not just about meeting people; it's about building relationships that last a lifetime.</p>",
    featuredImg: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    createdAt: "2026-08-27T15:00:00Z",
    author: { username: "CareerCoach" }
  },
  {
    id: 7,
    title: "Mastering the Job Interview",
    content: "<p>Tips and tricks to ace your next interview and land the job you've always wanted.</p>",
    featuredImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    createdAt: "2026-08-28T10:00:00Z",
    author: { username: "HRPro" }
  }
];

export default function BlogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [displayLimit, setDisplayLimit] = useState(5);

  const displayedBlogs = dummyBlogs.slice(0, displayLimit);

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
    if (displayLimit >= dummyBlogs.length) return <View style={{ height: 20 }} />;

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
