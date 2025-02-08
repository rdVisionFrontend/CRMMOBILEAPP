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
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../Authorization/AuthContext';
import BestSellingClosers from '../screens/BestSellingCloser';
import LiveCalendar from '../screens/LiveClander';
import {LineChart} from 'react-native-chart-kit';
import WorkTimeGraph from './WorktimeGraph';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const {isAuthenticated, setIsAuthenticated} = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [breakTimerActive, setBreakTimerActive] = useState(false);

  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    let breakTimer;
    if (onBreak && breakTimerActive) {
      breakTimer = setInterval(() => {
        setBreakTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(breakTimer);
    }
    return () => clearInterval(breakTimer);
  }, [onBreak, breakTimerActive]);

  const handleEndBreak = () => {
    setBreakTimerActive(false); // Stop break timer
    setOnBreak(false);
    setTimerActive(true); // Resume work timer
    setModalVisible(false); // Close modal
  };

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('jwtToken');
      setToken(storedToken);
      console.log('Token:', storedToken);

      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
      console.log('User:', parsedUser);
      if (isAuthenticated) {
        setTimerActive(true); // Start the timer if authenticated
      }
    } catch (error) {
      console.error('Error fetching data from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (isAuthenticated && timerActive) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000); // Updates every second
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isAuthenticated, timerActive]);

  const handleTakeBreak = () => {
    setTimerActive(false); // Pause work timer
    setBreakTime(0); // Reset break timer
    setOnBreak(true);
    setBreakTimerActive(true); // Start break timer
    setModalVisible(true); // Show break modal
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')} Min`;
  };

  const handleLogout = async () => {
    Alert.alert('Logout Confirmation', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('jwtToken'); // Clear token
            await AsyncStorage.removeItem('user'); // Clear user data
            
            if (elapsedTime !== undefined) {
              await AsyncStorage.setItem('totalWorkTime', String(elapsedTime)); // Convert to string
            }
            console.log('totalWorkTime', String(elapsedTime))
            setIsAuthenticated(false); // Update authentication state
            Alert.alert('You are logged out'); // Corrected message
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };
  

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.statusContainerLogout}
            onPress={handleLogout}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/18844/18844589.png',
              }}
              style={styles.icon}
            />
          </TouchableOpacity>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/1077/1077114.png',
            }}
            style={styles.profileImage}
          />
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
          {user?.onBreak ? (
            <View style={styles.statusContainerInActive}>
              <Text style={styles.statusText}>In Active</Text>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          )}
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
              <Text style={styles.detailText}>
                {user?.phoneNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/456/456283.png',
                }}
                style={styles.icon}
              />
              <Text style={styles.detailText}>
                {user?.roleDto.roleName || 'N/A'}
              </Text>
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
                  }}>
                  <Text style={{color: '#fff', fontWeight: 600}}>
                    Take Break
                  </Text>
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
            <WorkTimeGraph workHours={elapsedTime / 3600} /> // Convert seconds
            to hours
          </View>
        </View>
        <BestSellingClosers />
        <LiveCalendar/>
        <Text style={{marginBottom:20}}></Text>
      </ScrollView>

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
                width: '90%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={styles.detailText}>
                Work Time: {formatTime(elapsedTime)}
              </Text>

              <Text style={styles.detailText}>
                Break Start: {formatTime(breakTime)}
              </Text>
            </View>

            <View style={{alignContent: 'center'}}>
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
                  }}>{`${user?.firstName} ${user?.lastName} You are on break`}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleEndBreak}>
              <Text style={{fontWeight: '600'}}>End Break</Text>
            </TouchableOpacity>
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
    height: 250,
    backgroundColor: '#0088FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderEndEndRadius: 60,
    borderBottomLeftRadius: 60,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 32,
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
    height: 30,
    width: 30,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
    padding: 5,
  },
  statusContainerLogout: {
    alignSelf: 'flex-start', // Aligns to the right dynamically
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15, // Makes it look smoother
    marginRight: 20, // Adds some spacing from the edge
    marginTop: 10, // Adds space from the previous element
  },
  statusContainer: {
    alignSelf: 'flex-end', // Aligns to the right dynamically
    backgroundColor: '#52BF56', // Fixed background color
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15, // Makes it look smoother
    marginRight: 30, // Adds some spacing from the edge
    marginTop: 5, // Adds space from the previous element
  },
  statusContainerInActive: {
    alignSelf: 'flex-end', // Aligns to the right dynamically
    backgroundColor: '#b5838d', // Fixed background color
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15, // Makes it look smoother
    marginRight: 30, // Adds some spacing from the edge
    marginTop: 5, // Adds space from the previous element
  },
  statusText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    backgroundColor: '#f08080',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#c1121f',
    padding: 10,
    borderRadius: 5,
  },
});
