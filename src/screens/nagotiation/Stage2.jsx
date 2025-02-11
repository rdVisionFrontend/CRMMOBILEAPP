import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Picker} from '@react-native-picker/picker';
import Email from './EmailModal';
import Clipboard from '@react-native-clipboard/clipboard';
import TicketHistoryModal from '../TicketHistroyModal';
import StatusModal from './StatusModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Stage2 = () => {
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedItem, setSelectedItem] = useState(4); // Default items per page
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [expandedCardId, setExpandedCardId] = useState(null); // Track expanded card
  const [someDataArray, setSomeDataArray] = useState([]);
  const [localdate, setLocalDate] = useState('');
  const [localtime, setLocalTime] = useState('');
  const [emailmodal, setEmailModal] = useState(false);
  const [statusmodal, setStatusModal] = useState(false);
  const [emaildata, setEmailData] = useState();
  const [stage2, setStage2] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Fetch user and token on component mount
  useEffect(() => {
    const fetchUserAndToken = async () => {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('jwtToken');
      setUser(JSON.parse(user));
      setToken(token);
    };
    fetchUserAndToken();
  }, []);

  // Fetch Stage 2 data when token and user are available
  useEffect(() => {
    if (token && user) {
      fetchStage2Data();
    }
  }, [token, user, emailmodal, statusmodal]);

  const fetchStage2Data = async () => {
    try {
      const response = await axios.post(
        `https://uatbackend.rdvision.tech/third_party_api/ticket/negotiationstagebased`,
        {
          user: user.userId, // Ensure user ID exists
          stage: 2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token from state
          },
        },
      );

      console.log('Stage 2 Data:', response.data);
      setSomeDataArray(response.data);
    } catch (error) {
      console.error(
        'Error fetching Stage 2 data:',
        error.response?.data || error.message,
      );
    }
  };

  const formatToLocalTime = (dateString) => {
    if (!dateString) return "Invalid Date";
  
    let date;
  
    // Handle timestamps (milliseconds since epoch)
    if (!isNaN(dateString) && dateString.length > 10) {
      date = new Date(parseInt(dateString, 10));
    }
    // Handle ISO and standard date formats
    else if (dateString.includes("T")) {
      date = new Date(dateString);
    }
    // Handle formats like "2025-01-11 19:45:57"
    else if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      date = new Date(dateString.replace(" ", "T")); // Convert to valid ISO format
    }
    // Handle time-only formats (e.g., "07:46:44.066826382") - Attach today's date
    else if (dateString.match(/^\d{2}:\d{2}:\d{2}/)) {
      const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD
      date = new Date(`${today}T${dateString.split(".")[0]}`); // Remove microseconds
    }
    // If nothing works, try as a general Date
    else {
      date = new Date(dateString);
    }
  
    // Validate date
    if (isNaN(date.getTime())) return "Invalid Date";
  
    // Convert to local format
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };
  

  const toggleAccordion = index => {
    setExpandedCardId(expandedCardId === index ? null : index);
  };

  const openEmailModal = item => {
    console.log('email:', item);
    setEmailData(item);
    setEmailModal(true);
    setStage2(false);
  };

  const closeEmailModal = () => {
    setEmailModal(false);
    setStage2(true);
    setVisibleModal(false)
    
  };
