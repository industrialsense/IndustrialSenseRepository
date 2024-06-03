import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, Button, Alert, ScrollView, TouchableOpacity } from "react-native";
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
    <ScrollView>
      <View style={styles.page}>
        <View style={styles.container}>
          <Text>Registro</Text>
          <View style={styles.formulario}>
            <Text style={styles.label}>Correo Electrónico :</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@gmail.com"
              value={correo}
              onChangeText={setCorreo}
            />
            <Text style={styles.label}>Contraseña :</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
              />
              {isPasswordValid && <Text style={styles.checkMark}>✔️</Text>}
            </View>
            <Text style={styles.label}>Confirmar Contraseña :</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirma tu contraseña"
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
                secureTextEntry
              />
              {doPasswordsMatch && <Text style={styles.checkMark}>✔️</Text>}
            </View>
          </View>
          <View style={styles.boton}>
            <Button title="Registrar" onPress={handleRegister} />
          </View>
        </View>
        {/* Componente para mostrar los datos de la base de datos */}
        <View style={styles.container}>
          <Text>Datos de la Base de Datos</Text>
          {usuarios && usuarios.map(usuario => (
            <Text key={usuario.id}>{usuario.correo}</Text>
          ))}
        </View>
      </View>
      <View style={styles.boton}>
        <Button title="Eliminar Datos de Usuarios" onPress={handleDeleteData} />
      </View>
    </ScrollView>
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
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '85%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkMark: {
    marginLeft: 8,
    color: 'green',
    fontSize: 24,
  },
  boton: {
    marginTop: 16,
    width: '100%',
  },
});





