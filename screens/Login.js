import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import * as SQLite from 'expo-sqlite';

export default function Login({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleLogin = async () => {
    if (correo === '' || contrasena === '') {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const db = await SQLite.openDatabaseAsync('indsense');
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?',
        [correo, contrasena]
      );
      if (result) {
        // Si el usuario existe, navega a la página de inicio (Home) y pasa el correo
        navigation.navigate('Home', { userCorreo: correo });
      } else {
        Alert.alert("Error", "Correo electrónico o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      Alert.alert("Error", "Error al iniciar sesión");
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Image source={require('../assets/Logo.png')} style={styles.logo} />
        <Text style={styles.title}>Inicio de Sesión</Text>
        <View style={styles.formulario}>
          <TextInput
            label="Correo Electrónico"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#007BFF' } }}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              label="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
              style={[styles.input, styles.passwordInput]}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF' } }}
            />
            <IconButton
              icon="lock"
              color="#007BFF"
              size={24}
              style={styles.lockIcon}
            />
          </View>
        </View>
        <Button mode="contained" onPress={handleLogin} style={styles.botonAcceder} labelStyle={styles.botonAccederText}>
          Acceder
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.botonRegistrarse} labelStyle={styles.botonRegistrarseText}>
          Regístrate Aquí
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 150, // Incrementa el tamaño del logo
    height: 150, // Incrementa el tamaño del logo
    marginBottom: 40,
    resizeMode: 'contain', // Esto asegura que la imagen se ajuste bien dentro del tamaño especificado
  },
  title: {
    fontSize: 24,
    color: '#333333', // Gris oscuro
    marginBottom: 20,
    fontWeight: 'bold',
  },
  formulario: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 12,
    borderRadius: 8, // Redondea las esquinas de los inputs
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40, // Añade espacio para el ícono de candado
  },
  lockIcon: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -30 }], // Ajuste vertical para centrar el ícono
  },
  botonAcceder: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    marginBottom: 12,
    width: '80%',
    alignSelf: 'center',
  },
  botonAccederText: {
    color: '#fff',
  },
  botonRegistrarse: {
    color: '#003366',
    marginTop: 10,
  },
  botonRegistrarseText: {
    color: '#003366',
  },
});
