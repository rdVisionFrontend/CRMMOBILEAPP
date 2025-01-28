import { StyleSheet, Text, View, Dimensions, TouchableOpacity, TextInput, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message'
import apiInstance from '../../api';


const Email = ({ data, closeModal }) => {
    const { width, height } = Dimensions.get('window'); // Get full screen dimensions
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [text, setText] = useState('');
    const [user, setUserId] = useState(null);
    const [selectedOption, setSelectedOption] = useState(data.ticketStatus); // Set default value to ticketStatus
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState('date');
    const [selectedDate, setSelectedDate] = useState(null);
    const [callid, setCallId] = useState(12)

    useEffect(() => {
        fetchToken();
    }, []); // Fetch token and user only once on mount

    const fetchToken = async () => {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            setToken(token);
            const user = await AsyncStorage.getItem('user');
            const parsedUser = JSON.parse(user);
            setUserId(parsedUser.userId);
        } catch (error) {
            console.log(error);
        }
    };

    const updateEmail = async () => {
        try {
            // Check if selectedDate is valid
            const formattedDateTime = selectedDate ? selectedDate.toISOString().replace('Z', '') : null;

            console.log(formattedDateTime); // Log the formatted or null value

            const params = {
                userId: user,
                ticketStatus: selectedOption,
                comment: text,
                followUpDateTime: formattedDateTime, // Pass null if no date is selected
                call_id: callid,
            };

            console.log("params:", params);
            closeModal()
            setLoading(true)
            const res = await apiInstance.post( `/third_party_api/ticket/updateTicketResponse/${data.uniqueQueryId}`,
                {},
                {
                    params,
                  
                }
            );

            console.log('Response', res);
            setLoading(false)
            // Show success toast
            Toast.success("Status Updated");
            closeModal(); // Close the modal
        } catch (error) {
            console.error('Error:', error);
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
            alert('Please select a future date.');
        }
    };

    const showMode = (currentMode) => {
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
                {/* Dropdown for ticket status */}


                <Picker
                    selectedValue={selectedOption}
                    onValueChange={(itemValue) => setSelectedOption(itemValue)} // Set the selected value
                    style={styles.picker}
                >

                    {statuses.map((status) => (
                        <Picker.Item key={status} label={status} value={status} />
                    ))}

                </Picker>
                {selectedOption === "Follow" && <View >
                    <Text style={{ fontWeight: 'bold' }}>Select Follow Up Date and Time</Text>
                </View>}

                {selectedOption === "Follow" && (

                    <View style={{ width: '100%', backgroundColor: '#edede9', padding: 10, borderWidth: 0.2, borderRadius: 3 }}>
                        <View style={{ width: '100%' }}>
                            {selectedDate && (
                                <Text style={{ marginTop: 2, marginBottom: 4, textAlign: 'center' }} >{`Time Is: ${selectedDate.toLocaleString()}`}</Text>
                            )}
                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10, margin: 10 }}>
                                <TouchableOpacity style={styles.timeBtnDate} onPress={showDatepicker}>
                                    <Text style={styles.timeBtnText}>Select date</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.timeBtnTime} onPress={showTimepicker}>
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
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 10 }}>Your Message :</Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={8}
                        onChangeText={(e) => setText(e)}
                        value={text}
                        style={styles.textInput}
                        placeholder='Write something'
                    />
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={styles.closeButton}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={updateEmail} disabled={loading}>
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
        backgroundColor: "#ffffff",
        padding: 10,
        justifyContent: 'start',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'column', // Change to column to stack the items
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20, // Adjust gap between elements
        width: '100%'
    },
    closeButton: {
        backgroundColor: '#da5552',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 10,
    },
    emailButton: {
        backgroundColor: '#006400',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 10,
    },
    picker: {
        width: 200, // Adjust the width of the picker
        marginBottom: 20,
        backgroundColor: '#e5e5e5',
        borderRadius: 20
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
        paddingHorizontal: 5
    },
    timeBtnTime: {
        backgroundColor: '#5dbea3',
        borderRadius: 3,
        paddingVertical: 2,
        paddingHorizontal: 5
    },
    timeBtnText: {
        borderRadius: 3,
        paddingVertical: 2,
        paddingHorizontal: 5,

    }
});

export default Email;