import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  XMarkIcon,
  StarIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';
import { Header } from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  imageUrl: string;
  isTrending?: boolean;
}

interface Article {
  id: number;
  title: string;
  author: string;
  readTime: string;
  imageUrl: string;
}

const featuredCourses: Course[] = [
  {
    id: 1,
    title: 'Advanced React for Senior Engineers',
    category: 'Web Development',
    duration: '8 Weeks',
    imageUrl: 'https://placehold.co/600x400/0E7490/FFFFFF/png?text=React',
    isTrending: true,
  },
  {
    id: 2,
    title: 'Data Science with Python: From Zero to Hero',
    category: 'Data Science',
    duration: '12 Weeks',
    imageUrl: 'https://placehold.co/600x400/9333EA/FFFFFF/png?text=Python',
    isTrending: true,
  },
  {
    id: 3,
    title: 'Project Management Professional (PMP) Prep',
    category: 'Business',
    duration: '6 Weeks',
    imageUrl: 'https://placehold.co/600x400/F59E0B/FFFFFF/png?text=PMP',
  },
  {
    id: 4,
    title: 'UI/UX Design Fundamentals with Figma',
    category: 'Design',
    duration: '4 Weeks',
    imageUrl: 'https://placehold.co/600x400/D946EF/FFFFFF/png?text=Figma',
  },
];

const careerArticles: Article[] = [
  {
    id: 1,
    title: 'How to Ace the Technical Interview in 2025',
    author: 'by Jane Doe, HR Expert',
    readTime: '10 min read',
    imageUrl: 'https://placehold.co/600x400/16A34A/FFFFFF/png?text=Interview',
  },
  {
    id: 2,
    title: 'Negotiating Your Salary: A Step-by-Step Guide',
    author: 'by John Smith, Career Coach',
    readTime: '8 min read',
    imageUrl: 'https://placehold.co/600x400/DC2626/FFFFFF/png?text=Salary',
  },
  {
    id: 3,
    title: 'The Top 10 In-Demand Soft Skills for the Future',
    author: 'by Industry Insights',
    readTime: '12 min read',
    imageUrl: 'https://placehold.co/600x400/6366F1/FFFFFF/png?text=Skills',
  },
];

const ComingSoonModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalIconBox}>
          <StarIcon size={40} color="#fbb040" />
        </View>
        <Text style={styles.modalTitle}>Coming Soon!</Text>
        <Text style={styles.modalText}>
          We're working hard to bring you this course. Stay tuned for the launch!
        </Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Got It</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const LearningScreen = () => {
  const navigation = useNavigation<any>();
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#1e293b" strokeWidth={2}>
            <SvgPath strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </Svg>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <ComingSoonModal visible={isModalVisible} onClose={() => setModalVisible(false)} />

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Learning Hub</Text>
          <Text style={styles.heroSubtitle}>Upskill yourself and get ready for your next career move.</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Courses</Text>
            <AcademicCapIcon size={22} color="#fbb040" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredCourses.map(course => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => setModalVisible(true)}
              >
                <Image source={{ uri: course.imageUrl }} style={styles.cardImage} />
                {course.isTrending && (
                  <View style={styles.trendingBadge}>
                    <Text style={styles.trendingText}>Trending</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.categoryText}>{course.category}</Text>
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <View style={styles.durationRow}>
                    <ClockIcon size={14} color="#94a3b8" />
                    <Text style={styles.durationText}>{course.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Career Guidance</Text>
            <BookOpenIcon size={22} color="#3b82f6" />
          </View>

          <View style={styles.articleGrid}>
            {careerArticles.map(article => (
              <View key={article.id} style={styles.articleCard}>
                <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.courseTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.authorText}>{article.author}</Text>
                  <Text style={styles.readTimeText}>{article.readTime}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  heroSection: {
    marginBottom: 30,
    marginTop: 10,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  horizontalScroll: {
    paddingBottom: 10,
  },
  courseCard: {
    width: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fbb040',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trendingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardInfo: {
    padding: 16,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    lineHeight: 22,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  articleGrid: {
    gap: 16,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  articleImage: {
    width: 100,
    height: '100%',
  },
  authorText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  readTimeText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LearningScreen;