const [visibleModal,setVisibleModal] = useState(false)
  const openStatusModal = item => {
    console.log('Status:', item);
    setVisibleModal(true)
    setStatusModal(true);
    setEmailData(item);
    setStage2(false);
  };

  const closeStatusModal = () => {
    setStatusModal(false);
    setStage2(true);
  };

  const copyToClipboard = text => {
    Clipboard.setString(text);
  };

  const formatMobile = mobile => {
    if (mobile && mobile.length >= 4) {
      const firstTwo = mobile.slice(0, 2); // First two digits
      const lastTwo = mobile.slice(-3); // Last two digits
      const hiddenPart = '*'.repeat(mobile.length - 4); // Replace the rest with X
      return `${firstTwo}${hiddenPart}${lastTwo}`;
    }
    return 'Invalid Number';
  };

  const formateEmail = email => {
    if (email && email.length >= 4) {
      const firstTwo = email.slice(0, 2); // First two digits
      const lastTwo = email.slice(-2); // Last two digits
      const hiddenPart = '#'.repeat(email.length - 15); // Replace the rest with #
      return `${firstTwo}${hiddenPart}${lastTwo}`;
    }
    return 'Invalid Number'; // Fallback for invalid numbers
  };

  // Filter data based on selected stage
  const filteredData =
    selectedStage === 'All'
      ? someDataArray
      : someDataArray.filter(item => item.status === selectedStage);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / selectedItem);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * selectedItem,
    currentPage * selectedItem,
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

  const [ticketHisModal, setTicketHisModal] = useState(false);
  const [selectedTicketInfo, setSelectedTicketInfo] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const openTicketHistroy = ticketId => {
    console.log(ticketId);
    setTicketHisModal(true);
    setModalVisible(true);
    fetchStage2Data();
    setSelectedTicketInfo(ticketId);
  };
  const closeTicketJourney = () => {
    setTicketHisModal(false);
  };

  return (
    <>
      {stage2 && (
        <ScrollView style={{position: 'relative'}}>
          <View style={styles.filterContainer}>
            <View style={styles.row}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/566/566737.png',
                }}
                style={styles.icon}
              />
              <Picker
                selectedValue={selectedStage}
                onValueChange={itemValue => {
                  setSelectedStage(itemValue);
                  setCurrentPage(1); // Reset to first page
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}>
                <Picker.Item
                  style={styles.labelText}
                  label="All"
                  value={'All'}
                />
                <Picker.Item
                  style={styles.labelText}
                  label="Follow"
                  value={'Follow'}
                />
                <Picker.Item
                  style={styles.labelText}
                  label="Intersted"
                  value={'Intersted'}
                />
                <Picker.Item
                  style={styles.labelText}
                  label="Place With Other"
                  value={'Place_With_Other'}
                />
              </Picker>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '80%',
                gap: 20,
              }}>
              <Text>Select Page:</Text>
              {[2, 4, 6, 8, 10].map(item => (
                <Text
                  key={item}
                  onPress={() => {
                    setSelectedItem(item);
                    setCurrentPage(1); // Reset to first page
                  }}
                  style={{
                    padding: 5,
                    borderRadius: 5,
                    backgroundColor:
                      selectedItem === item ? 'blue' : 'transparent',
                    color: selectedItem === item ? 'white' : 'black',
                    textAlign: 'center',
                  }}>
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
                          item.ticketstatus === 'Follow'
                            ? '#fff3b0'
                            : item.ticketstatus === 'Intersted'
                            ? '#a8dadc'
                            : item.ticketstatus === 'Place_With_order'
                            ? '#3dccc7'
                            : 'white', // Default color if no condition matches
                      },
                    ]}>
                    <View style={{flexDirection: 'column'}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: `90%`,
                          gap: 5,
                        }}>
                        <Text
                          onPress={() => openStatusModal(item)}
                          style={[
                            {
                              borderWidth: 1,
                              borderRadius: 10,
                              fontSize: 12,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                            },
                            item.ticketstatus === 'Follow'
                              ? {backgroundColor: '#fff3b0', color: 'black'}
                              : item.ticketstatus === 'Intersted'
                              ? {backgroundColor: 'orange', color: 'black'}
                              : item.ticketstatus === 'Place_With_order'
                              ? {backgroundColor: 'red', color: 'white'}
                              : {},
                          ]}>
                          {item.ticketstatus}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            marginLeft: 10,
                            fontWeight: 800,
                          }}>
                          {/* {localdate} {localtime} */}
                          {formatToLocalTime(item.queryTime)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: `90%`,
                          gap: 5,
                        }}>
                        <Text
                          onPress={() => toggleAccordion(index)}
                          style={{fontSize: 16}}>
                          {item.senderName}
                        </Text>
                        <View style={{flexDirection: 'row', gap: 10}}>
                          <TouchableOpacity
                            onPress={() =>
                              openTicketHistroy(item.uniqueQueryId)
                            }
                            style={styles.actionButton}>
                            <Image
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/9195/9195785.png',
                              }}
                              style={{width: 20, height: 20, marginRight: 5}}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => openWhatsApp()}>
                            <Image
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/15707/15707820.png',
                              }}
                              style={styles.iconSocial}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => openCallLog(item.senderMobile)}>
                            <Image
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/455/455705.png',
                              }}
                              style={styles.iconSocial}
                            />
                          </TouchableOpacity>
                          <Image
                            source={{
                              uri: 'https://cdn-icons-png.flaticon.com/128/295/295128.png',
                            }}
                            style={styles.iconSocial}
                          />
                          <TouchableOpacity
                            onPress={() => openEmailModal(item)}>
                            <Image
                              source={{
                                uri: 'https://cdn-icons-png.flaticon.com/128/9068/9068642.png',
                              }}
                              style={styles.iconSocial}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {expandedCardId === index && (
                      <View style={styles.accordionContent}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: 5,
                          }}>
                          <Image
                            source={{
                              uri: 'https://cdn-icons-png.flaticon.com/128/2190/2190552.png',
                            }}
                            style={{height: 12, width: 12}}
                          />
                          <Text>{`Comment: ${item.comment || 'N/A'}`}</Text>
                        </View>
                        {/* email  */}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: 5,
                          }}>
                          <Image
                            source={{
                              uri: 'https://cdn-icons-png.flaticon.com/128/732/732200.png',
                            }}
                            style={{height: 10, width: 10}}
                          />
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text> {formateEmail(item.email)} </Text>
                          </View>
                        </View>
                        {/* mobile */}
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: 5,
                          }}>
                          <Image
                            source={{
                              uri: 'https://cdn-icons-png.flaticon.com/128/3059/3059561.png',
                            }}
                            style={{height: 12, width: 12}}
                          />

                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text> {formatMobile(item.mobileNumber)} </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  No data available for the selected stage.
                </Text>
              )
            ) : (
              <Text style={styles.noDataText}>No data available.</Text>
            )}

            {someDataArray &&
              someDataArray.length > 0 &&
              paginatedData.length > 0 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={styles.Next}
                    onPress={handlePrevious}
                    disabled={currentPage === 1}>
                    <Text
                      style={
                        currentPage === 1 ? styles.disabled : styles.button
                      }>
                      Previous
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={styles.Next}
                    onPress={handleNext}
                    disabled={currentPage === totalPages}>
                    <Text
                      style={
                        currentPage === totalPages
                          ? styles.disabled
                          : styles.button
                      }>
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        </ScrollView>
      )}
      {emailmodal && <Email closeModal={closeEmailModal} data={emaildata} />}
      {/* {statusmodal && (
        <StatusModal closeModal={closeStatusModal} data={emaildata} />
      )} */}
      <Modal
        visible={visibleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEmailModal}>
        <View style={styles.modalOverlay}>
          <View>
            <StatusModal closeModal={closeEmailModal} data={emaildata} />
          </View>
        </View>
      </Modal>
      <TicketHistoryModal
        ticketId={selectedTicketInfo}
        isVisible={modalVisible}
        closeTicketHisModal={() => setModalVisible(false)}
      />
    </>
  );
};

export default Stage2;

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
    textAlign: 'center',
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
    textAlign: 'center',
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
    backgroundColor: '#ddd',
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
    paddingVertical: 2,
  },
  accordionContent: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  
});
