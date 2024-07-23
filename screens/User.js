import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { List, Avatar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

// Crea el Stack Navigator una sola vez
const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
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
      <View style={styles.deviceCountContainer}>
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

function DevicesScreen({ navigation }) {
  const [visibleDialog, setVisibleDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

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
  ];

  const showDialog = (device) => {
    setSelectedDevice(device);
    setVisibleDialog(true);
  };

  const hideDialog = () => {
    setVisibleDialog(false);
    setSelectedDevice(null);
  };

  const handleTurnOn = () => {
    console.log(`Encendiendo ${selectedDevice.name}`);
    hideDialog();
  };

  const handleTurnOff = () => {
    console.log(`Apagando ${selectedDevice.name}`);
    hideDialog();
  };

  const handleChangeSpeed = () => {
    console.log(`Ajustando velocidad de ${selectedDevice.name}`);
    hideDialog();
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
            onPress={() => showDialog(device)}
          />
        ))}
      </List.Section>
      <Divider />
    </View>
  );
}

function ProfileScreen() {
  const user = {
    name: 'Nombre del Usuario',
    email: 'usuario@example.com',
  };

  return (
    <View style={styles.screenContainer}>
      <Avatar.Image
        source={require('../assets/avatar.jpg')}
        size={150}
        style={styles.avatar}
      />
      <Text style={styles.screenText}>{user.name}</Text>
      <Text style={styles.userInfoText}>{user.email}</Text>
      <TouchableOpacity style={styles.editProfileButton}>
        <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Devices" component={DevicesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        {/* Asegúrate de definir la pantalla Login si es necesario */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  avatar: {
    marginTop: 30,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    position: 'relative',
  },
  screenContainer: {
    flex: 3,
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
    marginTop: 100,
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
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  editProfileButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  userInfoText: {
    fontSize: 16,
    color: '#000000',
    marginVertical: 5,
  },
});
