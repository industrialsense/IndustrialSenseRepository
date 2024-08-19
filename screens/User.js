import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Text, TextInput, Image, FlatList, Linking} from 'react-native';
import { Button, IconButton, FAB, Checkbox, Card, Title, Avatar, Switch, SegmentedButtons, List} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import bcrypt from 'react-native-bcrypt';
import TextCarousel from './TextCarousel';

const HomeRoute = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userEmail, userID } = route.params;
  const [db, setDb] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('usuarios');
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [assignedMachines, setAssignedMachines] = useState([]);
  const [ipInput, setIpInput] = useState('');
  const [imagen, setImagen] = useState('');
  const [machineData, setMachineData] = useState(null);
  const [contador, setContador] = useState(0);  // Inicializamos el contador en 0
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('indsense');
        setDb(database);
        console.log("Database opened successfully");

        await fetchNotifications(database);

        if (userID) {
          await fetchAssignedMachines(database);
        }
      } catch (error) {
        console.error('Error al abrir la base de datos: ', error);
      }
    };

    openDatabaseAndFetch();
  }, [userID]);

  useEffect(() => {
    if (db && userID) {
      fetchAssignedMachines(db);
    }
  }, [db, userID]);

  const fetchNotifications = async (database) => {
    try {
      const data = await database.getAllAsync(
        'SELECT * FROM notificaciones WHERE usuario_id = ?',
        [userID]
      );
      console.log("Notifications fetched: ", data);
      setNotifications(data);
    } catch (error) {
      console.error('Error al obtener notificaciones: ', error);
    }
  };

  const fetchMachineData = async (ip) => {
    if (!validateIp(ip)) {
      Alert.alert('Error', 'La dirección IP no es válida. Debe estar en el formato correcto y cada octeto no debe ser mayor a 255.');
      return;
    }
  
    try {
      console.log("Entered IP: ", ip);
  
      const notificationsData = await db.getAllAsync(
        'SELECT * FROM notificaciones WHERE usuario_id = ?',
        [userID]
      );
      console.log("Notifications data: ", notificationsData);
  
      const notification = notificationsData.find(notification => {
        const ipMatch = notification.mensaje.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        return ipMatch && ipMatch[0] === ip;
      });
      console.log("Found notification: ", notification);
  
      if (!notification) {
        Alert.alert('Error', 'La IP no coincide con el mensaje de notificación.');
        return;
      }
  
      const existingMachine = await db.getFirstAsync(
        'SELECT * FROM maquinas WHERE ip = ?',
        [ip]
      );
  
      if (existingMachine) {
        if (existingMachine.usuario_id !== userID) {
          Alert.alert('Error', 'Esta IP ya está asignada a otro usuario.');
          return;
        }
      } else {
        await db.runAsync(
          'UPDATE maquinas SET usuario_id = ? WHERE ip = ?',
          [userID, ip]
        );
      }
  
      const assignedMachine = await db.getFirstAsync(
        'SELECT * FROM maquinasAsignadas WHERE usuario_id = ? AND maquina_id = ?',
        [userID, existingMachine.id]
      );
  
      if (!assignedMachine) {
        await db.runAsync(
          'INSERT INTO maquinasAsignadas (usuario_id, maquina_id) VALUES (?, ?)',
          [userID, existingMachine.id]
        );
      }
  
      Alert.alert('Éxito', 'La máquina ha sido asignada a su cuenta.');
      // Asegúrate de que la base de datos esté completamente inicializada antes de hacer la consulta
      if (db) {
        await fetchAssignedMachines(db);
      }
    } catch (error) {
      console.error('Error al asociar la máquina al usuario: ', error);
      Alert.alert('Error', 'No se pudo asociar la máquina al usuario.');
    }
  };
  
  const validateIp = (ip) => {
    const regex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!regex.test(ip)) {
      return false;
    }
    const parts = ip.split('.').map(Number);
    return parts.length === 4 && parts.every(part => Number.isInteger(part) && part >= 0 && part <= 255);
  };
  
  const handleIpSubmit = () => {
    if (ipInput) {
      fetchMachineData(ipInput);
    } else {
      Alert.alert('Error', 'Debe introducir una IP.');
    }
  };
  
  const fetchAssignedMachines = async (database) => {
    try {
      if (!database) {
        console.error('Error al obtener máquinas asignadas: Database is not initialized');
        return;
      }

      console.log("Fetching assigned machines for user ID:", userID);
      const data = await database.getAllAsync(
        `SELECT m.nombre, m.ip, m.descripcion, m.imagen 
         FROM maquinasAsignadas ma 
         JOIN maquinas m ON ma.maquina_id = m.id 
         WHERE ma.usuario_id = ?`,
        [userID]
      );

      console.log("Assigned machines fetched: ", data);

      if (data.length > 0) {
        setAssignedMachines(data);
      } else {
        console.log("No assigned machines found.");
      }
    } catch (error) {
      console.error('Error al obtener máquinas asignadas: ', error);
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

  const selectImage = (imageId) => {
    setImagen(imageId);
  };

  const incrementarContador = () => {
    setContador(prev => Math.min(prev + 5, 200)); // Incrementar en pasos de 5 hasta 200
  };

  const decrementarContador = () => {
    setContador(prev => Math.max(prev - 5, 0)); // Decrementar en pasos de 5 hasta 0
  };

  const handleSwitchChange = (value) => {
    setIsSwitchOn(value);
    if (db) {
      db.runAsync('UPDATE maquinas SET estatus = ? WHERE usuario_id = ?', [value, userID]);
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

  const openModal = (segment) => {
    setSelectedSegment(segment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderNotificaciones = () => (
    <View style={styles.notificationModalContent}>
      <Text style={styles.notificationModalTitle}>Notificaciones</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.mensaje}</Text>
          </View>
        )}
      />
      <TouchableOpacity onPress={closeModal} style={styles.notificationCloseButton}>
        <Text style={styles.notificationCloseButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMaquinaria = () => (
    <View style={styles.containerRenderMachine}>
      <Text style={styles.titleRenderMachine}>Agregar IP de Máquina</Text>
      <TextInput
        style={styles.inputRenderMachine}
        placeholder="Introduce la IP de la máquina"
        value={ipInput}
        onChangeText={setIpInput}
      />
      <Button 
        mode="contained" 
        onPress={handleIpSubmit} 
        style={styles.buttonRenderMachine}
      >
        <Text style={styles.buttonTextRenderMachine}>Agregar Máquina</Text>
      </Button>
      {machineData && (
        <View style={styles.machineDetailsRenderMachine}>
          <Text style={styles.machineTextRenderMachine}>Nombre: {machineData.nombre}</Text>
          <Text style={styles.machineTextRenderMachine}>Puerto: {machineData.puerto}</Text>
          <Text style={styles.machineTextRenderMachine}>Descripción: {machineData.descripcion}</Text>
          <Avatar.Image 
            source={getImage(machineData.imagen)} 
            size={100} 
            style={styles.avatarRenderMachine} 
          />
        </View>
      )}
      <TouchableOpacity onPress={closeModal} style={styles.closeButtonRenderMachine}>
        <Text style={styles.closeButtonTextRenderMachine}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  )

  const renderAsignadas = () => (
    <View style={styles.containerRenderAsign}>
      <FlatList
        data={assignedMachines}
        keyExtractor={(item) => item.ip.toString()}
        renderItem={({ item }) => (
          <View style={styles.machineItemRenderAsign}>
            <TouchableOpacity onPress={() => openModal('cambiar')}>
            <Avatar.Image
              source={getImage(parseInt(item.imagen))}
              size={80}
              style={styles.avatarRenderAsign}
            />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Text style={styles.textRenderAsign}>Nombre: {item.nombre}</Text>
              <Text style={styles.textRenderAsign}>IP: {item.ip}</Text>
              <Text style={styles.textRenderAsign}>Descripción: {item.descripcion}</Text>
            </View>
          </View>
        )}
      />
      <TouchableOpacity onPress={closeModal} style={styles.closeButtonRenderAsign}>
        <Text style={styles.closeButtonTextRenderAsign}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCambioMaquina = () => {

    return (
      <FlatList
        data={assignedMachines}
        keyExtractor={(item) => item.ip.toString()}
        renderItem={({ item }) => (
          <View style={styles.containerCambioMaquina}>
            <Avatar.Image 
              source={getImage(parseInt(item.imagen))} // Usar `item.imagen` para obtener la imagen correcta
              size={100} 
              style={styles.avatarCambioMaquina} 
            />
            <Text style={styles.textLabel}>Ajustar la velocidad</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={contador}
              onValueChange={valor => setContador(valor)}
              minimumTrackTintColor="green"
              maximumTrackTintColor="red"
              thumbTintColor="gray"
            />
            <Text style={styles.contadorText}>{contador}</Text>
            <Text style={styles.textLabel}>Apagado / Encendido</Text>
            <Switch
              value={isSwitchOn}
              color="black"
              onValueChange={handleSwitchChange}
              style={styles.switch}
            />
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  }

  const renderModalContent = () => {
    let content;
    switch (selectedSegment) {
      case 'notificacion':
        content = renderNotificaciones();
        break;
      case 'maquinas':
        content = renderMaquinaria();
        break;
      case 'peticiones':
        content = renderAsignadas();
        break;
      case 'cambiar':
        content = renderCambioMaquina();
        break;
      default:
        content = null;
    }

    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {content}
        </View>
      </View>
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
            onPress={() => openModal('notificacion')}
            style={styles.notificationIcon}
          />
          <IconButton
            icon="logout"
            color="#000"
            size={30}
            onPress={handleLogout}
            style={styles.logoutIcon}
          />
        </View>
      </View>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Bienvenido: {userEmail} </Text>
        <Text style={styles.greetingDescription}>Aquí puedes gestionar tus máquinas y ver las últimas novedades.</Text>
      </View>
        <View style={styles.cardsContainerVertical}>
          <TouchableOpacity onPress={() => openModal('maquinas')}>
            <Card style={styles.cardVertical}>
              <Card.Cover source={require('../assets/maquinas.jpg')} />
              <Card.Content>
                <Title style={styles.cardTitle}>Agregar Máquinas</Title>
              </Card.Content>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openModal('peticiones')}>
            <Card style={styles.cardVertical}>
              <Card.Cover source={require('../assets/peticiones.jpg')} />
              <Card.Content>
                <Title style={styles.cardTitle}>Máquinas Personales</Title>
              </Card.Content>
            </Card>
          </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        {renderModalContent()}
      </Modal>
    </View>
  );
};

const MachinesRoute = () => {
  const route = useRoute();
  const { userEmail, userID } = route.params;
  const [db, setDb] = useState(null);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const openDatabaseAndFetch = async () => {
      const database = await SQLite.openDatabaseAsync('indsense');
      setDb(database);
    };
    openDatabaseAndFetch();
  }, []);

  const handleRequest = async () => {
    if (message.trim() === '') {
      Alert.alert("Error", "El mensaje de solicitud no puede estar vacío");
      return;
    }

    try {
      const result = await db.runAsync(
        'INSERT INTO solicitudes (usuario_id, mensaje) VALUES (?, ?)',
        [userID, message]
      );

      if (result.changes > 0) {
        Alert.alert("Éxito", "Solicitud enviada exitosamente.");
        setMessage('');
      } else {
        Alert.alert("Error", "No se pudo enviar la solicitud.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud: ", error);
      Alert.alert("Error", "Error al enviar la solicitud.");
    }
  };

  return (
    <View style={styles.containerSolicitudMaquina}>
      <Text style={styles.titleSolicitudMaquina}>Solicitar una máquina:</Text>
      <TextInput
        style={styles.inputSolicitudMaquina}
        placeholder="Escribe tu mensaje de solicitud"
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity onPress={handleRequest} style={styles.buttonSolicitudMaquina}>
        <Text style={styles.buttonTextSolicitudMaquina}>Enviar solicitud</Text>
      </TouchableOpacity>
    </View>
  );
};

const HelpRoute = () => {
  const [selectedSegment, setSelectedSegment] = useState('preguntas');

  const faqData = [
    { question: "¿Cómo puedo restablecer mi contraseña?", answer: "Puedes restablecer tu contraseña desde la pantalla de inicio de sesión seleccionando 'Olvidé mi contraseña'."},
    { question: "¿Cómo actualizo mi perfil?", answer: "Para actualizar tu perfil, ve a la pantalla de configuración y selecciona 'Editar perfil'."},
    { question: "¿Dónde puedo encontrar la política de privacidad?", answer: "Puedes encontrar nuestra política de privacidad en la sección 'Configuración' de la aplicación."},
    { question: "¿Cómo puedo contactar con soporte técnico?", answer: "Puedes contactar con el soporte técnico en la pestaña de 'Redes Sociales' y contactar en alguna de nuestras redes disponibles."},
    { question: "¿Cómo puedo actualizar mi información personal", answer: "Para actualizar tu información personal, ve a la sección 'Perfil' en la aplicación y selecciona 'Editar perfil'."},
    { question: "¿Cómo puedo eliminar mi cuenta?", answer: "Para eliminar tu cuenta, ve a la sección 'Configuración', selecciona 'Cuenta' y luego 'Eliminar cuenta'."},
    { question: "¿Cómo puedo reportar un problema", answer: "Para reportar un problema, ve a la sección 'Ayuda' en la aplicación y selecciona 'Reportar un problema'."},
    // Agrega más preguntas y respuestas según sea necesario
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com'},
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com'},
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com'},
    { name: 'WhatsApp', icon: 'whatsapp', url: 'https://web.whatsapp.com/'},
    { name: 'Gmail', icon: 'gmail', url: 'https://mail.google.com'}
    // Agrega más redes sociales según sea necesario
  ];

  return (
    <View style={styles.containerHelp}>
      <SegmentedButtons
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          { label: 'Preguntas Frecuentes', value: 'preguntas' },
          { label: 'Redes Sociales', value: 'redes' }
        ]}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {selectedSegment === 'preguntas' ? (
        <View style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <List.Accordion
              key={index}
              title={item.question}
              style={styles.accordion}
            >
              <Text style={styles.answerText}>{item.answer}</Text>
            </List.Accordion>
          ))}
        </View>
      ) : (
        <View style={styles.faqContainer}>
            {socialLinks.map((item, index) => (
              <TouchableOpacity key={index} style={styles.socialLink} onPress={() => Linking.openURL(item.url)}>
                <Icon name={item.icon} size={30} color="#000" />
                <Text style={styles.socialText}>{item.name}</Text>
              </TouchableOpacity>
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const SettingsRoute = () => {
  const settingsOptions = [
    { title: 'Privacidad', icon: 'shield-lock-outline' },
    { title: 'Políticas', icon: 'file-document-outline' },
    { title: 'Accesibilidad', icon: 'human' },
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
          <Icon name="home" size={30} color={selectedRoute === "home" ? "#007BFF" : "#003366"} />
          <Text style={selectedRoute === "home" ? styles.navTextSelected : styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("machines")}>
          <Icon name="devices" size={30} color={selectedRoute === "machines" ? "#007BFF" : "#003366"} />
          <Text style={selectedRoute === "machines" ? styles.navTextSelected : styles.navText}>Máquinas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("help")}>
          <Icon name="headset" size={30} color={selectedRoute === "help" ? "#007BFF" : "#003366"} />
          <Text style={selectedRoute === "help" ? styles.navTextSelected : styles.navText}>Soporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setSelectedRoute("settings")}>
          <Icon name="cog" size={30} color={selectedRoute === "settings" ? "#007BFF" : "#003366"} />
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
  containerCambioMaquina: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCambioMaquina: {
    marginBottom: 20,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  speedText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 10,
  },
  switch: {
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#FF5C5C', // Rojo para el botón de cerrar
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  containerSolicitudMaquina: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Fondo claro para un aspecto limpio y moderno
    justifyContent: 'center', // Centrar el contenido verticalmente
  },
  titleSolicitudMaquina: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputSolicitudMaquina: {
    width: '90%',
    left: 20,
    padding: 12,
    marginVertical: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderColor: '#CCC',
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  buttonSolicitudMaquina: {
    backgroundColor: '#FFA500', // Verde para indicar acción positiva
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '40%',
    left: 130,
  },
  buttonTextSolicitudMaquina: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  containerRenderMachine: {
    backgroundColor: '#FFF', // Fondo claro para contraste
    padding: 20,
    width: '90%',
  },
  titleRenderMachine: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    left: 15,
  },
  inputRenderMachine: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  buttonRenderMachine: {
    backgroundColor: '#FFA500', 
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
    left: 45,
  },
  buttonTextRenderMachine: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  machineDetailsRenderMachine: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E0E0E0', // Gris claro para destacar la sección de detalles
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  machineTextRenderMachine: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  avatarRenderMachine: {
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 50, // Hacer la imagen del avatar circular
  },
  closeButtonRenderMachine: {
    backgroundColor: '#FF5C5C', // Rojo para el botón de cerrar
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
    left: 45,
  },
  closeButtonTextRenderMachine: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  containerRenderAsign: {
    backgroundColor: '#FFF', // Fondo claro para un look limpio
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  machineItemRenderAsign: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  textRenderAsign: {
    fontSize: 11,
    color: '#333',
    marginBottom: 3,
  },
  avatarRenderAsign: {
    marginRight: 15,
    backgroundColor: '#E0E0E0',
  },
  closeButtonRenderAsign: {
    backgroundColor: '#FF5C5C', // Rojo para el botón de cerrar
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    width: '50%',
  },
  closeButtonTextRenderAsign: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  notificationModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  notificationModalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    width: '90%',
    borderRadius: 10,
  },
  notificationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    left: 75,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    color: '#000',
  },
  notificationCloseButton: {
    backgroundColor: '#FF5C5C', // Rojo para el botón de cerrar
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
    left: 45,
    marginTop: 20, 
  },
  notificationCloseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  containerHelp: {
    flex: 1,
    padding: 10,
    paddingTop: 20,
    paddingHorizontal: 30,
  },
  scrollViewContent: {
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: "space-around",
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  answer: {
    fontSize: 14,
    color: '#555',
  },
  faqContainer: {
    flex: 1,
    paddingTop: 30,
  },
  accordion: {
    backgroundColor: '#FFFFFF',
  },
  answerText: {
    padding: 10,
    color: '#000',
    backgroundColor: '#FFFFFF',
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 20,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
  },
  settingsContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  optionContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
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
    color: "#007BFF",
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
  cardsContainerVertical: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20, 
    paddingTop: 20,
    marginBottom: 265,
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
