import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { List, Avatar, Divider} from 'react-native-paper';

export default function UserScreen({ navigation }) {
  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const [currentTime, setCurrentTime] = useState('');

  const getCurrentTime = () => {
    const date = new Date();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setCurrentTime(timeString);
  };

  useEffect(() => {
    getCurrentTime();
    const interval = setInterval(() => {
      getCurrentTime();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function HomeScreen() {
    const [deviceCount, setDeviceCount] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
  
    const handleAddDevice = () => {
      setDeviceCount(deviceCount + 1);
      setModalVisible(false);
    };

    const devices = [
      { id: '1', name: 'Máquina Transportadora 1', image: require('../assets/device1.jpg') },
      { id: '2', name: 'Máquina Transportadora 2', image: require('../assets/device2.jpg') },
    ];
  
    return (
      <View style={styles.screenContainer}>
        <View style={[styles.deviceCountContainer, { marginTop: 50 }]}>
          <Text style={styles.deviceCountText}>Dispositivos agregados: {deviceCount}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Agregar Dispositivo</Text>
        </TouchableOpacity>
  
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Dispositivo</Text>
            <ScrollView>
              {devices.map((device) => (
                <TouchableOpacity key={device.id} style={styles.deviceListItem} onPress={handleAddDevice}>
                  <Image source={device.image} style={styles.deviceIcon} />
                  <Text style={styles.deviceListItemText}>{device.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DevicesScreen() {
  const [visibleDialog, setVisibleDialog] = useState(false); // Estado para controlar la visibilidad del Dialog
  const [selectedDevice, setSelectedDevice] = useState(null); // Estado para almacenar el dispositivo seleccionado

  const devices = [
    { 
      id: '1', 
      name: 'Máquina Transportadora 1', 
      description: 'Esta máquina transporta materiales pesados de un punto a otro en la planta.', 
      details: 'Detalles técnicos: Capacidad de carga máxima de 1000 kg. Velocidad ajustable.', 
      image: require('../assets/device1.jpg') 
    },
    { 
      id: '2', 
      name: 'Máquina Transportadora 2', 
      description: 'Utilizada para movimientos continuos de materiales en entornos industriales.', 
      details: 'Detalles técnicos: Sistema de control automático integrado. Diseño ergonómico.', 
      image: require('../assets/device2.jpg') 
    },
    // Agrega más dispositivos según sea necesario
  ];

  const showDialog = (device) => {
    setSelectedDevice(device);
    setVisibleDialog(true);
  };

  // Función para cerrar el Dialog
  const hideDialog = () => {
    setVisibleDialog(false);
    setSelectedDevice(null);
  };

  // Funciones para los botones de control (encender, apagar, velocidad, etc.)
  const handleTurnOn = () => {
    // Implementa la lógica para encender el dispositivo
    console.log(`Encendiendo ${selectedDevice.name}`);
    hideDialog(); // Cierra el Dialog después de realizar la acción
  };

  const handleTurnOff = () => {
    // Implementa la lógica para apagar el dispositivo
    console.log(`Apagando ${selectedDevice.name}`);
    hideDialog(); // Cierra el Dialog después de realizar la acción
  };

  const handleChangeSpeed = () => {
    // Implementa la lógica para ajustar la velocidad del dispositivo
    console.log(`Ajustando velocidad de ${selectedDevice.name}`);
    hideDialog(); // Cierra el Dialog después de realizar la acción
  };

  return (
    <View style={styles.container}>
      <List.Section>
        {devices.map(device => (
          <List.Item
            key={device.id}
            title={device.name}
            description={device.description}
            left={props => <Avatar.Image {...props} source={device.image} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Pressed')}
          />
        ))}
      </List.Section>
      <Divider />
      {/* Aquí puedes agregar más contenido debajo del List.Section si es necesario */}
    </View>
  );
}
function ProfileScreen() {
  const user = {
    name: 'Nombre del Usuario',
    email: 'usuario@example.com',
    // Otros datos relevantes
    // Puedes agregar más campos según tus necesidades
  };

  return (
    <View style={styles.screenContainer}>
      {/* Avatar o imagen de perfil */}
      <Avatar.Image
        source={require('../assets/avatar.jpg')} // Puedes reemplazar con la imagen real del usuario si la tienes
        size={150}
        style={styles.avatar}
      />
      {/* Nombre del usuario */}
      <Text style={styles.screenText}>{user.name}</Text>
      
      {/* Email u otros datos del usuario */}
      <Text style={styles.userInfoText}>{user.email}</Text>
      
      {/* Botón para editar perfil */}
      <TouchableOpacity style={styles.editProfileButton}>
        <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
      
      {/* Otros detalles del perfil, como dirección, teléfono, etc. */}
      {/* Aquí puedes agregar más detalles del usuario según sea necesario */}
    </View>
  );
}

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props} style={styles.drawerContainer}>
        <View style={styles.drawerHeader}>
          <Image
            source={require('../assets/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerRight}>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
        </View>
        <DrawerItemList {...props} />
        <View style={styles.divider} />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
          <Icon name="exit-outline" size={28} color="#FF0000" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    );
  }

  const Drawer = createDrawerNavigator();

  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        drawerStyle={{
          backgroundColor: '#FFFFFF',
          width: 240,
        }}
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: '#007BFF' },
          headerTintColor: '#FFFFFF',
          drawerActiveBackgroundColor: '#007BFF',
          drawerInactiveTintColor: '#000000',
          drawerActiveTintColor: '#FFFFFF',
          drawerLabelStyle: { fontWeight: 'bold' },
          drawerIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Devices':
                iconName = focused ? 'wifi' : 'wifi-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person-circle' : 'person-circle-outline';
                break;
              default:
                iconName = 'help-circle-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Devices" component={DevicesScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  avatar: {
    marginTop: 30, // Ajusta la distancia desde arriba según tu preferencia
    marginBottom: 20, // Mantiene un espacio abajo para los otros elementos
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  screenText: {
    fontSize: 20,
    color: '#000000',
    marginVertical: 10,
  },
  deviceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  deviceListItemText: {
    fontSize: 16,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  deviceCountContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  deviceCountText: {
    fontSize: 18,
    color: '#000000',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFA500',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    padding: 15,
    backgroundColor: '#FFA500',
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  logo: {
    width: 120,
    height: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#000000',
    marginRight: -7,
    top: -30,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutIcon: {
    marginRight: 25,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF0000',
  },
  deviceImage: {
    width: 100,
    height: 100,
    margin: 10,
  },
  userInfoText: {
    fontSize: 18,
    color: '#555555',
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  editProfileButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});