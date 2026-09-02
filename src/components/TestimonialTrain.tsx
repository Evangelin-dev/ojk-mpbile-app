import React, { useRef } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  photo: string;
  text: string;
};

interface Props {
  testimonials: Testimonial[];
}

export const TestimonialTrain: React.FC<Props> = ({ testimonials }) => {
  const flatListRef = useRef<FlatList>(null);

  // If there's only one testimonial, don't duplicate it.
  // Duplication is usually for infinite loop scrolling.
  const data = testimonials.length > 1 ? [...testimonials, ...testimonials] : testimonials;

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={[
        { paddingHorizontal: 16 },
        testimonials.length === 1 && { width: '100%', justifyContent: 'center', paddingHorizontal: 0 }
      ]}
      scrollEnabled={testimonials.length > 1}
      renderItem={({ item, index }) => (
        <View key={index} style={[styles.card, testimonials.length === 1 && { marginRight: 0 }]}>
          <View style={styles.header}>
            <Image source={{ uri: item.photo }} style={styles.avatar} />
            <View style={styles.headerText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>{item.role}</Text>
              <View style={styles.stars}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Svg key={i} width={16} height={16} fill="#facc15" viewBox="0 0 20 20">
                    <Path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                  </Svg>
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.text}>"{item.text}"</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#dcfce7',
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  headerText: {
    marginLeft: 16,
  },
  name: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 17,
  },
  role: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  text: {
    color: '#374151',
    fontStyle: 'italic',
    fontSize: 15,
  },
});
