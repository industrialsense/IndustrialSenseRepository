import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Text, TextInput, Image, FlatList, SafeAreaView } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, FAB, Checkbox, SegmentedButtons, Card, Title, Avatar} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import bcrypt from 'react-native-bcrypt';


const HomeRoute = () => {
  const [db, setDb] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('usuarios');
  const route = useRoute();
  const { userNombre, userID } = route.params;
  const [requests, setRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado del modal
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserNombre, setEditUserNombre] = useState('');
  const [editUserApellido, setEditUserApellido] = useState('');
  const [editUserCorreo, setEditUserCorreo] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEditPasswordValid, setIsEditPasswordValid] = useState(false);
  const [editUserContrasena, setEditUserContrasena] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newMachineIP, setNewMachineIP] = useState(''); // Nuevo estado para IP
  const [newMachinePuerto, setNewMachinePuerto] = useState(''); // Nuevo estado para Puerto
  const [editingMachine, setEditingMachine] = useState(null);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
  const [isEditMachineModalVisible, setIsEditMachineModalVisible] = useState(false);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [srequest, setSRequest] = useState([]);
  const [newMachineName, setNewMachineName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      
    };
    openDatabaseAndFetch();
  }, []);

  useEffect(() => {
    if (db) {
      fetchUsuarios(db);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      fetchMaquinas(db);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      fetchSolicitudes(db);
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

  useEffect(() => {
    // Filtrar máquinas cuando cambia la búsqueda
    if (maquinas.length > 0 && searchQuery.length > 0) {
      const filtered = maquinas.filter(machine =>
        machine.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMachines(filtered);
    } else {
      setFilteredMachines(maquinas);
    }
  }, [searchQuery, maquinas]);

  useEffect(() => {
    if (srequest && srequest.length > 0 && searchQuery.length > 0) {
      const filtered = srequest.filter(item =>
        item.usuario_id === parseInt(searchQuery) // Compara números directamente
      );
      setFilteredSolicitudes(filtered);
    } else {
      setFilteredSolicitudes(srequest);
    }
  }, [searchQuery, srequest]);

  const fetchRequests = async (database) => {
    try {
      const data = await database.getAllAsync(
        'SELECT solicitudes.id, solicitudes.mensaje, solicitudes.usuario_id, usuarios.nombre, usuarios.apellido, usuarios.correo FROM solicitudes JOIN usuarios ON solicitudes.usuario_id = usuarios.id'
      );
      setRequests(data);
    } catch (error) {
      console.error('Error al obtener solicitudes: ', error);
    }
  };

  const fetchUsuarios = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM usuarios WHERE rol IN (?, ?)', ['usuario', 'admin']);
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios: ", error);
    }
  };

  const fetchSolicitudes = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM solicitudes');
      setSRequest(data);
    } catch (error) {
      console.error("Error al obtener solicitudes: ", error);
    }
  };

  const fetchMaquinas = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM maquinas');
      setMaquinas(data);
    } catch (error) {
      console.error("Error al obtener maquinas: ", error);
    }
  };


  const openModal = (segment) => {
    setSelectedSegment (segment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderModalContent = () => {
    let content;
    switch (selectedSegment) {
      case 'usuario':
        content = renderTable('usuario');
        break;
      case 'edicion':
        content = renderEditUserModal('edicion');
        break;
      case 'edicionM':
        content = renderEditMachineModal('edicionM'); 
        break;
      case 'maquinaria':
        content = renderMaquinaria('maquinaria');
        break;
      case 'solicitudes':
        content = renderPetciones('solicitudes');
        break;
    }

    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuario, maquina o solicitudes de usuario."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {content}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
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
            <View style={styles.tableCell}>
            <Text style={styles.cellTitle}>ID:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.id}
              </Text>
            </View>
            <View style={styles.tableCell}>
            <Text style={styles.cellTitle}>Correo:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.correo}
              </Text>
            </View>
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
    setEditUserId(user.id);
    setEditUserNombre(user.nombre);
    setEditUserApellido(user.apellido);
    setEditUserCorreo(user.correo);
    setEditUserContrasena(''); // Deja la contraseña en blanco para ser cambiada
    setEditUserRole(user.rol);
    setIsEditUserModalVisible(true);
    openModal('edicion') // Abre el modal específico de edición de usuario
  };
  
  // Guarda los cambios en la base de datos y actualiza la lista de usuarios
  const saveEditedUser = async () => {
    if (!db) {
      Alert.alert("Error", "No se pudo abrir la base de datos");
      return;
    }
    if (!editUserCorreo || !editUserContrasena) {
      Alert.alert("Error", "Por favor, llene todos los campos");
      return;
    }
  
    try {
      // Verificar si el correo ya existe con otro rol
      const existingUser = await db.getFirstAsync(
        'SELECT * FROM usuarios WHERE correo = ? AND id != ?',
        [editUserCorreo, editUserId]
      );
      if (existingUser && existingUser.rol !== editUserRole) {
        Alert.alert("Error", "El correo ya está en uso con otro rol");
        return;
      }
  
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(editUserContrasena, salt);
  
      await db.runAsync(
        'UPDATE usuarios SET nombre =?, apellido =?, correo = ?, contrasena = ?  WHERE id = ?',
        [editUserNombre, editUserApellido, editUserCorreo, hashedPassword, editUserId]
      );
  
      Alert.alert("Éxito", "Usuario actualizado correctamente");
      setModalVisible(false)
      setIsEditUserModalVisible(false);  // Cierra el modal de edición de usuario
      fetchUsuarios(db);  // Refresca la lista de usuarios
    } catch (error) {
      console.error("Error al actualizar usuario: ", error);
      Alert.alert("Error", "Error al actualizar usuario");
    }
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

  {/*Cambiar estilo aqui*/}
  const renderEditUserModal = () => (
    <Modal visible={isEditUserModalVisible} onRequestClose={() => setIsEditUserModalVisible(false)}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Editar Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre(s)"
          value={editUserNombre}
          onChangeText={setEditUserNombre}
          editable={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido(s)"
          value={editUserApellido}
          onChangeText={setEditUserApellido}
          editable={true}
        />
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
          value={editUserContrasena}
          secureTextEntry
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
            <Button mode="contained" onPress={saveEditedUser}style={[styles.modalButton, { backgroundColor: '#FFA500' }]}>
              Guardar
            </Button>
            <Button mode="outlined" onPress={() => setIsEditUserModalVisible(false) || setModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }}>
              Cancelar
            </Button>
          </View>
          </View>
        </Modal>
  );


  const renderPetciones = () => {
    const dataToShow = filteredSolicitudes;

    if (dataToShow.length === 0) {
      return (
        <View style={styles.modalContent}>
          <Text>No hay solicitudes disponibles</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={dataToShow}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>Solicitud:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
              {item.id}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>ID Usuario:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
              {item.usuario_id}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>Mensaje:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
              {item.mensaje}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <TouchableOpacity onPress={() => handleRechazarSolicitud(item)}>
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

  const handleRechazarSolicitud = async (solicitud) => {
    if (!db) {
      Alert.alert('Error', 'La base de datos no está inicializada.');
      return;
    }
  
    if (solicitud) {
      try {
        // Eliminar la solicitud de la base de datos
        await db.runAsync(
          'DELETE FROM solicitudes WHERE id = ?',
          [solicitud.id]
        );
  
        // Enviar una notificación al usuario indicando que no se le pudo asignar una máquina
        await db.runAsync(
          'INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)',
          [solicitud.usuario_id, 'No te pudimos asignar ninguna máquina.']
        );
  
        Alert.alert('Solicitud rechazada', 'La solicitud ha sido rechazada y el usuario ha sido notificado.');
        
        // Refrescar la lista de solicitudes después de la eliminación
        fetchRequests(db);
      } catch (error) {
        console.error('Error al rechazar la solicitud', error);
        Alert.alert('Error', 'Ocurrió un error al rechazar la solicitud.');
      }
    } else {
      Alert.alert('Error', 'No se ha seleccionado ninguna solicitud para rechazar.');
    }
  };

  const renderMaquinaria = () => {
    const dataToShow = filteredMachines;
  
    if (dataToShow.length === 0) {
      return (
        <View style={styles.modalContent}>
          <Text>No hay máquinas disponibles</Text>
        </View>
      );
    }
  
    return (
      <FlatList
        data={dataToShow}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>ID:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.id}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>Nombre:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.nombre}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>IP:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.ip}
              </Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.cellTitle}>Puerto:</Text>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {item.puerto}
              </Text>
            </View>
            <View style={styles.tableCell}>
            <TouchableOpacity onPress={() => handleEditMachine(item)}>
                <Icon name="pencil" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.tableCell}>
              <TouchableOpacity onPress={() => handleDeleteMachine(item)}>
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


  const handleEditMachine = (machine) => {
    setEditingMachine(machine);
    setNewMachineName(machine.nombre);
    setNewMachineIP(machine.ip);
    setNewMachinePuerto(machine.puerto);
    setIsEditMachineModalVisible(true);
    openModal('edicionM'); // Asegúrate de que este nombre sea el correcto para el modal
};

// Guarda los cambios en la base de datos y actualiza la lista de máquinas
const saveEditedMachine = async () => {
    if (!db) {
        Alert.alert("Error", "No se pudo abrir la base de datos");
        return;
    }
    if (!newMachineName || !newMachineIP || !newMachinePuerto) {
        Alert.alert("Error", "Por favor, llene todos los campos");
        return;
    }

    try {
        await db.runAsync(
            'UPDATE maquinas SET nombre = ?, ip = ?, puerto = ? WHERE id = ?',
            [newMachineName, newMachineIP, newMachinePuerto, editingMachine.id]
        );
        
        const updatedMachines = maquinas.map(machine =>
            machine.id === editingMachine.id
                ? { ...machine, nombre: newMachineName, ip: newMachineIP, puerto: newMachinePuerto }
                : machine
        );
        
        setMaquinas(updatedMachines);
        setFilteredMachines(updatedMachines);
        setEditingMachine(null);
        setNewMachineName('');
        setNewMachineIP('');
        setNewMachinePuerto('');
        setIsEditMachineModalVisible(false);
        setModalVisible(false)
        Alert.alert("Éxito", "Maquina actualizada con exito");
        fetchMaquinas(db);
    } catch (error) {
        console.error("Error al actualizar la máquina: ", error);
        Alert.alert("Error", "Error al actualizar la máquina");
    }
};

  const handleDeleteMachine = async (machine) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar esta máquina?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM maquinas WHERE id = ?', [machine.id]);
              const updatedMachines = maquinas.filter(m => m.id !== machine.id);
              setMaquinas(updatedMachines);
              setFilteredMachines(updatedMachines);
            } catch (error) {
              console.error("Error al eliminar la máquina: ", error);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  {/*Cambiar estilo aqui*/}
  const renderEditMachineModal = () => (
    <Modal visible={isEditMachineModalVisible} onRequestClose={() => setIsEditMachineModalVisible(false)}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>Editar Máquina</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={newMachineName}
          onChangeText={setNewMachineName}
        />
        <TextInput
          style={styles.input}
          placeholder="IP"
          value={newMachineIP}
          onChangeText={setNewMachineIP}
        />
        <TextInput
          style={styles.input}
          placeholder="Nuevo Puerto"
          value={newMachinePuerto}
          onChangeText={setNewMachinePuerto}
        />
        <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={saveEditedMachine}style={[styles.modalButton, { backgroundColor: '#FFA500' }]}>
          Guardar
        </Button>
        <Button mode="outlined" onPress={() => setIsEditMachineModalVisible(false) || setModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }}>
          Cancelar
        </Button>
      </View>
      </View>
    </Modal>
  );

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
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Bienvenido: {userNombre} </Text>
        <Text style={styles.greetingDescription}>Aquí puedes gestionar tus usuarios asi como las máquinas.</Text>
      </View>
      <ScrollView>
            <View style={styles.cardsContainerVertical}>
            <TouchableOpacity style={styles.cardTouchable} onPress={() => openModal('usuario')}>
              <Card style={styles.cardVertical}>
                <Card.Cover source={require('../assets/usuario.jpg')} />
                <Card.Content>
                  <Title style={styles.cardTitle}>Usuarios</Title>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </View> 
      <View style={styles.cardsContainerVertical}>
            <TouchableOpacity style={styles.cardTouchable} onPress={() => openModal('maquinaria')}>
              <Card style={styles.cardVertical}>
                <Card.Cover source={require('../assets/maquinas.jpg')} />
                <Card.Content>
                  <Title style={styles.cardTitle}>Máquinas</Title>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </View>
      <View style={styles.cardsContainerVertical}>
            <TouchableOpacity style={styles.cardTouchable} onPress={() => openModal('solicitudes')}>
              <Card style={styles.cardVertical}>
                <Card.Cover source={require('../assets/peticiones.jpg')} />
                <Card.Content>
                  <Title style={styles.cardTitle}>Solicitudes</Title>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </View>
      </ScrollView>
       
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
  const [newUserNombre, setNewUserNombre] = useState('');
  const [newUserApellido, setNewUserApellido] = useState('');
  const [newUserCorreo, setNewUserCorreo] = useState('');
  const [newUserContrasena, setNewUserContrasena] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserNombre, setEditUserNombre] = useState('');
  const [editUserApellido, setEditUserApellido] = useState('');
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
      const data = await database.getAllAsync('SELECT * FROM usuarios WHERE rol IN (?, ?)', ['usuario']);
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios: ", error);
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
      const userResults = await db.getAllAsync('SELECT * FROM usuarios WHERE rol IN (?, ?) AND correo LIKE ?', ['usuario', 'admin', `%${query}%`]);
      const machineResults = await db.getAllAsync('SELECT * FROM maquinas WHERE nombre LIKE ?', [`%${query}%`]);
      setFilteredUsers(userResults);
      setFilteredMachines(machineResults);
    } catch (error) {
      console.error("Error al buscar usuarios o máquinas: ", error);
      setFilteredUsers([]);
      setFilteredMachines([]);
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
    setNewUserNombre('');
    setNewUserApellido('');
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
            'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)',
            [newUserNombre, newUserApellido, newUserCorreo, hashedPassword, editUserRole]
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
    setEditUserNombre(usuario.nombre);
    setEditUserApellido(usuario.apellido);
    setEditUserCorreo(usuario.correo);
    setEditUserContrasena('');//Cambio
    setEditUserRole(usuario.rol);
    setModalEditVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditUserId(null);
    setEditUserNombre('');
    setEditUserApellido('');
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
  if (!editUserCorreo ||  !editUserRole) {
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
          'UPDATE usuarios SET nombre =?, apellido = ?, correo = ?, contrasena = ?, rol = ? WHERE id = ?',
          [editUserNombre, editUserApellido, editUserCorreo, hashedPassword, editUserRole, editUserId]
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
            placeholder="Nombre(s)"
            value={newUserNombre}
            onChangeText={setNewUserNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido(s)"
            value={newUserApellido}
            onChangeText={setNewUserApellido}
          />
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
          label="Rol: Usuario"
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
            placeholder="Nombre(s)"
            value={editUserNombre}
            onChangeText={setEditUserNombre}
            editable={true}
          />
          <TextInput
            style={styles.input}
            placeholder="Apellido(s)"
            value={editUserApellido}
            onChangeText={setEditUserApellido}
            editable={true}
          />
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

const MachinesRoute = () => {
  const [db, setDb] = useState(null);
  const [maquinas, setMaquinas] = useState([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [nombreDeLaMaquina, setNombreDeLaMaquina] = useState('');
  const [ip, setIp] = useState('');
  const [puerto, setPuerto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      await fetchMaquinas(database);
      await updateDeviceCount(database);
    };
    openDatabaseAndFetch();
  }, []);

  const fetchMaquinas = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM maquinas');
      setMaquinas(data);
    } catch (error) {
      console.error("Error al obtener maquinas: ", error);
    }
  };

  const updateDeviceCount = async (database) => {
    try {
      const result = await database.getFirstAsync('SELECT COUNT(*) AS count FROM maquinas');
      setDeviceCount(result.count);
    } catch (error) {
      console.error("Error al contar dispositivos: ", error);
    }
  };

  const getImage = (imageId) => {
    switch (imageId) {
      case 1:
        return require('../assets/device1.jpg');
      case 2:
        return require('../assets/device2.jpg');
      default:
        return require('../assets/Logo.png'); // Imagen por defecto
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const validateIp = (ip) => {
    const regex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!regex.test(ip)) {
      return false;
    }
    const parts = ip.split('.').map(Number);
    return parts.length === 4 && parts.every(part => part >= 0 && part <= 255);
  };

  const validatePort = (puerto) => {
    const portNumber = parseInt(puerto, 10);
    if (isNaN(portNumber) || portNumber < 0 || portNumber > 65535) {
      return false;
    }
    if (portNumber >= 0 && portNumber <= 1023) {
      Alert.alert('Advertencia', 'El puerto ingresado está en el rango de puertos bien conocidos (0-1023) y puede estar reservado para servicios estándar.');
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateIp(ip)) {
      Alert.alert('Error', 'La dirección IP no es válida. Debe estar en el formato correcto y cada octeto no debe ser mayor a 255.');
      return;
    }

    if (!validatePort(puerto)) {
      Alert.alert('Error', 'El puerto no es válido. Debe estar en el rango de 0 a 65535.');
      return;
    }

    if (db) {
      try {
        await db.runAsync(
          'INSERT INTO maquinas (nombre, ip, puerto, descripcion, imagen) VALUES (?, ?, ?, ?, ?)',
          [nombreDeLaMaquina, ip, puerto, descripcion, imagen]
        );
        await fetchMaquinas(db);
        await updateDeviceCount(db);
        closeModal();
        setNombreDeLaMaquina('');
        setIp('');
        setPuerto('');
        setDescripcion('');
        setImagen('');
      } catch (error) {
        console.error("Error al agregar la máquina: ", error);
      }
    }
  };

  const selectImage = (imageId) => {
    setImagen(imageId);
  };

  const renderModalContent = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Agregar Dispositivo</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la Máquina"
              value={nombreDeLaMaquina}
              onChangeText={setNombreDeLaMaquina}
            />
            <TextInput
              style={styles.input}
              placeholder="IP"
              value={ip}
              onChangeText={setIp}
            />
            <TextInput
              style={styles.input}
              placeholder="Puerto"
              value={puerto}
              onChangeText={setPuerto}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <Text style={styles.inputLabel}>Selecciona una imagen:</Text>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={() => selectImage(1)}>
                <Image source={require('../assets/device1.jpg')} style={styles.imageItem} />
                {imagen === 1 && <Text style={styles.selectedText}>Seleccionado</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectImage(2)}>
                <Image source={require('../assets/device2.jpg')} style={styles.imageItem} />
                {imagen === 2 && <Text style={styles.selectedText}>Seleccionado</Text>}
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <Button mode= 'contained' onPress={handleAdd} style={[styles.modalButton, { backgroundColor: '#FFA500' }]}>
                Agregar
              </Button>
              <Button mode= 'outlined' onPress={closeModal}style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }}>
              Cerrar
              </Button>
            </View>
          </View>
        </View>
    </Modal>
  );

  const lastMachine = maquinas[maquinas.length - 1];

  return (
    <View style={styles.containerpuls}>
      <View style={styles.topSection}>
        <Text style={styles.pixelArtText}>Dispositivos agregados: {deviceCount}</Text>
      </View>
      <Text style={styles.subHeaderText}>Último Dispositivo Agregado:</Text>
      {lastMachine && (
        <View style={styles.cardYu}>
          <View style={styles.imageContainer}>
            <Avatar.Image source={getImage(parseInt(lastMachine.imagen))} size={100} style={styles.avatar} />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.machineDescription}> ID: {lastMachine.id}</Text>
            <Text style={styles.machineDescription}> Nombre: {lastMachine.nombre}</Text>
            <Text style={styles.machineDescription}> IP: {lastMachine.ip}</Text>
            <Text style={styles.machineDescription}> Descripción: {lastMachine.descripcion}</Text>
        </View>
        </View>
      )}
      <FAB
        style={styles.fabUpload}
        icon="upload"
        color="white"
        onPress={openModal}
      />
      {renderModalContent()}
    </View>
  );
};

