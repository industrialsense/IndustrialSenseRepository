import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { TextInput, Button, IconButton, Switch } from "react-native-paper";
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt';



export default function Register({ navigation }) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const complexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [db, setDb] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
     
    };
    openDatabaseAndFetch();
  }, []);

  

  useEffect(() => {
    setIsPasswordValid(complexPassword.test(contrasena));
    setDoPasswordsMatch(contrasena === confirmarContrasena && contrasena !== '');
  }, [contrasena, confirmarContrasena]);

 

  const handleRegister = async () => {
    if (nombre === '' || apellido === '' || correo === '' || contrasena === '' || confirmarContrasena === '') {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    if (nombre.length < 3) {
      Alert.alert("Error", "Favor de poner un nombre real");
      return;
    }
    if (apellido.length < 2) {
      Alert.alert("Error", "Favor de poner un apellido real");
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
      const usersCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM usuarios');
      if (usersCount.count > 0) {
        Alert.alert("Error", "Ya existe un usuario registrado");
        return;
      }
  
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(contrasena, salt);
      const rol = 'superadmin'; // Rol asignado automáticamente
  
      const result = await db.runAsync(
        'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, correo, hashedPassword, rol]
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
  
 

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        <Image source={require('../assets/Logo.png')} style={styles.logo} />
        <Text style={styles.title}>Registro</Text>
        <View style={styles.formulario}>
        <TextInput
            label="Nombre(s)"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
            outlineColor="#333333"
            activeOutlineColor="#007BFF"
          />
          <TextInput
            label="Apellido(s)"
            value={apellido}
            onChangeText={setApellido}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
            outlineColor="#333333"
            activeOutlineColor="#007BFF"
          />
          <TextInput
            label="Correo Electrónico"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
            outlineColor="#333333"
            activeOutlineColor="#007BFF"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              label="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
              outlineColor="#333333"
              activeOutlineColor="#007BFF"
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
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
              mode="outlined"
              theme={{ colors: { primary: '#007BFF', text: '#000', placeholder: '#757575', background: '#fff' } }}
              outlineColor="#333333"
              activeOutlineColor="#007BFF"
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
          <View style={styles.switchContainer}>
            <Text>Mostrar Contraseña</Text>
            <Switch
              value={showPassword}
              onValueChange={setShowPassword}
              color="#007BFF"
            />
          </View>
        </View>
        <Button mode="contained" onPress={handleRegister} style={styles.botonAcceder} labelStyle={styles.botonAccederText}>
          Registrar
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.botonRegistrarse} labelStyle={styles.botonRegistrarseText}>
          ¿Ya tienes una cuenta?
        </Button>
      </View>
      {/*Codigo de la base de datos para borrar */}
      <View>
        </View>
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
    padding: 20,
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
    borderRadius: 10,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  checkMark: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -30 }],
  },
  passwordInput: {
    paddingRight: 40,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  }
});
