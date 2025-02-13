import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BestSellingClosers = ({ dark }) => {
  const [teammates, setTeammates] = useState([]);
  const [liveClosers, setLiveClosers] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch token and user from AsyncStorage
  useEffect(() => {
    const fetchTokenAndUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (storedToken && parsedUser) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          console.error('Token or user not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchTokenAndUser();
  }, []);

  // Fetch best-selling teammates and live status when token and user are available
  useEffect(() => {
    if (token && user) {
      fetchBestSellingTeammates();
      fetchLiveStatus();
    }
  }, [token, user]);

  const fetchBestSellingTeammates = async () => {
    try {
      const response = await axios.get(
        `https://uatbackend.rdvision.tech/team/bestsellingTeammates/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setTeammates(response.data);
    } catch (error) {
      console.error('Error fetching best-selling teammates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveStatus = async () => {
    try {
      const response = await axios.get(
        `https://uatbackend.rdvision.tech/user/getLiveTeammates/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLiveClosers(response.data);
    } catch (error) {
      console.error('Error fetching live status:', error);
    }
  };

  const checkUserLive = (userName) => {
    return liveClosers.some(
      (closer) => closer.firstName === userName.split(' ')[0],
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.row, dark && styles.darkRow]}>
      <Text style={[styles.cell, dark && styles.darkText]}>
        {item.userName}
      </Text>
      <Text style={[styles.cell, dark && styles.darkText]}>{item.count}</Text>
      <Text
        style={[
          styles.cell,
          checkUserLive(item.userName) ? styles.online : styles.offline,
        ]}>
        {checkUserLive(item.userName) ? 'Online' : 'Offline'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, dark && styles.darkContainer]}>
      <Text style={[styles.heading, dark && styles.darkText]}>
        Best Selling Closers
      </Text>

      <View style={[styles.header, dark && styles.darkHeader]}>
        <Text style={[styles.headerText, dark && styles.darkHeaderText]}>
          Closer Name
        </Text>
        <Text style={[styles.headerText, dark && styles.darkHeaderText]}>
          Sales Count
        </Text>
        <Text style={[styles.headerText, dark && styles.darkHeaderText]}>
          Status
        </Text>
      </View>

      {loading ? (
        <Text style={[styles.noData, dark && styles.darkText]}>Loading...</Text>
      ) : teammates.length > 0 ? (
        <FlatList
          data={teammates}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text style={[styles.noData, dark && styles.darkText]}>
          No data available
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {  

    backgroundColor: '#fff',
    elevation: 2,
    width: '100%',
    paddingHorizontal:10,    
  },
  darkContainer: {
    backgroundColor: '#343a40',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  darkHeader: {
    backgroundColor: '#0056b3',
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#dee2e6',
  },
  darkRow: {
    backgroundColor: '#454d55',
    borderColor: '#6c757d',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
  online: {
    color: 'green',
    fontWeight: 'bold',
  },
  offline: {
    color: 'red',
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    padding: 16,
    color: '#6c757d',
  },
  darkHeaderText: {},
});

export default BestSellingClosers;