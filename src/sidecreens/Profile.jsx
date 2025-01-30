import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Toast} from 'toastify-react-native';
import {useDispatch, useSelector} from 'react-redux';
import Nodata from '../screens/NoData';
import { logout } from '../Redux/features/crmSlice';
import { useAuth } from '../Authorization/AuthContext';

const User = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(0);
  const [token, setToken] = useState(null);
  const [moreinfo, setMoreInfo] = useState(false);
  const {userData, jwtToken, refreshToken} = useSelector(
    state => state.crmUser,
  );
  const dispatch = useDispatch()
  const {setIsAuthenticated}=useAuth()

  const formatTime = timeInSeconds => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleLogout = async ({navigation}) => {
    try {
      // Clear specific keys from AsyncStorage
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      dispatch(logout())
      .then(res=>{
        Alert.alert("You are Logout successfully")
        navigation.navigate('Login');
        setIsAuthenticated(false)
      })
      .cath(err=>{
        Alert.alert("Please  try again")
      })
      Toast.success('You have logged out successfully');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    console.log('redux', userData, jwtToken, refreshToken);

    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          navigation.navigate('Login');
        }
        setToken(token);
        const userData = await AsyncStorage.getItem('user');
        console.log('userDataLocal', userData);

        if (userData) {
          setUser(JSON.parse(userData));
          console.log('fetched');
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchData();

    // Start timer
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [token, userData, jwtToken]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <View style={styles.dataContainer}>
          <>
            {/* Display Current Time */}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: user.imageData
                      ? `data:image/jpeg;base64,${user.imageData}`
                      : 'https://rdvision.tech/src/assets/Images/RD_vision_logo.png',
                  }}
                  style={styles.image}
                />
                {/* Status Dot */}
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: user.onBreak ? 'red' : 'green'},
                  ]}
                />
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                <Text style={styles.infoName}>
                  {' '}
                  {user.firstName} {user.lastName}
                </Text>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <Image
                    style={styles.icon}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/732/732200.png',
                    }}
                  />
                  <Text style={styles.infoEmail}>{user.email}</Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <Image
                    style={styles.icon}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/5585/5585856.png',
                    }}
                  />
                  <Text style={styles.infoPhone}> {user.phoneNumber}</Text>
                </View>
                <Text style={styles.timerText}>
                  Logged In {formatTime(timer)}{' '}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        </View>
      ) : (
        <Nodata />
      )}

      <TouchableOpacity
        onPress={() => setMoreInfo(!moreinfo)}
        style={{
          marginTop: 10,
          backgroundColor: '#807182',
          paddingVertical: 5,
          paddingHorizontal: 8,
          marginBottom: 5,
          borderRadius: 5,
        }}>
        <Text style={{color: '#fff'}}>{moreinfo ? "View Less" : "View More Information"}</Text>
      </TouchableOpacity>

      {/* More informaion */}

      {moreinfo && (
        <View
          style={{
            width: '100%',
            borderWidth: 0.2,
            height: 500,
            borderRadius: 10,
            alignItems: 'center',
            padding: 10,
            backgroundColor: '#fffafb',
            flexDirection:'column ',
            gap:10,
            justifyContent:'flex-start'
          }}>
          <Image
            source={{
              uri: user.imageData
                ? `data:image/jpeg;base64,${user.imageData}`
                : 'https://rdvision.tech/src/assets/Images/RD_vision_logo.png',
            }}
            style={styles.image}
          />
          <Text style={{fontSize:15, fontWeight:'bold'}}>{user.roleDto.roleName}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', gap:50 , width:'100%'}}>
            <Image
              style={{height:40, width:40}}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/506/506185.png',
              }}
            />
            <Text style={{fontSize:20, textTransform:'uppercase'}}>
              {user.firstName} {user.lastName}
            </Text>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', gap:50 , width:'100%'}}>
            <Image
              style={{height:20, width:20}}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/2875/2875435.png',
              }}
            />
            <Text style={{fontSize:12, textTransform:'lowercase', marginLeft:7}}>
              {user.email} 
            </Text>
          </View>

          <View style={{flexDirection: 'row', display:'flex', justifyContent: 'space-between', alignItems:'center', gap:90 , width:'100%'}}>
            <Image
              style={{height:20, width:20}}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/2482/2482985.png',
              }}
            />
            <Text style={{fontSize:20, textTransform:'lowercase', marginLeft:7 , textAlign:'left'}}>
              {user.phoneNumber} 
            </Text>
          </View>

          <View style={{flexDirection:'column', justifyContent:'flex-start', alignItems:'center' , width:'100%', borderWidth:0.5, padding:10, borderColor:'gray', borderRadius:5}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%', marginTop:5}}>
              <Text>Created Date :</Text>
              <Text style={{marginLeft:5}} >{user.createdDate}</Text>
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%', marginTop:5}}>
              <Text>Created By :</Text>
              <Text style={{marginLeft:5}} >{user.createdBy}</Text>
            </View>

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%', marginTop:5}}>
              <Text>Your IP :</Text>
              <Text style={{marginLeft:5}} >{user.systemIp}</Text>
            </View>

          </View>




        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  dataContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 5,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative', // Ensures the status dot can be positioned relative to the image
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
    resizeMode: 'cover',
    borderWidth: 0.5,
    padding: 0,
  },
  statusDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoName: {
    fontSize: 20,
    marginBottom: 5,
    color: '#555',
  },
  icon: {
    height: 20,
    width: 20,
  },
  timerText: {
    marginTop: 5,
  },
  logout: {
    alignSelf: 'center',
    backgroundColor: 'lightRed',
    marginTop: 10,
  },
  logoutText: {
    backgroundColor: '#f15156',
    color: '#fff',
    fontWeight: 'semibold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 15,
  },
});

export default User;
