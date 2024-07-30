import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Text, TextInput, Image, FlatList } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, FAB, Checkbox, SegmentedButtons, Card, Title} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'react-native-bcrypt';

const HomeRoute = () => {
  const [db, setDb] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('usuarios');
  const [modalVisible, setModalVisible] = useState(false); // Estado del modal
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      await createInitialUsers(database);
    };
    openDatabaseAndFetch();
  }, []);

  useEffect(() => {
    if (db) {
      fetchUsuarios(db);
    }
  }, [db]);

  useEffect(() => {
    // Filtrar usuarios cuando cambia la búsqueda
    if (usuarios.length > 0 && searchQuery.length > 0) {
      const filtered = usuarios.filter(user =>
        user.correo.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(usuarios);
    }
  }, [searchQuery, usuarios]);

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

        await database.runAsync(
          'INSERT INTO usuarios (id, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
          [user.id, user.correo, user.contrasena, user.rol]
        );
      } catch (error) {
        console.error("Error al crear usuario inicial: ", error);
      }
    }

    fetchUsuarios(database);
  };

  const openModal = (segment) => {
    setSelectedSegment (segment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderUsuarios = () => (
    <View style={styles.cardsContainerVertical}>
      <TouchableOpacity style={styles.cardTouchable} onPress={() => openModal('admin')}>
        <Card style={styles.cardVertical}>
          <Card.Cover source={require('../assets/administrador.png')} />
          <Card.Content>
            <Title style={styles.cardTitle}>Administradores</Title>
          </Card.Content>
        </Card>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cardTouchable} onPress={() => openModal('usuario')}>
        <Card style={styles.cardVertical}>
          <Card.Cover source={require('../assets/usuario.jpg')} />
          <Card.Content>
            <Title style={styles.cardTitle}>Usuarios</Title>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </View>
  );

  const renderMaquinas = () => (
    <View style={styles.cardsContainerVertical}>
      <Card style={styles.cardHorizontal}>
        <Card.Cover source={require('../assets/maquinas.jpg')} />
        <Card.Content>
          <Title style={styles.cardTitle}>Máquinas</Title>
        </Card.Content>
      </Card>
    </View>
  );

  const renderModalContent = () => {
    let content;
    switch (selectedSegment) {
      case 'admin':
        content = renderTable('admin');
        break;
      case 'usuario':
        content = renderTable('usuario');
        break;
    }

    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuario..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {content}
          <TouchableOpacity onPress={closeModal}>
            <Text>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTable = (rol) => {
    const dataToShow = filteredUsers.filter(user => user.rol === rol);

    if (dataToShow.length === 0) {
      return (
        <View style={styles.modalContent}>
          <Text>No hay usuarios con este rol</Text>
        </View>
      );
    }
  
    return (
      <FlatList
        data={dataToShow}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.id}</Text>
            <Text style={styles.tableCell}>{item.correo}</Text>
            <View style={styles.tableCell}>
              <TouchableOpacity onPress={() => handleEditUser(item)}>
                <Icon name="pencil" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.tableCell}>
              <TouchableOpacity onPress={() => handleDeleteUser(item)}>
                <Icon name="delete" size={20} color="#FF0000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        // Paginación cada 5 registros
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    );
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalVisible(true);
  };

  const saveEditedUser = async () => {
    // Aquí puedes implementar la lógica para guardar los cambios en la base de datos
    console.log('Guardar cambios para:', editingUser);
    closeModal(); // Cierra el modal después de guardar
  };

  const handleRoleChange = (rol) => {
    setEditingUser(prevUser => ({ ...prevUser, rol }));
  };

  const handleDeleteUser = async (user) => {
    // Aquí puedes implementar la lógica para eliminar el usuario
    console.log('Eliminar usuario:', user);
    try {
      await db.runAsync('DELETE FROM usuarios WHERE id = ?', [user.id]);
      fetchUsuarios(db); // Actualizar la lista después de eliminar
      alert('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirmación",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel"
        },
        {
          text: "Cerrar sesión",
          onPress: () => {
            Alert.alert("Éxito", "Has cerrado sesión exitosamente.");
            navigation.navigate('Login');
          }
        }
      ]
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.topIconsContainer}>
        <Image
          source={require('../assets/avatar.jpg')}
          style={styles.avatarIcon}
        />
        <View style={styles.iconButtonsContainer}>
          <IconButton
            icon="bell"
            color="#000"
            size={30}
            onPress={() => console.log('Notificaciones')}
            style={styles.notificationIcon}
          />
          <IconButton
            icon="logout"
            color="#000"
            size={30}
            onPress={handleLogout} // Llamar a la función handleLogout
            style={styles.logoutIcon}
          />
        </View>
      </View>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'usuarios', label: 'Roles' },
          { value: 'maquinas', label: 'Dispositivos' },
        ]}
      />
      {selectedSegment === 'usuarios' ? renderUsuarios() : renderMaquinas()}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        {renderModalContent()}
      </Modal>
    </View>
  );
};

