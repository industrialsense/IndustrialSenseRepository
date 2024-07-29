import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Text, TextInput, Image, FlatList } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, FAB, Checkbox, SegmentedButtons, Card, Title} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'react-native-bcrypt';

const HomeRoute = () => {
  const [selectedSegment, setSelectedSegment] = useState('usuarios');
  const [modalVisible, setModalVisible] = useState(false); // Estado del modal
  

  const navigation = useNavigation();

 
  const renderUsuarios = () => (
    <View style={styles.cardsContainerVertical}>
      
      <TouchableOpacity style={styles.cardTouchable} onPress={() => openModal('usuario')}>
       
      </TouchableOpacity>
      <Card style={styles.cardHorizontal}>
        <Card.Cover source={require('../assets/maquinas.jpg')} />
        <Card.Content>
          <Title style={styles.cardTitle}>Máquinas</Title>
        </Card.Content>
      </Card>
    </View>
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
      >
      </Modal>
    </View>
  );
};

const HelpRoute = () => (
  <View style={styles.routeContainer}>
    <Text>Help Screen</Text>
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
      case "help":
        return <HelpRoute />;
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
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("machines")}>
          <Icon name="devices" size={30} color={selectedRoute === "machines" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "machines" ? styles.navTextSelected : styles.navText}>Máquinas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("help")}>
          <Icon name="account-plus" size={30} color={selectedRoute === "help" ? "#7E57C2" : "#B39DDB"} />
          <Text style={selectedRoute === "help" ? styles.navTextSelected : styles.navText}>Soporte</Text>
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