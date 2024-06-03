import React, { useState } from "react";
import { Text, View, StyleSheet, TextInput, Button, Alert } from "react-native";
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
        // Si el usuario existe, navega a la página de inicio (Home)
        navigation.navigate('Home');
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
        <Text>Inicio de Sesión</Text>
        <View style={styles.formulario}>
          <TextInput
            placeholder="Correo Electrónico"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
          />
          <TextInput
            placeholder="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            style={styles.input}
          />
        </View>
        <View style={styles.boton}>
          <Button title="Acceder" onPress={handleLogin} />
        </View>
        <View style={styles.boton}>
          <Button title="Regístrate Aquí" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  formulario: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '100%',
  },
  boton: {
    width: '100%',
    marginBottom: 12,
  },
});
