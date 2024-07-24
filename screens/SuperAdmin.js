import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { IconButton, SegmentedButtons, Card, Title, Text } from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';


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
    navigation.navigate('Login'); 
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

const AddUserRoute = () => (
  <View style={styles.routeContainer}>
    <Text>Add User Screen</Text>
  </View>
);

const MachinesRoute = () => (
  <View style={styles.routeContainer}>
    <Text>Machines Screen</Text>
  </View>
);

const SettingsRoute = () => (
  <View style={styles.routeContainer}>
    <Text>Settings Screen</Text>
  </View>
);

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
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
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
});
