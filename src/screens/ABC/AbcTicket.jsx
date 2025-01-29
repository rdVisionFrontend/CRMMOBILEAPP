import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import apiInstance from '../../../api';
import {useSelector} from 'react-redux';

const AbcTicket = () => {
  const [User, setUser] = useState([]);
  
  const {userData} = useSelector(state => state.crmUser);

  useEffect(() => {
    fetchData()   
  }, []);

  const fetchData = async () => {
    const response = await apiInstance.get('/user/dropdown', {
      params: {roleId: userData.userId},
    });
    console.log('abc', response);
    setUser(response.data.dtoList);
  };

  return (
    <View>
      <Text>AbcTicket</Text>
    </View>
  );
};

export default AbcTicket;

const styles = StyleSheet.create({});