const RequestRoute = () => {
  const [requests, setRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]); // Para almacenar solicitudes aprobadas
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [selectedMachineIP, setSelectedMachineIP] = useState('');
  const [db, setDb] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('solicitudes'); // Para manejar la segmentación

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      fetchRequests(database);
      fetchAvailableMachines(database);
      fetchApprovedRequests(database); // Llamar a la función para obtener las solicitudes aprobadas
    };
    openDatabaseAndFetch();
  }, []);

  const fetchRequests = async (database) => {
    try {
      const data = await database.getAllAsync(
        'SELECT solicitudes.id, solicitudes.mensaje, solicitudes.usuario_id, usuarios.nombre, usuarios.apellido, usuarios.correo FROM solicitudes JOIN usuarios ON solicitudes.usuario_id = usuarios.id'
      );
      setRequests(data);
    } catch (error) {
      console.error('Error al obtener solicitudes: ', error);
    }
  };

  const fetchAvailableMachines = async (database) => {
    try {
      const data = await database.getAllAsync(
        'SELECT * FROM maquinas WHERE usuario_id IS NULL'
      );
      setAvailableMachines(data);
    } catch (error) {
      console.error('Error al obtener máquinas disponibles: ', error);
    }
  };

  const fetchApprovedRequests = async (database) => {
    try {
      const data = await database.getAllAsync(
        'SELECT solicitudesAprobadas.id, solicitudesAprobadas.mensaje, solicitudesAprobadas.usuario_id, solicitudesAprobadas.ip_asignada, usuarios.nombre, usuarios.apellido, usuarios.correo FROM solicitudesAprobadas JOIN usuarios ON solicitudesAprobadas.usuario_id = usuarios.id'
      );
      setApprovedRequests(data);
    } catch (error) {
      console.error('Error al obtener solicitudes aprobadas: ', error);
    }
  };

  const handleSendIP = async () => {
    if (!db) {
      Alert.alert('Error', 'La base de datos no está inicializada.');
      return;
    }
  
    if (selectedRequest && selectedMachineIP) {
      try {
        const machine = await db.getFirstAsync(
          'SELECT * FROM maquinas WHERE ip = ? AND usuario_id IS NULL',
          [selectedMachineIP]
        );
        if (machine) {
          await db.runAsync(
            'UPDATE maquinas SET usuario_id = ? WHERE id = ?',
            [selectedRequest.usuario_id, machine.id]
          );
  
          await db.runAsync(
            `INSERT INTO solicitudesAprobadas (id, usuario_id, mensaje, ip_asignada)
             VALUES (?, ?, ?, ?)`,
            [selectedRequest.id, selectedRequest.usuario_id, selectedRequest.mensaje, selectedMachineIP]
          );
  
          await db.runAsync(
            'DELETE FROM solicitudes WHERE id = ?',
            [selectedRequest.id]
          );
  
          await db.runAsync(
            'INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)',
            [selectedRequest.usuario_id, `La IP ${selectedMachineIP} ha sido asignada a tu solicitud.`]
          );
          
          Alert.alert('IP enviada', `La IP ${selectedMachineIP} ha sido enviada.`);
          setSelectedRequest(null);
          setSelectedMachineIP('');
          fetchRequests(db);
          fetchAvailableMachines(db);
          fetchApprovedRequests(db); // Actualizar la lista de solicitudes aprobadas
        } else {
          Alert.alert('Error', 'La IP ya está asignada o no existe.');
        }
      } catch (error) {
        console.error('Error al manejar la solicitud de IP', error);
        Alert.alert('Error', 'Ocurrió un error al manejar la solicitud de IP.');
      }
    } else {
      Alert.alert('Error', 'Debe seleccionar una solicitud y una máquina.');
    }
  };

  return (
    <View style={styles.containerRequest}>
      <SegmentedButtons
        style={styles.segmentedButtons}
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { value: 'solicitudes', label: 'Pendientes' },
          { value: 'aprobadas', label: 'Aprobadas' },
        ]}
      />
      {selectedSegment === 'solicitudes' ? (
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.textRequest}>Solicitudes de Máquinas: </Text>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.textContainerRequest}>
                <Text style={styles.textRequest}>Nombre: {item.nombre}</Text>
                <Text style={styles.textRequest}>Apellidos: {item.apellido}</Text>
                <Text style={styles.textRequest}>Correo: {item.correo}</Text>
                <Text style={styles.textRequest}>Solicitud: {item.mensaje}</Text>
                <Button
                  mode="contained"
                  onPress={() => setSelectedRequest(item)}
                  style={styles.buttonRequest}
                >
                  <Text style={styles.buttonTextRequest}>Asignar IP</Text>
                </Button>
              </View>
            )}
          />
          {selectedRequest && (
            <View style={styles.textContainerRequest}>
              <Text style={styles.textRequest}>Asignar IP a solicitud N° {selectedRequest.id}</Text>
              <Picker
                selectedValue={selectedMachineIP}
                onValueChange={(itemValue) => setSelectedMachineIP(itemValue)}
                style={styles.pickerRequest}
              >
                <Picker.Item label="Selecciona una máquina" value="" />
                {availableMachines.map((machine) => (
                  <Picker.Item key={machine.id} label={`IP: ${machine.ip} - ${machine.nombre}`} value={machine.ip} />
                ))}
              </Picker>
              <Button
                mode="contained"
                onPress={handleSendIP}
                style={styles.buttonRequest}
              >
                <Text style={styles.buttonTextRequest}>Enviar IP</Text>
              </Button>
            </View>
          )}
        </SafeAreaView>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.textRequest}>Solicitudes Aprobadas: </Text>
          <FlatList
            data={approvedRequests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.approvedRequestItem}>
                <Text style={styles.textRequest}>Número de Solicitud: {item.id}</Text>
                <Text style={styles.textRequest}>Nombre: {item.nombre}</Text>
                <Text style={styles.textRequest}>Apellidos: {item.apellido}</Text>
                <Text style={styles.textRequest}>Mensaje: {item.mensaje}</Text>
                <Text style={styles.textRequest}>IP Asignada: {item.ip_asignada}</Text>
              </View>
            )}
          />
        </SafeAreaView>
      )}
    </View>
  );
};

