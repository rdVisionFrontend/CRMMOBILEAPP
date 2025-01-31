import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import apiInstance from '../../api';

const BestSellingClosers = ({ dark }) => {
  const [teammates, setTeammates] = useState([]);
  const [liveClosers, setLiveClosers] = useState([]);
  const { userData } = useSelector(state => state.crmUser);
  const userId = userData?.userId;

  useEffect(() => {
    const fetchBestSellingTeammates = async () => {
      try {
        const response = await apiInstance.get(`/team/bestsellingTeammates/${userId}`);
        setTeammates(response.data);
      } catch (error) {
        console.error("Error fetching best selling teammates", error);
      }
    };

    const fetchLiveStatus = async () => {
      try {
        const response = await apiInstance.get(`/user/getLiveTeammates/${userId}`);
        setLiveClosers(response.data);
        console.log("live",response)
      } catch (error) {
        console.error("Error fetching live status", error);
      }
    };
    fetchLiveStatus();
    fetchBestSellingTeammates();
  }, []);

  const checkuserLive = (userName) => {
    return liveClosers.some(closer => closer.firstName === userName.split(" ")[0]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.row, dark && styles.darkRow]}>
      <Text style={[styles.cell, dark && styles.darkText]}>{item.userName}</Text>
      <Text style={[styles.cell, dark && styles.darkText]}>{item.count}</Text>
      <Text style={[
        styles.cell,
        checkuserLive(item.userName) ? styles.online : styles.offline
      ]}>
        {checkuserLive(item.userName) ? "Online" : "Offline"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, dark && styles.darkContainer]}>
      <Text style={[styles.heading, dark && styles.darkText]}>Best Selling Closer</Text>
      
      <View style={[styles.header, dark && styles.darkHeader]}>
        <Text style={[styles.headerText, dark && styles.darkHeaderText]}>Closer Name</Text>
        <Text style={[styles.headerText, dark && styles.darkHeaderText]}>Sales Count</Text>
        <Text style={[styles.headerText, dark && styles.darkHeaderText]}>Status</Text>
      </View>

      {teammates.length > 0 ? (
        <FlatList
          data={teammates}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text style={[styles.noData, dark && styles.darkText]}>No data available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    width:'100%'
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
  darkHeaderText:{

  }
});

export default BestSellingClosers;