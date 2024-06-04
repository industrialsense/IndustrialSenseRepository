import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import * as SQLite from 'expo-sqlite';

export default function Register({ navigation }) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const complexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [db, setDb] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      await fetchUsuarios(database);
    };
    openDatabaseAndFetch();
  }, []);

  useEffect(() => {
    setIsPasswordValid(complexPassword.test(contrasena));
    setDoPasswordsMatch(contrasena === confirmarContrasena && contrasena !== '');
  }, [contrasena, confirmarContrasena]);

  const fetchUsuarios = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM usuarios');
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios: ", error);
    }
  };

  const handleRegister = async () => {
    if (correo === '' || contrasena === '' || confirmarContrasena === '') {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    if (!re.test(String(correo).toLowerCase())) {
      Alert.alert("Error", "El formato del correo electrónico no es válido");
      return;
    }
    if (contrasena.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (contrasena !== confirmarContrasena) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (!complexPassword.test(contrasena)) {
      Alert.alert("Error", "La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial");
      return;
    }
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }

    try {
      const existingUser = await db.getFirstAsync('SELECT * FROM usuarios WHERE correo = ?', [correo]);
      if (existingUser) {
        Alert.alert("Error", "El correo ya está registrado");
        return;
      }

      const result = await db.runAsync(
        'INSERT INTO usuarios (correo, contrasena) VALUES (?, ?)',
        [correo, contrasena]
      );

      if (result) {
        const usuarios = await db.getAllAsync('SELECT * FROM usuarios');
        setUsuarios(usuarios);
        Alert.alert("Éxito", "Usuario registrado correctamente");
        navigation.navigate('Login');
      } else {
        Alert.alert("Error", "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error al registrar usuario: ", error);
      Alert.alert("Error", "Error al registrar usuario");
    }
  };

  const handleDeleteData = async () => {
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }

    try {
      await db.runAsync('DELETE FROM usuarios');
      setUsuarios([]);
      Alert.alert("Éxito", "Datos de usuarios eliminados correctamente");
    } catch (error) {
      console.error("Error al eliminar datos de usuarios: ", error);
      Alert.alert("Error", "Error al eliminar datos de usuarios");
    }
  };

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <Image source={require('../assets/Logo.png')} style={styles.logo} />
        <Text style={styles.title}>Registro</Text>
        <View style={styles.formulario}>
          <TextInput
            label="Correo Electrónico"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
            outlineColor="#333333" // Borde gris oscuro
            activeOutlineColor="#007BFF" // Borde azul al estar activo
          />
          <View style={styles.passwordContainer}>
            <TextInput
              label="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
              style={[styles.input, styles.passwordInput]}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
              outlineColor="#333333" // Borde gris oscuro
              activeOutlineColor="#007BFF" // Borde azul al estar activo
            />
            {isPasswordValid && (
              <IconButton
                icon="check-circle"
                color="green"
                size={24}
                style={styles.checkMark}
              />
            )}
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              label="Confirmar Contraseña"
              value={confirmarContrasena}
              onChangeText={setConfirmarContrasena}
              secureTextEntry
              style={[styles.input, styles.passwordInput]}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
              outlineColor="#333333" // Borde gris oscuro
              activeOutlineColor="#007BFF" // Borde azul al estar activo
            />
            {doPasswordsMatch && (
              <IconButton
                icon="check-circle"
                color="green"
                size={24}
                style={styles.checkMark}
              />
            )}
          </View>
        </View>
        <Button mode="contained" onPress={handleRegister} style={styles.botonAcceder} labelStyle={styles.botonAccederText}>
          Registrar
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.botonRegistrarse} labelStyle={styles.botonRegistrarseText}>
          ¿Ya tienes una cuenta?
        </Button>
      </View>
      {/* Componente para mostrar los datos de la base de datos */}
      <View style={styles.container}>
        <Text>Datos de la Base de Datos</Text>
        {usuarios && usuarios.map(usuario => (
          <Text key={usuario.id}>{usuario.correo}</Text>
        ))}
      </View>
      <Button mode="text" onPress={handleDeleteData} style={styles.botonEliminar} labelStyle={styles.botonEliminarText}>
        Eliminar Datos de Usuarios
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingRight: 40, // Añade espacio para el ícono de verificación
  },
  checkMark: {
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
  botonEliminar: {
    marginTop: 16,
    width: '80%',
    alignSelf: 'center',
  },
  botonEliminarText: {
    color: '#FF0000',
  },
});
