import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function UserScreen({ navigation }) {
  const handleLogout = () => {
    // Navegar de vuelta a la pantalla de inicio de sesión
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>User Screen</Text>
      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
        Cerrar Sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
  },
});
