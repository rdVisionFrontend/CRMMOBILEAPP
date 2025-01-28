import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import Email from './EmailModal'
import StatusModal from './StatusModal'
import Clipboard from '@react-native-clipboard/clipboard';
import CountryFlagTable from '../Flag';
import apiInstance from '../../../api';

const Stage1 = ({someData}) => {
    const [selectedStage, setSelectedStage] = useState('All');
    const [selectedItem, setSelectedItem] = useState(4); // Default items per page
    const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
    const [expandedCardId, setExpandedCardId] = useState(null); // Track expanded card
    const { userData, jwtToken } = useSelector((state) => state.crmUser);
    const [someDataArray, setSomeDataArray] = useState([]);
    const [localdate, setLocalDate] = useState('');
    const [localtime, setLocalTime] = useState('');
    const [emailmodal, setEmailModal] = useState(false)
    const [statusmodal, setStatusModal] = useState(false)
    const [emaildata, setEmailData] = useState()
    const [stage1, setStage1] = useState(true) 
    const [loading , setLoading] = useState(false)




    useEffect(() => {
        console.log("redux User:", userData.userId)
        console.log("redux token:", jwtToken)
        console.log("data :", someData)
        fetchStage1Data()


        const formatDate = () => {
            console.log(someDataArray.map((ele) => ele.followUpDateTime));
            const formattedDates = someDataArray.map((ele) => {
                const [year, month, day, hour, minute] = ele.followUpDateTime;
                const date = new Date(year, month - 1, day, hour, minute);
                const formattedDate = date.toLocaleDateString('en-US', {
                    weekday: 'short', // Mon, Tue, Wed, etc.
                    year: 'numeric',
                    month: 'long', // Full month name (e.g., January, February)
                    day: 'numeric',
                });
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
                return { date: formattedDate, time: formattedTime };
            });
            setLocalDate(formattedDates[0]?.date);
            setLocalTime(formattedDates[0]?.time);
        };
        formatDate()

    }, [])



    const fetchStage1Data = async () => {      
        try {
            setLoading(true);     
            // Make the API call
            const response = await apiInstance.post('/third_party_api/ticket/negotiationstagebased', {
                user: userData.userId, // Use userId directly (ensure it’s defined)
                stage: 1,
            });    
            console.log("Stage 1 data fetched successfully");
            console.log("Response:", response); // Log the response data
    
            setSomeDataArray(response.data); // Set fetched data into state
        } catch (error) {
            console.error("Error fetching data:", error); // Log any errors
        } finally {
            setLoading(false); // Ensure loading state is set to false
        }
    };
    

    const toggleAccordion = (index) => {
        setExpandedCardId(expandedCardId === index ? null : index);
    };

    // open Email 

    const openEmailModal = (item) => {
        console.log("email:", item)
        setEmailData(item)
        setEmailModal(true)
        setStage1(false)
    }

    const closeEmailModal = () => {
        Alert.alert("xf")
        setEmailModal(false)
        setStage1(true)

    }

    const openStatusModal = (item) => {
        console.log("Status:", item)
        setStatusModal(true)
        setEmailData(item)
        setStage1(false)
    }

    const closeStatusModal = () => {
        setStatusModal(false)
        setStage1(true)
    }

    // copy clipboard
    const copyToClipboard = (text) => {
        Clipboard.setString(text);

    };

    const formatMobile = (mobile) => {
        if (mobile && mobile.length >= 4) {
            const firstTwo = mobile.slice(0, 2); // First two digits
            const lastTwo = mobile.slice(-3); // Last two digits
            const hiddenPart = '*'.repeat(mobile.length - 4); // Replace the rest with X
            return `${firstTwo}${hiddenPart}${lastTwo}`;
        }
        return 'Invalid Number';
    };
    const formateEmail = (email) => {
        if (email && email.length >= 4) {
            const firstTwo = email.slice(0, 2); // First two digits
            const lastTwo = email.slice(-2); // Last two digits
            const hiddenPart = '#'.repeat(email.length - 15); // Replace the rest with X
            return `${firstTwo}${hiddenPart}${lastTwo}`;
        }
        return 'Invalid Number'; // Fallback for invalid numbers
    };





    // Filter data based on selected stage
    const filteredData = selectedStage === 'All'
        ? someDataArray
        : someDataArray.filter(item => item.status === selectedStage);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / selectedItem);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * selectedItem,
        currentPage * selectedItem
    );

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };



    return (
        <>
            {stage1 && <ScrollView style={{ position: 'relative' }}>
                <View style={styles.filterContainer}>
                    <View style={styles.row}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/128/566/566737.png' }}
                            style={styles.icon}
                        />
                        <Picker
                            selectedValue={selectedStage}
                            onValueChange={(itemValue) => {
                                setSelectedStage(itemValue);
                                setCurrentPage(1); // Reset to first page
                            }}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                        >
                            <Picker.Item style={styles.labelText} label="All" value={'All'} />
                            <Picker.Item style={styles.labelText} label="Not Pickup" value={'Not_Pickup'} />
                            <Picker.Item style={styles.labelText} label="Wrong Number" value={'Wrong_Number'} />
                            <Picker.Item style={styles.labelText} label="Hangup" value={'hang_up'} />
                        </Picker>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '80%', gap: 20 }}>
                        <Text>Select Page:</Text>
                        {[2, 4, 6, 8, 10].map((item) => (
                            <Text
                                key={item}
                                onPress={() => {
                                    setSelectedItem(item);
                                    setCurrentPage(1); // Reset to first page
                                }}
                                style={{
                                    padding: 5,
                                    borderRadius: 5,
                                    backgroundColor: selectedItem === item ? 'blue' : 'transparent',
                                    color: selectedItem === item ? 'white' : 'black',
                                    textAlign: 'center'
                                }}
                            >
                                {item}
                            </Text>
                        ))}
                    </View>
                </View>

                <View style={styles.dataContainer}>
                    {someDataArray && someDataArray.length > 0 ? (
                        paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dataCard,
                                        {
                                            backgroundColor:
                                                item.ticketstatus === 'Not_Pickup' ? 'pink' :
                                                    item.ticketstatus === 'Wrong_Number' ? 'orange' :
                                                        item.ticketstatus === 'Hang_Up' ? 'red' :
                                                            'white', // Default color if no condition matches
                                        },
                                    ]}
                                >
                                    <View style={{ flexDirection: 'column' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: `90%`, gap: 5 }}>
                                            <Text
                                                onPress={() => openStatusModal(item)}
                                                style={[
                                                    {
                                                        borderWidth: 0.5,
                                                        borderRadius: 10,
                                                        fontSize: 12,
                                                        paddingHorizontal: 4,
                                                    },
                                                    item.ticketstatus === 'Not_Pickup'
                                                        ? { backgroundColor: 'pink', color: 'black' }
                                                        : item.ticketstatus === 'Wrong_Number'
                                                            ? { backgroundColor: 'orange', color: 'black' }
                                                            : item.ticketstatus === 'Hang_Up'
                                                                ? { backgroundColor: 'red', color: 'white' }
                                                                : {}
                                                ]}
                                            >
                                                {item.ticketstatus}
                                            </Text>
                                            <Text style={{ fontSize: 11, marginLeft: 10 }}>{localdate} {localtime}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: `90%`, gap: 5 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                <Text onPress={() => toggleAccordion(index)} style={{ fontSize: 16 }}>{item.senderName}</Text>
                                              
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                <TouchableOpacity onPress={() => openWhatsApp()}>
                                                    <Image
                                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/15707/15707820.png' }}
                                                        style={styles.iconSocial}
                                                    />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => openCallLog(item.senderMobile)}>
                                                    <Image
                                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/455/455705.png' }}
                                                        style={styles.iconSocial}
                                                    />
                                                </TouchableOpacity>
                                                <Image
                                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/128/295/295128.png' }}
                                                    style={styles.iconSocial}
                                                />
                                                <TouchableOpacity onPress={() => openEmailModal(item)}>
                                                    <Image
                                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/9068/9068642.png' }}
                                                        style={styles.iconSocial}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                    {expandedCardId === index && (
                                        <View style={styles.accordionContent}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }}>
                                                <Image
                                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/128/2190/2190552.png' }}
                                                    style={{ height: 12, width: 12 }}
                                                />
                                                <Text>{`Comment: ${item.comment || 'N/A'}`}</Text>

                                            </View>
                                            {/* email  */}
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }}>

                                                <Image
                                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/128/732/732200.png' }}
                                                    style={{ height: 10, width: 10 }}
                                                />
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text> {formateEmail(item.email)} </Text>
                                                    {/* <TouchableOpacity onPress={() => copyToClipboard(item.email)}>
                                                        <Image
                                                            source={{ uri: 'https://cdn-icons-png.flaticon.com/128/1827/1827923.png' }}
                                                            style={{ height: 14, width: 14, marginLeft: 5 }}
                                                        />
                                                    </TouchableOpacity> */}
                                                </View>
                                            </View>
                                            {/* mobile */}
                                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 }}>
                                                <Image
                                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/128/3059/3059561.png' }}
                                                    style={{ height: 12, width: 12 }}
                                                />

                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text> {formatMobile(item.mobileNumber)} </Text>
                                                    {/* <TouchableOpacity onPress={() => copyToClipboard(item.mobileNumber)}>
                                                        <Image
                                                            source={{ uri: 'https://cdn-icons-png.flaticon.com/128/1827/1827923.png' }}
                                                            style={{ height: 14, width: 14, marginLeft: 5 }}
                                                        />
                                                    </TouchableOpacity> */}
                                                </View>

                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No data available for the selected stage.</Text>
                        )
                    ) : (
                        <Text style={styles.noDataText}>No data available.</Text>
                    )}

                    {someDataArray && someDataArray.length > 0 && paginatedData.length > 0 && (
                        <View style={styles.pagination}>
                            <TouchableOpacity style={styles.Next} onPress={handlePrevious} disabled={currentPage === 1}>
                                <Text style={currentPage === 1 ? styles.disabled : styles.button}>Previous</Text>
                            </TouchableOpacity>
                            <Text style={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </Text>
                            <TouchableOpacity style={styles.Next} onPress={handleNext} disabled={currentPage === totalPages}>
                                <Text style={currentPage === totalPages ? styles.disabled : styles.button}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>}
            {emailmodal && <Email closeModal={closeEmailModal} data={emaildata} />}
            {statusmodal && <StatusModal closeModal={closeStatusModal} data={emaildata} />}
        </>
    );
};

export default Stage1;

const styles = StyleSheet.create({
    filterContainer: {
        paddingHorizontal: 4,
        backgroundColor: '#f9f7f3',
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginVertical: 2,

    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffe5ec',

    },
    icon: {
        height: 15,
        width: 15,
        marginRight: 10,
    },
    iconSocial: {
        height: 20,
        width: 20,
    },
    pickerItem: {
        textAlign: 'center'
    },
    picker: {
        width: 200,
        height: 60,
        borderWidth: 0.5,
        borderColor: 'gray',
    },
    smallText: {
        fontSize: 12,
    },
    labelText: {
        fontSize: 12,
        alignSelf: 'center',
        paddingHorizontal: 5,
        textAlign: 'center'
    },
    dataContainer: {
        marginTop: 5,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 10,
    },
    dataCard: {
        margin: 10,
        padding: 10,
        borderRadius: 5,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
    },
    button: {
        fontSize: 16,
        color: 'blue',
    },
    disabled: {
        fontSize: 16,
        color: 'gray',
    },
    pageInfo: {
        fontSize: 12,
    },
    Next: {
        backgroundColor: '#90e0ef',
        paddingHorizontal: 8,
        alignSelf: 'center',
        paddingVertical: 2
    },
    accordionContent: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },



});