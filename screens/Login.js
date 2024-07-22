import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, ActivityIndicator, Text } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt';

export default function Login({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar la carga

  const handleLogin = async () => {
    if (correo === '' || contrasena === '') {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true); // Mostrar la pantalla de carga

    const db = await SQLite.openDatabaseAsync('indsense');
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM usuarios WHERE correo = ?',
        [correo]
      );

      if (result) {
        const isValidPassword = bcrypt.compareSync(contrasena, result.contrasena);
        if (isValidPassword) {
          switch (result.rol) {
            case 'superadmin':
              navigation.navigate('SuperAdmin');
              break;
            case 'admin':
              navigation.navigate('Admin');
              break;
            case 'usuario':
              navigation.navigate('User');
              break;
            default:
              Alert.alert("Error", "Rol desconocido");
              break;
          }
        } else {
          Alert.alert("Error", "Correo electrónico o contraseña incorrectos");
        }
      } else {
        Alert.alert("Error", "Correo electrónico o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      Alert.alert("Error", "Error al iniciar sesión");
    } finally {
      setLoading(false); // Ocultar la pantalla de carga
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Iniciando sesión...</Text>
      </View>
    );
  }

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
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF' } }}
            />
            <IconButton
              icon={showPassword ? 'eye-off' : 'eye'}
              color="#007BFF"
              size={24}
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
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
    width: 150,
    height: 150,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    color: '#333333',
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
    borderRadius: 8,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -30 }],
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333333',
  },
});