const AddUserRoute = () => {

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const complexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

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
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEditPasswordValid, setIsEditPasswordValid] = useState(false);
  const [editUserContrasena, setEditUserContrasena] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  useEffect(() => {
    const isValid = complexPassword.test(newUserContrasena);
    setIsPasswordValid(isValid);
    if (newUserContrasena.length >= 8) {
      setPasswordStrength(1);
    } else {
      setPasswordStrength(0);
    }
    if (/[A-Z]/.test(newUserContrasena)) {
      setPasswordStrength(prev => prev + 0.25);
    }
    if (/[a-z]/.test(newUserContrasena)) {
      setPasswordStrength(prev => prev + 0.25);
    }
    if (/\d/.test(newUserContrasena)) {
      setPasswordStrength(prev => prev + 0.25);
    }
    if (/[@$!%*?&.]/.test(newUserContrasena)) {
      setPasswordStrength(prev => prev + 0.25);
    }
    if (!isValid) {
      setSnackbarMessage("La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial y debe tener una longitud mínima de 8 caracteres");
      setSnackbarVisible(true);
    } else {
      setSnackbarVisible(false);
    }
  }, [newUserContrasena]);

  useEffect(() => {
    setIsEditPasswordValid(complexPassword.test(editUserContrasena));
  }, [editUserContrasena]);

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
    if (!newUserCorreo || !newUserContrasena || !editUserRole) {
        Alert.alert("Error", "Por favor, llene todos los campos");
        return;
    }

    try {
        // Verificar si el correo ya existe
        const existingUser = await db.getFirstAsync('SELECT * FROM usuarios WHERE correo = ?', [newUserCorreo]);
        if (existingUser) {
            Alert.alert("Error", "El correo ya está en uso con un rol asigando");
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newUserContrasena, salt);

        await db.runAsync(
            'INSERT INTO usuarios (correo, contrasena, rol) VALUES (?, ?, ?)',
            [newUserCorreo, hashedPassword, editUserRole]
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
    setEditUserContrasena('');//Cambio
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
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
  }
  if (!editUserCorreo || !editUserContrasena || !editUserRole) {
      Alert.alert("Error", "Por favor, llene todos los campos");
      return;
  }

  try {
      // Verificar si el correo ya existe y si su rol es diferente
      const existingUser = await db.getFirstAsync('SELECT * FROM usuarios WHERE correo = ? AND id != ?', [editUserCorreo, editUserId]);
      if (existingUser && existingUser.rol !== editUserRole) {
          Alert.alert("Error", "El correo ya está en uso con otro rol");
          return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(editUserContrasena, salt);

      await db.runAsync(
          'UPDATE usuarios SET correo = ?, contrasena = ?, rol = ? WHERE id = ?',
          [editUserCorreo, hashedPassword, editUserRole, editUserId]
      );

      Alert.alert("Éxito", "Usuario actualizado correctamente");
      handleCloseEditModal();
      fetchUsuarios(db);
  } catch (error) {
      console.error("Error al actualizar usuario: ", error);
      Alert.alert("Error", "Error al actualizar usuario");
  }
  };
  // Manejo de checkboxes en el modal de agregar usuario
const handleRoleChange = (role) => {
  setEditUserRole(role);
};


  const handleItemsPerPageChange = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setPage(0);
  };

  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  return (
    <View style={styles.containerT}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar Usuario"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
         <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={handleOpenAddModal}
      />
      </View>
      <ScrollView style={styles.containerT}>
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
          />{!isPasswordValid && (
            <Text style={styles.errorText}>
              La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial y debe tener una longitud minima de 8 caracteres 
            </Text>
          )}
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
          <Button mode="contained" onPress={handleAddUser} disabled={!isPasswordValid}>
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
          {!isEditPasswordValid && (
            <Text style={styles.errorText}>
              La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial y debe tener una longitud minima de 8 caracteres 
            </Text>
          )}
          <View style={styles.checkboxContainer}>
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

};

