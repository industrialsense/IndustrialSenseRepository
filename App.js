import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import * as SQLite from 'expo-sqlite';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './screens/Login';
import Home from './screens/Home';
import Register from './screens/Register';

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
          contrasena TEXT NOT NULL
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
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name='Register' component={Register}/>
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}