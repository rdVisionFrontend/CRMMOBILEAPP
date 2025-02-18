import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../Authorization/AuthContext';
import BestSellingClosers from '../screens/BestSellingCloser';
import LiveCalendar from '../screens/LiveClander';
import { LineChart } from 'react-native-chart-kit';
import WorkTimeGraph from './WorktimeGraph';
import { RadioButton } from 'react-native-paper';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { DevSettings } from 'react-native';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [breakTimerActive, setBreakTimerActive] = useState(false);
  const [checked, setChecked] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    fetchToken();
    fetchStartTime();
  }, [token]);

  const fetchStartTime = async () => {
    const startTime = await AsyncStorage.getItem('startTime');
    if (startTime) {
      const currentTime = new Date().getTime();
      const elapsed = Math.floor((currentTime - parseInt(startTime)) / 1000);
      setElapsedTime(elapsed);
    }
  };

  const startTimer = async () => {
    const startTime = new Date().getTime();
    await AsyncStorage.setItem('startTime', startTime.toString());
    setTimerActive(true);
  };

  useEffect(() => {
    let breakTimer;
    if (onBreak && breakTimerActive) {
      breakTimer = setInterval(() => {
        setBreakTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(breakTimer);
    }
    return () => clearInterval(breakTimer);
  }, [onBreak, breakTimerActive]);

  const handleEndBreak = () => {
    setBreakTimerActive(false);
    setOnBreak(false);
    setTimerActive(true);
    setModalVisible(false);
    setLogoutModal(false);
  };

  const handleTakeBreak = () => {
    setTimerActive(false);
    setOnBreak(true);
    setBreakTimerActive(true);
    setModalVisible(true);
  };

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwtToken');
      setToken(storedToken);
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
      console.log('Token:', storedToken);
      console.log('User:', storedUser);
      if (parsedUser) {
        startTimer();
      }
    } catch (error) {
      console.error('Error fetching data from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (isAuthenticated && timerActive) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isAuthenticated, timerActive]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours} hr ${String(minutes).padStart(2, '0')} min`;
    } else {
      return `${String(minutes).padStart(2, '0')} min ${String(remainingSeconds).padStart(2, '0')} sec`;
    }
  };

  const [logoutModal, setLogoutModal] = useState(false);
  const handleLogout = async () => {
    setLogoutModal(true);
  };

  // Automatic logout after 12 hours
  useEffect(() => {
    const autoLogoutTimer = setTimeout(() => {
      handleLogoutFinal();
      Alert.alert('Session Expired', 'You have been automatically logged out after 12 hours.');
    }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds

    return () => clearTimeout(autoLogoutTimer);
  }, []);

  const handleLogoutFinal = async () => {
    try {
      await AsyncStorage.removeItem('startTime');

      setElapsedTime(0);
      setBreakTime(0);
      setTimerActive(false);
      setBreakTimerActive(false);

      const attId = await AsyncStorage.getItem('atdncId');
      const token = await AsyncStorage.getItem('jwtToken');
      const totalWorkTime = elapsedTime !== undefined ? String(elapsedTime) : '0';
      const totalBreakTime = breakTime !== undefined ? String(breakTime) : '0';

      if (!checked) {
        Alert.alert('Select a Reason');
        return;
      }

      const formData = {
        attendanceId: attId,
        logoutReason: checked,
        actualWorkingSeconds: totalWorkTime,
        totalBreakInSec: totalBreakTime,
      };

      const response = await axios.post(
        'https://uatbackend.rdvision.tech/attendance/logout',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        await AsyncStorage.clear();
        setIsAuthenticated(false);
        setLogoutModal(false);
        DevSettings.reload();
        console.log('Logout', response);
      }
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.statusContainerLogout} onPress={handleLogout}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/18844/18844589.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/1077/1077114.png',
              }}
              style={styles.profileImage}
            />
            <View
              style={[
                styles.statusDot,
                { backgroundColor: user?.onBreak ? 'red' : 'green' },
              ]}
            />
          </View>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <View style={styles.infoRow}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/159/159832.png',
              }}
              style={styles.icon}
            />
            <Text style={styles.phoneText}>{user?.phoneNumber}</Text>
          </View>
        </View>

        {/* User Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsWrapper}>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/646/646094.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.detailText}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/159/159832.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.detailText}>{user?.phoneNumber || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/456/456283.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.detailText}>{user?.roleDto.roleName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/1006/1006771.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.detailText}>{user?.systemIp || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/49/49728.png',
                }}
                style={styles.icon}
              />
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={styles.detailText}>{formatTime(elapsedTime)}</Text>
                <TouchableOpacity
                  onPress={handleTakeBreak}
                  style={{
                    backgroundColor: '#ce4257',
                    paddingVertical: 5,
                    paddingHorizontal: 8,
                    marginLeft: 100,
                    borderRadius: 8,
                    boxShadow: '4px 5px 6px rgba(0,0,0,0.4)',
                  }}>
                  <Text style={{ color: '#fff', fontWeight: 600 }}>Take Break</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/2972/2972464.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.detailText}>{formatTime(breakTime)}</Text>
            </View>
            <WorkTimeGraph workHours={elapsedTime / 3600} />
          </View>
        </View>
        <BestSellingClosers />
        <LiveCalendar />
        <Text style={{ marginBottom: 20 }}></Text>
      </ScrollView>
      {/* Live Take break Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={styles.detailText}>Work Time: {formatTime(elapsedTime)}</Text>
              <Text style={styles.detailText}>Break Start: {formatTime(breakTime)}</Text>
            </View>

            <View style={{ alignContent: 'center', paddingVertical: 20 }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 5,
                  borderRadius: 10,
                  width: '100%',
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}>{`${user?.firstName} ${user?.lastName} You are on break`}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={handleEndBreak}>
              <Text style={{ fontWeight: '600', color: '#fff' }}>End Break</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Logout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutModal}
        onRequestClose={() => setLogoutModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentLogout}>
            <Text style={{ fontWeight: 800, fontSize: 25 }}>Logout</Text>
            <View style={{ display: 'flex', flexDirection: 'column', width: '95%' }}>
              <RadioButton.Item
                label="Half Day"
                value="Half_Day"
                status={checked === 'Half_Day' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('Half_Day')}
              />

              <RadioButton.Item
                label="Senior Instruction"
                value="Senior_Instruction"
                status={checked === 'Senior_Instruction' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('Senior_Instruction')}
              />

              <RadioButton.Item
                label="Over"
                value="Over"
                status={checked === 'Over' ? 'checked' : 'unchecked'}
                onPress={() => setChecked('Over')}
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
              }}>
              <TouchableOpacity style={styles.closeButton} onPress={handleEndBreak}>
                <Text style={{ fontWeight: '600', color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.LogoutBtn} onPress={handleLogoutFinal}>
                <Text style={{ fontWeight: '600', color: '#fff' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
  },
  scrollView: {
    width: '100%',
  },
  header: {
    position: 'relative',
    height: 220,
    backgroundColor: '#0088FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    borderEndEndRadius: 60,
    borderBottomLeftRadius: 60,
  },
  userName: {
    fontSize: 25,
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 20,
  },
  detailsWrapper: {
    marginLeft: 20,
    alignItems: 'flex-start',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  icon: {
    height: 20,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    padding: 5,
  },
  statusContainerLogout: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    backgroundColor: '#Fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '92%',
  },
  modalContentLogout: {
    backgroundColor: '#ffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#415a77',
    padding: 10,
    borderRadius: 5,
    boxShadow: '4px 5px 4px rgba(0,0,0,0.5)',
  },
  LogoutBtn: {
    marginTop: 10,
    backgroundColor: '#134074',
    padding: 10,
    borderRadius: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
});