const MachinesRoute = () => (
  <View style={styles.routeContainer}>
    <Text>Machines Screen</Text>
  </View>
);

const SettingsRoute = () => {
  const settingsOptions = [
    { title: 'Privacidad', icon: 'shield-lock-outline' },
    { title: 'Políticas', icon: 'file-document-outline' },
    { title: 'Accesibilidad', icon: 'accessibility' },
    { title: 'Calificación', icon: 'star-outline' },
  ];

  return (
    <View style={styles.settingsContainer}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logo2.png')} // Asegúrate de tener el logo en la carpeta de assets
          style={styles.logo}
        />
      </View>
      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.optionContainer}>
            <IconButton
              icon={item.icon}
              size={30}
              color="#003366"
            />
            <Text style={styles.optionText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default function App() {
  const [selectedRoute, setSelectedRoute] = useState("home");

  const renderScene = () => {
    switch (selectedRoute) {
      case "home":
        return <HomeRoute />;
      case "addUser":
        return <AddUserRoute />;
      case "machines":
        return <MachinesRoute />;
      case "settings":
        return <SettingsRoute />;
      default:
        return <HomeRoute />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScene()}
      </View>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("home")}>
          <Icon name="home" size={30} color={selectedRoute === "home" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "home" ? styles.navTextSelected : styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("addUser")}>
          <Icon name="account-plus" size={30} color={selectedRoute === "addUser" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "addUser" ? styles.navTextSelected : styles.navText}>Usuarios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("machines")}>
          <Icon name="devices" size={30} color={selectedRoute === "machines" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "machines" ? styles.navTextSelected : styles.navText}>Máquinas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("settings")}>
          <Icon name="cog" size={30} color={selectedRoute === "settings" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "settings" ? styles.navTextSelected : styles.navText}>Configuración</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    justifyContent: 'center', // Alinear íconos y texto verticalmente
    alignItems: 'center',
  },
  navText: {
    textAlign: "center",
    color: "#000",
  },
  navTextSelected: {
    textAlign: "center",
    color: "#7E57C2",
  },
  routeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  avatarIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  notificationIcon: {
    marginLeft: 16,
  },
  logoutIcon: {
    marginLeft: 16,
  },
  segmentedButtons: {
    alignSelf: 'center',
    width: '90%',
    marginBottom: 30,
    marginVertical: 10,
  },
  cardsContainerVertical: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  cardVertical: {
    marginBottom: 33,
    width: '100%',
    height: 230,
  },
  cardHorizontal: {
    marginBottom: 20,
    width: '100%',
    height: 230,
  },
  cardTitle: {
    fontSize: 16, // Reducir el tamaño del título
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
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
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%', // Ocupa todo el ancho disponible
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconButtonsContainer: {
    flexDirection: 'row',
  },
  containerT: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
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
    marginRight: 100,
    height: 60, // Reducir la altura del Searchbar

  },
  row: {
    height: 50,
    width: 350,
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
    right: 20,
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

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'justify',
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 50,
    padding: 50,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 18,
    color: '#000',
    marginLeft: 10,
  },
});