const SettingsRoute = () => {

  const [db, setDb] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
      
    };
    openDatabaseAndFetch();
  }, []);

  useEffect(() => {
    if (db) {
      fetchUsuarios(db);
    }
  }, [db]);

  const fetchUsuarios = async (database) => {
    try {
      const data = await database.getAllAsync('SELECT * FROM usuarios WHERE rol IN (?)', ['admin']);
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios: ", error);
    }
  };

  const settingsOptions = [
    { title: 'Mi perfil', icon: 'human' },
    { title: 'Privacidad', icon: 'shield-lock-outline' },
    { title: 'Políticas', icon: 'file-document-outline' },
    { title: 'Calificación', icon: 'star-outline' },
  ];

  const handlePress = (option) => {
    setSelectedOption(option);
    setModalVisible(true);
  };

  const renderModalContent = () => {
    switch (selectedOption) {
      case 'Mi perfil':
        return (
          <View>
            <Text style={styles.modalTitleSettingsRoute}>Mi Perfil</Text>
            {usuarios.length > 0 ? (
              <>
                <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Nombre:</Text>
                <Text style={styles.profileValue}>{usuarios[0].nombre}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Apellido:</Text>
                <Text style={styles.profileValue}>{usuarios[0].apellido}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Correo:</Text>
                <Text style={styles.profileValue}>{usuarios[0].correo}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Rol:</Text>
                <Text style={styles.profileValue}>{usuarios[0].rol}</Text>
              </View>
                <View style={styles.buttonContainerSettings}>
                <Button mode="outlined" style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }} onPress={() => setModalVisible(false)}> Cerrar </Button>
                </View>
              </>
            ) : (
              <Text>Cargando...</Text>
              
            )}
          </View>
        );
      case 'Privacidad':
        return (
          <View>
            <Text style={styles.modalTitleSettingsRoute}>Privacidad</Text>
            <Text style={styles.modalText}>
              Tu privacidad es importante para nosotros. Nos comprometemos a proteger tu información personal y garantizar que sea utilizada de manera segura.
            </Text>
            <View style={styles.buttonContainer}>
            <Button mode="contained" style={[styles.modalButton, { backgroundColor: '#FFA500' }]} labelStyle={{ color: 'white' }} onPress={() => setModalVisible(false)}> Aceptar </Button>
            <Button mode="outlined" style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }} onPress={() => setModalVisible(false)}> Cerrar </Button>
            </View>
          </View>
        );
      case 'Políticas':
        return (
          <View>
            <Text style={styles.modalTitleSettingsRoute}>Políticas</Text>
            <Text style={styles.modalText}>
              Nuestras políticas están diseñadas para proporcionar un entorno seguro y confiable para todos los usuarios. Cumplimos con todas las regulaciones aplicables y nos esforzamos por mantener la transparencia en nuestras operaciones.
            </Text>
            <View style={styles.buttonContainer}>
            <Button mode="contained" style={[styles.modalButton, { backgroundColor: '#FFA500' }]} labelStyle={{ color: 'white' }} onPress={() => setModalVisible(false)}> Aceptar </Button>
            <Button mode="outlined" style={[styles.modalButton, { backgroundColor: '#8B0000' }]} labelStyle={{ color: 'white' }} onPress={() => setModalVisible(false)}> Cerrar </Button>
            </View>
          </View>
        );
      default:
        return null;
    }
  };
  
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
          <TouchableOpacity style={styles.optionContainerSettingsRoute} onPress={() => handlePress(item.title)}>
            <IconButton
              icon={item.icon}
              size={30}
              color="#003366"
            />
            <Text style={styles.optionTextSettingsRoute}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainerSettingsRoute}>
          <View style={styles.modalContentSettingsRoute}>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
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
      case "request":
        return <RequestRoute />
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
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("request")}>
          <Icon name="file" size={30} color={selectedRoute === "request" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "request" ? styles.navTextSelected : styles.navText}>Peticiones</Text>
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
  buttonModal: {
    marginTop: 20,
    marginBottom: 20,
  },
  buttonModalClose: {
    marginBottom: 20,
  },
  containerRequest: {
    flex: 1,
    backgroundColor: 'white', // Fondo oscuro para un look moderno
    padding: 20,
  },
  segmentedButtons: {
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 20,
  },
  textContainerRequest: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'papayawhip',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  textRequest: {
    fontSize: 16,
    color: 'black', // Texto en blanco para buen contraste
    marginBottom: 5,
    padding: 3,
  },
  buttonRequest: {
    backgroundColor: '#A891D2', 
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
    left: 50,
  },
  buttonTextRequest: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  pickerRequest: {
    backgroundColor: 'papayawhip',
    color: 'black',
  },
  approvedRequestItem: {
    backgroundColor: 'papayawhip', // Un gris oscuro para distinguir de los no aprobados
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    backgroundColor: '#FF6F61', // Puedes ajustar el color si lo deseas
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20, // Añadido para el padding vertical
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20, // Ajusta este valor según cuánto espacio quieras entre el contenido y el botón
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
  greetingContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 45,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  greetingDescription: {
    fontSize: 14,
    color: '#555',
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
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    marginBottom: 10,
  },
  containerpuls: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pixelArtText: {
    fontSize: 17,
    color: 'black',
    backgroundColor: '#CEBAF2',
    borderRadius: 20,
    padding: 15,
    marginBottom: 40,
    right: 50,
    top: 10,
    paddingHorizontal: 40,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    left: 15,
  },
  cardYu: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 50,
  },
  infoContainer: {
    flex: 1,
    padding: 15,
  },
  machineDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  uploadButtonContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  uploadButton: {
    position: 'absolute',
    margin: 0,
    right: 5,
    bottom: 0,
    backgroundColor: '#4B0082',
    borderRadius: 25,
  },
  cardVertical: {
    marginBottom: 33,
    width: '100%',
    height: 230,
  },
  cardHorizontal: {
    marginBottom: 20,
    width: '100%',
    height: 200,
  },
  cardTitle: {
    fontSize: 16, // Reducir el tamaño del título
    marginBottom: 8,
  },
  cellTitle: {
    flex: 1,
    fontWeight: 'bold',
    marginHorizontal: -20,
    paddingHorizontal: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  //Agregar un estilo para los modales diferente a este:
  modalContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
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
    paddingVertical: 20,
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
    paddingHorizontal: 20,
    paddingTop: 15,
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
  fabUpload: {
    position: 'absolute',
    margin: 0,
    right: 25,
    top: 30,
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
  inputModal: {
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
    paddingHorizontal: 10, // Añadido para el padding horizontal
  },
  button: {
    backgroundColor: 'papayawhip',
    color: 'white',
    paddingVertical: 15, // Aumentado el padding vertical para hacerlo más grande
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150, // Ancho mínimo del botón
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
    paddingHorizontal: 15,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    maxWidth: 500, // Limitar el ancho máximo del modal
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4B0082',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6F61',
  },
  imageItem: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginLeft: 30,
  },
  selectedText: {
    marginLeft: 35,
  },
  modalTitleSettingsRoute: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  profileLabel: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  profileValue: {
    flex: 1,
    flexWrap: 'wrap',
  },
  modalText: {
    textAlign: 'justify',
    fontSize: 11,
  },  
  buttonContainerSettings: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    minWidth: 100,
  },
  optionContainerSettingsRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionTextSettingsRoute: {
    marginLeft: 10,
    fontSize: 18,
  },
  modalContainerSettingsRoute: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContentSettingsRoute: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});