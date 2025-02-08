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
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker'; // Import Picker
import DateTimePicker from '@react-native-community/datetimepicker';
import {useSelector} from 'react-redux';
import axios from 'axios';

const StatusModal = ({data, closeModal}) => {
  const {width, height} = Dimensions.get('window'); // Get full screen dimensions
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState(data); // Set default value to ticketStatus
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('date');
  const [selectedDate, setSelectedDate] = useState(null);
  const [callid, setCallId] = useState(12);
  const {userData} = useSelector(state => state.crmUser);

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
      console.log('loacal user', user);
    } catch (error) {
      console.log(error);
    }
  };

  const updateResaponse = async () => {
    console.log('Try to update in negotiation');
    try {
      const formattedDateTime = selectedDate
        ? selectedDate.toISOString().replace('Z', '')
        : null;
      console.log('Date and Time', formattedDateTime);
      console.log('id', data.uniqueQueryId);
      console.log('userId', user.userId);

      const encodedComment = encodeURIComponent(text);
      const url = `https://uatbackend.rdvision.tech/upload/updateTicketResponse/${data.uniqueQueryId}?userId=${user.userId}&ticketStatus=${selectedOption}&comment=${encodedComment}&followUpDateTime=${formattedDateTime}`;
      console.log(url, token);

      setLoading(true);
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyYWphbnByYWphcGF0aTc0M0BnbWFpbC5jb20iLCJpYXQiOjE3MzkwMDcyNzAsImV4cCI6MTczOTA1MDQ3MH0.nTmnhvLUWiUaQL60sqlP6ZiVw2zIZkZPZxxgQ6fX2uEnsy09DHrOEIk17qRac07BipXiLSIx9TkZ-cuuj24ojQ`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Response:', response.data);
      setLoading(false);
      Alert.alert('Status Updated');
      closeModal();
    } catch (error) {
      console.error(
        'Error:',
        error.response ? error.response.data : error.message,
      );
      setLoading(false);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  //   const updatResaponse = async () => {
  //     console.log('clcike');
  //     // const url = `https://uatbackend.rdvision.tech/${apiPath}/updateTicketResponse/${data.uniqueQueryId}?userId=${userData.userId}&ticketStatus=${selectedOption}&comment=${text}&followUpDateTime=${formattedDateTime}`;
  //     // console.log(url)
  //     const response = await axios.post(
  //       `"https://uatbackend.rdvision.tech/upload/updateTicketResponse/ac53bba34ba048cd941968ec82dd78c3?userId=802&ticketStatus=Not_Interested"`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyYWphbnByYWphcGF0aTc0M0BnbWFpbC5jb20iLCJpYXQiOjE3Mzg4MTg3NTQsImV4cCI6MTczODg2MTk1NH0.ewf5GyJADWV19DFwcgZ79cDgdmAq85ArM46qzhz9qLGMXRa-hRNdek1hf8KpBVghW7aXPjcIMJCP2aiung0e5g`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );
  //     console.log(response.data);
  //   };

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
    <View>
      <View style={styles.container}>
        {/* Dropdown for ticket status */}
        <Picker
          selectedValue={selectedOption}
          onValueChange={itemValue => setSelectedOption(itemValue)} // Set the selected value
          style={{backgroundColor: '#bcb8b1'}}>
          {statuses.map(status => (
            <Picker.Item key={status} label={status} value={status} />
          ))}
        </Picker>
        {selectedOption === 'Follow' && (
          <View>
            <Text style={{fontWeight: 'bold', marginTop: 5}}>Select Date</Text>
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
            <View style={{width: '100%'}}>
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
                  justifyContent: 'space-between',
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
                  style={styles.timeBtnDate}
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

        <View style={{backgroundColor: '', width: '100%'}}>
          <Text style={{fontSize: 15, fontWeight: 'bold', marginTop: 10}}>
            Your Message :
          </Text>
          <TextInput
            multiline={true}
            numberOfLines={8}
            onChangeText={e => setText(e)}
            value={text}
            style={styles.textInput}
            placeholder="Write something"
            required
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={closeModal}
            style={styles.closeButtonContainer}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={updateResaponse}
            disabled={loading}
            style={styles.updateButtonContainer}>
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    borderWidth: 1,
  },
  timeBtnDate: {
    backgroundColor: '#8e9aaf',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  timeBtnText: {
    color: '#FFFF',
    fontWeight: 600,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
    height: 60,
    marginTop: 10,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '99%',
    marginTop: 10,
  },
  closeButtonContainer: {
    backgroundColor: '#ba181b',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  closeButtonText: {
    color: '#FFFF',
    fontWeight: 600,
  },
  updateButtonContainer: {
    backgroundColor: '#008000',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  updateButtonText: {
    color: '#FFFF',
    fontWeight: 600,
  },
});

export default StatusModal;
