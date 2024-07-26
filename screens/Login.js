import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, ActivityIndicator, Text, Modal } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt';

export default function Login({ navigation }) {
  // Estados para controlar los campos de inicio de sesión y visibilidad de la contraseña
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad del modal
  const [recoveryEmail, setRecoveryEmail] = useState(''); // Estado para el correo electrónico de recuperación

  const handleLogin = async () => {
    if (correo === '' || contrasena === '') {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

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
      setLoading(false);
    }
  };

  const handlePasswordRecovery = () => {
    if (recoveryEmail === '') {
      Alert.alert("Error", "El campo de correo electrónico es obligatorio");
      return;
    }

    // Aquí iría la lógica para la recuperación de la contraseña.
    Alert.alert("Éxito", "Instrucciones para recuperar su contraseña han sido enviadas a su correo electrónico.");
    setModalVisible(false); // Cerrar el modal después de enviar las instrucciones
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
        {/* Botón "Olvidé mi contraseña" */}
        <Button mode="text" onPress={() => setModalVisible(true)} style={styles.botonOlvideContrasena} labelStyle={styles.botonOlvideContrasenaText}>
          Olvidé mi contraseña
        </Button>
      </View>
      {/* Modal para recuperación de contraseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Recuperar Contraseña</Text>
            <TextInput
              label="Correo Electrónico"
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF' } }}
            />
            <Button mode="contained" onPress={handlePasswordRecovery} style={styles.botonRecuperar} labelStyle={styles.botonRecuperarText}>
              Enviar
            </Button>
            <Button mode="text" onPress={() => setModalVisible(false)} style={styles.botonCancelar} labelStyle={styles.botonCancelarText}>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
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
  botonOlvideContrasena: { // Estilos para el botón "Olvidé mi contraseña"
    marginTop: 10,
  },
  botonOlvideContrasenaText: {
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
  modalContainer: { // Estilos para el contenedor del modal
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: { // Estilos para la vista del modal
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%', // Ancho del contenido modal
    maxWidth: 600, // Ancho máximo recomendado
  },
  modalText: { // Estilos para el texto del modal
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  botonRecuperar: { // Estilos para el botón de recuperar contraseña
    backgroundColor: '#007BFF',
    marginBottom: 10,
  },
  botonRecuperarText: {
    color: '#fff',
  },
  botonCancelar: { // Estilos para el botón de cancelar en el modal
    marginTop: 10,
  },
  botonCancelarText: {
    color: '#003366',
  },
});
