import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker from the new package
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './src/Redux/features/crmSlice';
import Login from './src/screens/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from './api';

const WelcomePage = ({ navigation }) => {
  const [login, setLogin] = useState(true);
  const [loginPage, setLoginPage] = useState(false);
  const [welPage, setWelPage] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [selectedReason, setSelectedReason] = useState(''); // State for selected logout reason
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.crmUser);

  useEffect(() => {
    console.log('Welcome Page', user);
  }, [user, navigation]);

  const handleLogout = () => {
    setIsModalVisible(true); // Show the modal
  };


 
 
  const handleSubmit = async () => {
    const workTime = await AsyncStorage.getItem('sessionDuration');
    console.log(workTime)
    if (formData.logoutReason.length > 0) {
      const response = await apiInstance.post("attendance/logout", formData)
      console.log(response)
      if (response.status === 200) {
        navigate("/")
        logout()
      }
    } else {
      toast.info("Please select a reason")
    }
  }

  const confirmLogout = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for logout.');

      return;
    }
    handleSubmit()

    // Perform logout
    dispatch(logout())
      .then(() => {
        console.log('Logout successful');
        setLogin(false); // Update login state
        navigation.replace('Login'); // Navigate to the Login screen
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      })
      .finally(() => {
        setIsModalVisible(false); // Close the modal
      });
  };

  const handleLogin = () => {
    setLoginPage(true);
    setWelPage(false);
  };

  return (
    <>
      {welPage && (
        <ImageBackground
          source={{ uri: 'https://img.freepik.com/free-photo/abstract-gradient-colorful-background_23-2149025199.jpg?size=626&ext=jpg' }}
          style={styles.container}
        >
          <View style={styles.overlay}>
            {/* Logo or Icon */}
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3003/3003897.png' }}
              style={styles.logo}
            />

            {/* Welcome Text */}
            <Text style={styles.title}>Welcome to Our App!</Text>
            <Text style={styles.subtitle}>Your journey starts here. Let’s get started!</Text>

            {/* Buttons */}
            {login ? (
              <TouchableOpacity onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      )}

      {loginPage && <Login />}

      {/* Logout Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a reason for logout:</Text>

            {/* Dropdown for logout reasons */}
            <Picker
              selectedValue={selectedReason}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedReason(itemValue)}
            >
              <Picker.Item label="Select a reason" value="" />
              <Picker.Item label="Over" value="over" />
              <Picker.Item label="Senior Instruction" value="senior instruction" />
              <Picker.Item label="Half Day" value="half day" />
            </Picker>

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout} style={[styles.modalButton, styles.confirmButton]}>
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});