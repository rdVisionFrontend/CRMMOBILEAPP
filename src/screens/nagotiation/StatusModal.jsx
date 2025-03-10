import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSelector } from 'react-redux';
import { useAuth } from '../../Authorization/AuthContext';

const Email = ({ data, closeModal }) => {
  const { width, height } = Dimensions.get('window'); // Get full screen dimensions
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState(data.ticketStatus); // Set default value to ticketStatus
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('date');
  const [selectedDate, setSelectedDate] = useState(null);
  const [callId, setCallId] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const {calApiCalander, setCallApiCalander} = useAuth();


  useEffect(() => {
    fetchToken();
  }, []); // Fetch token and user only once on mount

  const fetchToken = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      setToken(token);
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user);
      setUser(parsedUser);
    } catch (error) {
      console.log(error);
    }
  };
  const updateTicketResponse = async () => {
    console.log("Try to updated asdas")
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const userData = JSON.parse(storedUser);
      const formattedDateTime = selectedDate
        ? selectedDate.toISOString().replace('Z', '')
        : null;
      console.log(formattedDateTime)
      const apiPath = data.uniqueQueryId.length < 15 ? "third_party_api/ticket" : "upload";
      console.log("PAth", apiPath)
      console.log("uniqueQueryId", data.uniqueQueryId)
      const queryParam = formattedDateTime ? `&followUpDateTime=${formattedDateTime}` : "";
      setLoading(true);
      const url = `https://uatbackend.rdvision.tech/${apiPath}/updateTicketResponse/${data.uniqueQueryId}?userId=${userData.userId}&ticketStatus=${selectedOption}&comment=${text}${queryParam}`;
      console.log(url, token);
      const response = await axios.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response.data);
      setLoading(false);
      setCallApiCalander(!calApiCalander)
      Alert.alert('Status Updated');
      closeModal();
    } catch (error) {
      console.log('Error:', error.response,);
      setLoading(false);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };



  const statuses = [
    'New',
    'Follow',
    'Sale',
    'Not_Pickup',
    'Wrong_Number',
    'Not_Intersted',
    'Not_Connected',
    'Place_with_other',
    'hang_up',
  ];

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false);
    setDate(currentDate);
    // If it's a valid future date, set it
    if (currentDate > new Date()) {
      setSelectedDate(currentDate);
    } else {
      Alert.alert('Please select a future date.');
    }
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View style={[styles.container, { width: width, height: height }]}>
      <View style={styles.footer}>
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            Email: {data.email}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            Name: {(data.firstName || data.senderName) + " " + (data.lastName || " ")}
          </Text>
        </View>
        {/* Dropdown for ticket status */}

        <Picker
          selectedValue={selectedOption}
          onValueChange={itemValue => setSelectedOption(itemValue)} // Set the selected value
          style={styles.picker}>
          {statuses.map(status => (
            <Picker.Item key={status} label={status} value={status} />
          ))}
        </Picker>
        {selectedOption === 'Follow' && (
          <View>
            <Text style={{ fontWeight: 'bold' }}>
              Select Follow Up Date and Time
            </Text>
          </View>
        )}

        {selectedOption === 'Follow' && (
          <View
            style={{
              width: '100%',
              backgroundColor: '#edede9',
              padding: 10,
              borderWidth: 0.2,
              borderRadius: 3,
            }}>
            <View style={{ width: '100%' }}>
              {selectedDate && (
                <Text
                  style={{
                    marginTop: 2,
                    marginBottom: 4,
                    textAlign: 'center',
                  }}>{`Time Is: ${selectedDate.toLocaleString()}`}</Text>
              )}
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 10,
                  margin: 10,
                }}>
                <TouchableOpacity
                  style={styles.timeBtnDate}
                  onPress={showDatepicker}>
                  <Text style={styles.timeBtnText}>Select date</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeBtnTime}
                  onPress={showTimepicker}>
                  <Text style={styles.timeBtnText}>Select Time</Text>
                </TouchableOpacity>
              </View>
            </View>

            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                display="default"
                onChange={onChange}
              />
            )}
          </View>
        )}

        <View style={{ backgroundColor: '', width: '100%' }}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 10 }}>
            Your Message :
          </Text>
          <TextInput
            multiline={true}
            numberOfLines={8}
            onChangeText={e => setText(e)}
            value={text}
            style={styles.textInput}
            placeholder="Write something"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={updateTicketResponse} disabled={loading}>
            <Text style={styles.emailButton}>
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 10,
    justifyContent: 'start',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'column', // Change to column to stack the items
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20, // Adjust gap between elements
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#da5552',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 5,
    fontWeight: 'bold'
  },
  emailButton: {
    backgroundColor: '#006400',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 5,
    fontWeight: 'bold'
  },
  picker: {
    width: 100, // Adjust the width of the picker
    marginBottom: 10,
    backgroundColor: '#e5e5e5',
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  textInput: {
    width: '100%', // Full width of the container
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    height: 100, // Adjust height as needed
  },
  timeBtnDate: {
    backgroundColor: '#55c2da',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  timeBtnTime: {
    backgroundColor: '#5dbea3',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  timeBtnText: {
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
});

export default Email;
