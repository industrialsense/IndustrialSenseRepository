import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import * as SQLite from 'expo-sqlite';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './screens/Login';
import Register from './screens/Register';
import SuperAdminScreen from './screens/SuperAdmin';
import AdminScreen from './screens/Admin';
import UserScreen from './screens/User';


export default function App() {
  const [db, setDb] = useState(null);

  useEffect(() => {
    async function initializeDatabase() {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          correo TEXT NOT NULL,
          contrasena TEXT NOT NULL,
          rol TEXT NOT NULL
        );
      `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS maquinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            ip TEXT NOT NULL,
            puerto INTEGER NOT NULL,
            descripcion TEXT,
            velocidad REAL,
            imagen TEXT,
            estatus BOOLEAN,
            usuario_id INTEGER,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
          );
      `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS solicitudes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            mensaje TEXT,
            ip_asignada TEXT,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
          );
      `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS solicitudesAprobadas (
          id INTEGER PRIMARY KEY,
          usuario_id INTEGER,
          mensaje TEXT,
          ip_asignada TEXT,
          FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        );  
      `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS notificaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            mensaje TEXT NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          );
        `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS maquinasAsignadas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          maquina_id INTEGER NOT NULL,
          FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
          FOREIGN KEY(maquina_id) REFERENCES maquinas(id)
        );
      `);

      console.log("A lot of tables have been created successfully");
    }

    initializeDatabase().catch(error => {
      console.error("Error initializing database: ", error);
    });
  }, []);

  const Stack = createStackNavigator();
  function MyStack() {
    return (
      <Stack.Navigator>
        <Stack.Group 
          screenOptions={{ headerStyle: { backgroundColor: 'papayawhip' } }} >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="SuperAdmin" component={SuperAdminScreen} />
          <Stack.Screen name="Admin" component={AdminScreen}  />
          <Stack.Screen name="User" component={UserScreen} />
        </Stack.Group>
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}