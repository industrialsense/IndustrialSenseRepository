import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Text, TextInput, Image, FlatList, Linking } from 'react-native';
import { Button, Searchbar, DataTable, IconButton, FAB, Checkbox, SegmentedButtons, Card, Title, List} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import bcrypt from 'react-native-bcrypt';
import TextCarousel from './TextCarousel';

const HomeRoute = () => {
  const [userEmail] = useState('usuario@ejemplo.com');
  const navigation = useNavigation();
  
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
        <Text style={styles.greetingText}>Bienvenido, {userEmail}</Text>
        <Text style={styles.greetingDescription}>Aquí puedes gestionar tus máquinas y ver las últimas novedades.</Text>
      </View>
      <View style={styles.cardsContainerVertical}>
        <Card style={styles.cardHorizontal}>
          <Card.Cover source={require('../assets/maquinas.jpg')} />
          <Card.Content>
            <Title style={styles.cardTitle}>Máquinas</Title>
          </Card.Content>
        </Card>
      </View>
      <TextCarousel/>
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
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com' },
    { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { name: 'Reddit', icon: 'reddit', url: 'https://reddit.com' },
    { name: 'Twitch', icon: 'twitch', url: 'https://twitch.com' },
    { name: 'Teams', icon: 'microsoft-teams', url: 'https://teams.microsoft.com' },
    { name: 'Gmail', icon: 'gmail', url: 'https://mail.google.com' }
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