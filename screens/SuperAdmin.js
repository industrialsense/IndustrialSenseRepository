import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Modal, Text, TextInput } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, FAB, Checkbox } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import bcrypt from 'react-native-bcrypt';

export default function AdminScreen({ navigation }) {
  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const [usuarios, setUsuarios] = useState([]);
  const [db, setDb] = useState(null);
  const [page, setPage] = useState(0);
  const [numberOfItemsPerPageList] = useState([8, 10, 15]);
  const [itemsPerPage, setItemsPerPage] = useState(numberOfItemsPerPageList[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newUserCorreo, setNewUserCorreo] = useState('');
  const [newUserContrasena, setNewUserContrasena] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserCorreo, setEditUserCorreo] = useState('');
  const [editUserContrasena, setEditUserContrasena] = useState('');
  const [editUserRole, setEditUserRole] = useState('');

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

  const handleDeleteAllData = async () => {
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }

    setModalVisible(true);
  };

  const confirmDeleteAllData = async () => {
    if (confirmationText === 'DELETE') {
      Alert.alert(
        "Confirmación",
        "Esta acción eliminará todos los usuarios. ¿Desea continuar?",
        [
          {
            text: "Cancelar",
            onPress: () => {
              setModalVisible(false);
              setConfirmationText('');
            },
            style: "cancel"
          },
          {
            text: "Confirmar",
            onPress: async () => {
              try {
                await db.runAsync('DELETE FROM usuarios');
                setUsuarios([]);
                Alert.alert("Éxito", "Todos los usuarios han sido eliminados correctamente");
                setModalVisible(false);
                setConfirmationText('');
              } catch (error) {
                console.error("Error al eliminar todos los usuarios: ", error);
                Alert.alert("Error", "Error al eliminar todos los usuarios");
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

    const userToDelete = usuarios.find(usuario => usuario.id === id);

    Alert.alert(
      "Confirmación",
      `¿Está seguro que desea eliminar al usuario ${userToDelete.correo}?`,
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => confirmDeleteUser(id)
        }
      ]
    );
  };

  const confirmDeleteUser = async (id) => {
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
    setEditUserRole(''); // Restablece el rol
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
        [newUserCorreo, hashedPassword, editUserRole] // Usa editUserRole para asignar el rol
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
    setEditUserContrasena(usuario.password);
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
      Alert.alert("Error", "No se pudo abrir la base de datos o ID de usuario no válido");
      return;
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(editUserContrasena, salt);

      await db.runAsync(
        'UPDATE usuarios SET contrasena = ?, rol = ? WHERE id = ?',
        [hashedPassword, editUserRole, editUserId]
      );

      Alert.alert("Éxito", "Usuario editado correctamente");
      handleCloseEditModal();
      fetchUsuarios(db);
    } catch (error) {
      console.error("Error al editar usuario: ", error);
      Alert.alert("Error", "Error al editar usuario");
    }
  };
  // Manejo de checkboxes en el modal de agregar usuario
const handleRoleChange = (role) => {
  setEditUserRole(role);
};

  const handleLogoutButtonPress = () => {
    navigation.navigate('Login');
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setPage(0);
  };

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar Usuario"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <IconButton
          icon="logout"
          color="#ba835e"
          size={20}
          onPress={handleLogoutButtonPress}
          style={styles.logoutButton}
        />
         <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={handleOpenAddModal}
      />
      </View>
      <ScrollView style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>ID</DataTable.Title>
          <DataTable.Title>Correo</DataTable.Title>
          <DataTable.Title>Rol</DataTable.Title>
          <DataTable.Title>Acciones</DataTable.Title>
        </DataTable.Header>
        {renderUsuarios()}
      </DataTable>
      <View style={styles.paginationContainer}>
        <Button
          mode="contained"
          disabled={page === 0}
          onPress={() => setPage(page - 1)}
        >
          Anterior
        </Button>
        <Text> Página {page + 1} de {totalPages} </Text>
        <Button
          mode="contained"
          disabled={page === totalPages - 1}
          onPress={() => setPage(page + 1)}
        >
          Siguiente
        </Button>
      </View>
    </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAddVisible}
        onRequestClose={handleCloseAddModal}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Agregar Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={newUserCorreo}
            onChangeText={setNewUserCorreo}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry={true}
            value={newUserContrasena}
            onChangeText={setNewUserContrasena}
          />
          <View style={styles.checkboxContainer}>
            
          <Checkbox.Item
          label="Admin"
          status={editUserRole === 'admin' ? 'checked' : 'unchecked'}
          onPress={() => handleRoleChange('admin')}
          color="#008000"
        />
        <Checkbox.Item
          label="Usuario"
          status={editUserRole === 'usuario' ? 'checked' : 'unchecked'}
          onPress={() => handleRoleChange('usuario')}
          color="#008000"
          />
          </View>
          
          <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleAddUser} style={[styles.modalButton, { backgroundColor: '#FFA500' }]}>
              Agregar
            </Button>
            <Button mode="outlined" onPress={handleCloseAddModal} style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }}>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditVisible}
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Editar Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={editUserCorreo}
            onChangeText={setEditUserCorreo}
            editable={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Nueva Contraseña"
            secureTextEntry={true}
            value={editUserContrasena}
            onChangeText={setEditUserContrasena}
          />
          <View style={styles.checkboxContainer}>
            
            <Checkbox.Item
              label="Admin"
              status={editUserRole === 'admin' ? 'checked' : 'unchecked'}
              onPress={() => setEditUserRole('admin')}
              color="#008000"
            />
            <Checkbox.Item
              label="Usuario"
              status={editUserRole === 'usuario' ? 'checked' : 'unchecked'}
              onPress={() => setEditUserRole('usuario')}
              color="#008000"
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleEditUser} style={[styles.modalButton, { backgroundColor: '#FFA500' }]}>
              Guardar
            </Button>
            <Button mode="outlined" onPress={handleCloseEditModal} style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }}>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50, //Agregado
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
},

  searchBar: {
    flex: 1,
    marginRight: 110,
    height: 60, // Reducir la altura del Searchbar
 
  },
  logoutButton: {
    alignSelf: 'flex-start'
  },
  row: {
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  cell: {
    flex: 1,
  },
  actionsCell: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 0,
    right: 90,
    bottom: 0,
    backgroundColor: '#4B0082',
    
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    margin: 30,
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
    marginBottom: 18,
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 20,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 15
    
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    minWidth: 100,
  },
  
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  deleteAllButton: {
    marginRight: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
});


