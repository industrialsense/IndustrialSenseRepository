import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const TEXT_CAROUSEL_DATA = [
  { id: '1', text: 'Texto de la primera diapositiva' },
  { id: '2', text: 'Texto de la segunda diapositiva' },
  { id: '3', text: 'Texto de la tercera diapositiva' },
  // Agrega más textos si es necesario
];

const TextCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const carouselInterval = useRef(null);

  const scrollToIndex = (index) => {
    flatListRef.current.scrollToIndex({ index, animated: true });
  };

  useEffect(() => {
    carouselInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % TEXT_CAROUSEL_DATA.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 5000); // Cambia el valor para ajustar la velocidad del carrusel (en milisegundos)

    return () => {
      if (carouselInterval.current) {
        clearInterval(carouselInterval.current);
      }
    };
  }, []);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        data={TEXT_CAROUSEL_DATA}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.slideText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        ref={flatListRef}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    height: 150,
    marginBottom: 20,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  slideText: {
    fontSize: 18,
    color: '#333',
  },
});

export default TextCarousel;
