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

      // Verificar si la tabla usuarios existe y tiene la columna 'rol'
      const tableInfo = await database.getAllAsync('PRAGMA table_info(usuarios)');
      const columns = tableInfo.map(column => column.name);

      if (!columns.includes('rol')) {
        // Si la tabla no tiene la columna 'rol', agregarla
        await database.execAsync('ALTER TABLE usuarios ADD COLUMN rol TEXT');
      }

      
      await database.execAsync(`
        
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          correo TEXT NOT NULL,
          contrasena TEXT NOT NULL,
          rol TEXT NOT NULL
        );
      `);

      console.log("Table created successfully");
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
          <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Base de Datos' }} />
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
