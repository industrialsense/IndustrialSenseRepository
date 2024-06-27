import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Modal, Text, TextInput, TouchableOpacity } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, Card, FAB } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt';

export default function AdminScreen({ navigation }) {
  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const [usuarios, setUsuarios] = useState([]);
  const [db, setDb] = useState(null);
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([9, 10, 15]);
  const [itemsPerPage, setItemsPerPage] = useState(numberOfItemsPerPageList[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      await createInitialUsers(database);
    };
    openDatabaseAndFetch();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  useEffect(() => {
    if (db) {
      fetchUsuarios(db);
    }
  }, [db]);

  const fetchUsuarios = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM usuarios WHERE rol = ?', ['usuario']);
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios: ", error);
    }
  };

  const createInitialUsers = async (database) => {
    const users = [
      { id: 1, correo: 'spadmsenseindustrial@gmail.com', contrasena: '1Q2w3e4r5T', rol: 'superadmin' },
      { id: 2, correo: 'admsenseindustrial@gmail.com', contrasena: '2W3e4r5t6Y', rol: 'admin' },
      { id: 3, correo: 'crissg030800@gmail.com', contrasena: '3E4r5t6y7U', rol: 'usuario' }
    ];

    for (const user of users) {
      try {
        const existingUser = await database.getFirstAsync('SELECT * FROM usuarios WHERE correo = ?', [user.correo]);
        if (existingUser) {
          continue;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(user.contrasena, salt);

        await database.runAsync(
          'INSERT INTO usuarios (id, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
          [user.id, user.correo, hashedPassword, user.rol]
        );
      } catch (error) {
        console.error("Error al crear usuario inicial: ", error);
      }
    }

    fetchUsuarios(database);
  };

  const handleDeleteData = async () => {
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }

    setModalVisible(true);
  };

  const confirmDeleteData = async () => {
    if (confirmationText === 'DELETE') {
      Alert.alert(
        "Confirmación",
        "Esta acción es irreversible. ¿Desea continuar?",
        [
          {
            text: "Cancelar",
            onPress: () => {
              setModalVisible(false); // Cerrar el modal si el usuario cancela
              setConfirmationText(''); // Limpiar el texto de confirmación
            },
            style: "cancel"
          },
          {
            text: "Confirmar",
            onPress: async () => {
              try {
                await db.runAsync('DELETE FROM usuarios');
                setUsuarios([]);
                Alert.alert("Éxito", "Datos de usuarios eliminados correctamente");
                setModalVisible(false);
                setConfirmationText('');
              } catch (error) {
                console.error("Error al eliminar datos de usuarios: ", error);
                Alert.alert("Error", "Error al eliminar datos de usuarios");
              }
            }
          }
        ]
      );
    } else {
      Alert.alert("Error", "Texto de confirmación incorrecto");
    }
  };
  

  const handleDeleteUser = async (id) => {
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }

    try {
      await db.runAsync('DELETE FROM usuarios WHERE id = ?', [id]);
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
      Alert.alert("Éxito", "Usuario eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar usuario: ", error);
      Alert.alert("Error", "Error al eliminar usuario");
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    try {
      const results = await db.getAllAsync('SELECT * FROM usuarios WHERE rol = ? AND correo LIKE ?', ['usuario', `%${query}%`]);
      setSearchResults(results);
    } catch (error) {
      console.error("Error al buscar usuarios: ", error);
      setSearchResults([]);
    }
  };

  const renderUsuarios = () => {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    return usuarios.slice(start, end).map((usuario) => (
      <DataTable.Row key={usuario.id}>
        <DataTable.Cell>{usuario.id}</DataTable.Cell>
        <DataTable.Cell>{usuario.correo}</DataTable.Cell>
        <DataTable.Cell>{usuario.rol}</DataTable.Cell>
        <DataTable.Cell>
          <IconButton
            icon="delete"
            color="red"
            size={20}
            onPress={() => handleDeleteUser(usuario.id)}
          />
        </DataTable.Cell>
      </DataTable.Row>
    ));
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <ScrollView style={styles.scrollView}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>ID</DataTable.Title>
            <DataTable.Title>Correo</DataTable.Title>
            <DataTable.Title>Rol</DataTable.Title>
            <DataTable.Title>Acciones</DataTable.Title>
          </DataTable.Header>

          {searchQuery !== '' ? (
            searchResults.map((usuario) => (
              <Card key={usuario.id} style={styles.card}>
                <Card.Content>
                  <Text>ID: {usuario.id}</Text>
                  <Text>Correo: {usuario.correo}</Text>
                  <Text>Rol: {usuario.rol}</Text>
                </Card.Content>
                <Card.Actions>
                  <IconButton
                    icon="delete"
                    color="red"
                    size={20}
                    onPress={() => handleDeleteUser(usuario.id)}
                  />
                </Card.Actions>
              </Card>
            ))
          ) : (
            renderUsuarios()
          )}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(usuarios.length / itemsPerPage)}
            onPageChange={(page) => setPage(page)}
            label={`${page + 1} de ${Math.ceil(usuarios.length / itemsPerPage)}`}
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
            selectPageDropdownLabel={'Filas por página'}
          />
        </DataTable>
        <Button mode="contained" onPress={handleDeleteData} style={styles.button}>
          Eliminar Base de Datos
        </Button>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Confirmar Eliminación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese 'DELETE' para confirmar"
              onChangeText={(text) => setConfirmationText(text)}
              value={confirmationText}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={confirmDeleteData}
              >
                <Text style={styles.textStyle}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FAB
        icon="logout"
        label="Cerrar Sesión"
        style={styles.fab}
        onPress={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  searchbar: {
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  button: {
    marginBottom: 10,
  },
  card: {
    marginVertical: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 5
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  }
});








