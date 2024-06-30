import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Modal, Text, TextInput, TouchableOpacity } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, FAB } from 'react-native-paper';
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
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false); // Nuevo estado para modal de edición
  const [confirmationText, setConfirmationText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newUserCorreo, setNewUserCorreo] = useState('');
  const [newUserContrasena, setNewUserContrasena] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [editUserId, setEditUserId] = useState(null); // Nuevo estado para el ID del usuario a editar
  const [editUserCorreo, setEditUserCorreo] = useState(''); // Nuevo estado para el correo del usuario a editar
  const [editUserContrasena, setEditUserContrasena] = useState(''); // Nuevo estado para la contraseña del usuario a editar
  const [editUserRole, setEditUserRole] = useState(''); // Nuevo estado para el rol del usuario a editar

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
      const data = await database.getAllAsync('SELECT * FROM usuarios WHERE rol IN (?, ?)', ['usuario', 'admin']);
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
      const results = await db.getAllAsync('SELECT * FROM usuarios WHERE rol IN (?, ?) AND correo LIKE ?', ['usuario', 'admin', `%${query}%`]);
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
      <DataTable.Row key={usuario.id} style={styles.row}>
        <DataTable.Cell style={styles.cell}>{usuario.id}</DataTable.Cell>
        <DataTable.Cell style={styles.cell}>{usuario.correo}</DataTable.Cell>
        <DataTable.Cell style={styles.cell}>{usuario.rol}</DataTable.Cell>
        <DataTable.Cell style={styles.actionsCell}>
          <IconButton
            icon="pencil"
            color="blue"
            size={20}
            onPress={() => handleOpenEditModal(usuario)}
          />
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

  const handleOpenAddModal = () => {
    setModalAddVisible(true);
  };

  const handleCloseAddModal = () => {
    setModalAddVisible(false);
    setNewUserCorreo('');
    setNewUserContrasena('');
    setNewUserRole('');
  };

  const handleAddUser = async () => {
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newUserContrasena, salt);

      await db.runAsync(
        'INSERT INTO usuarios (correo, contrasena, rol) VALUES (?, ?, ?)',
        [newUserCorreo, hashedPassword, newUserRole]
      );

      Alert.alert("Éxito", "Usuario agregado correctamente");
      handleCloseAddModal();
      fetchUsuarios(db);
    } catch (error) {
      console.error("Error al agregar usuario: ", error);
      Alert.alert("Error", "Error al agregar usuario");
    }
  };

  const handleOpenEditModal = (usuario) => {
    setEditUserId(usuario.id);
    setEditUserCorreo(usuario.correo);
    setEditUserRole(usuario.rol);
    setModalEditVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditUserId(null);
    setEditUserCorreo('');
    setEditUserContrasena('');
    setEditUserRole('');
    setModalEditVisible(false);
  };

  const handleEditUser = async () => {
    if (!db || !editUserId) {
      Alert.alert("Error", "No se pudo abrir la base de datos o no se especificó el ID de usuario a editar");
      return;
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(editUserContrasena, salt);

      await db.runAsync(
        'UPDATE usuarios SET correo = ?, contrasena = ?, rol = ? WHERE id = ?',
        [editUserCorreo, hashedPassword, editUserRole, editUserId]
      );

      Alert.alert("Éxito", "Usuario editado correctamente");
      handleCloseEditModal();
      fetchUsuarios(db);
    } catch (error) {
      console.error("Error al editar usuario: ", error);
      Alert.alert("Error", "Error al editar usuario");
    }
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
        <DataTable style={styles.dataTable}>
          <DataTable.Header>
            <DataTable.Title>ID</DataTable.Title>
            <DataTable.Title>Correo</DataTable.Title>
            <DataTable.Title>Rol</DataTable.Title>
            <DataTable.Title>Acciones</DataTable.Title>
          </DataTable.Header>

          {searchQuery !== '' ? (
            searchResults.map((usuario) => (
              <DataTable.Row key={usuario.id} style={styles.row}>
                <DataTable.Cell style={styles.cell}>{usuario.id}</DataTable.Cell>
                <DataTable.Cell style={styles.cell}>{usuario.correo}</DataTable.Cell>
                <DataTable.Cell style={styles.cell}>{usuario.rol}</DataTable.Cell>
                <DataTable.Cell style={styles.actionsCell}>
                  <IconButton
                    icon="pencil"
                    color="blue"
                    size={20}
                    onPress={() => handleOpenEditModal(usuario)}
                  />
                  <IconButton
                    icon="delete"
                    color="red"
                    size={20}
                    onPress={() => handleDeleteUser(usuario.id)}
                  />
                </DataTable.Cell>
              </DataTable.Row>
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
            style={styles.pagination}
          />
        </DataTable>
        <Button mode="contained" onPress={handleDeleteData} style={styles.button}>
          Eliminar Base de Datos
        </Button>
      </ScrollView>

      {/* Modal para eliminar datos */}
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

      {/* Modal para agregar usuario */}
      <Modal
        visible={modalAddVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Agregar Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo"
              onChangeText={(text) => setNewUserCorreo(text)}
              value={newUserCorreo}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={true}
              onChangeText={(text) => setNewUserContrasena(text)}
              value={newUserContrasena}
            />
            <TextInput
              style={styles.input}
              placeholder="Rol"
              onChangeText={(text) => setNewUserRole(text)}
              value={newUserRole}
            />
            <Button mode="contained" onPress={handleAddUser} style={styles.button}>
              Agregar Usuario
            </Button>
            <TouchableOpacity
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress={handleCloseAddModal}
            >
              <Text style={styles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para editar usuario */}
      <Modal
        visible={modalEditVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Editar Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo"
              onChangeText={(text) => setEditUserCorreo(text)}
              value={editUserCorreo}
            />
            <TextInput
              style={styles.input}
              placeholder="Nueva Contraseña (opcional)"
              secureTextEntry={true}
              onChangeText={(text) => setEditUserContrasena(text)}
              value={editUserContrasena}
            />
            <TextInput
              style={styles.input}
              placeholder="Rol"
              onChangeText={(text) => setEditUserRole(text)}
              value={editUserRole}
            />
            <Button mode="contained" onPress={handleEditUser} style={styles.button}>
              Guardar Cambios
            </Button>
            <TouchableOpacity
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress={handleCloseEditModal}
            >
              <Text style={styles.textStyle}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Botón FAB para agregar usuario */}
      <FAB
        icon="plus"
        label="Agregar Usuario"
        style={styles.fab}
        onPress={handleOpenAddModal}
      />

      {/* Botón FAB para cerrar sesión */}
      <FAB
        icon="logout"
        label="Cerrar Sesión"
        style={styles.fabLogout}
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
    backgroundColor: '#e7cda7',
  },
  scrollView: {
    flex: 1,
  },
  dataTable: {
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fafafa',
  },
  row: {
    height: 50,
  },
  cell: {
    justifyContent: 'center',
  },
  actionsCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#9a5341',
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 20,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  fab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: '#ba835e',
  },
  fabLogout: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ba835e',
  },
});
