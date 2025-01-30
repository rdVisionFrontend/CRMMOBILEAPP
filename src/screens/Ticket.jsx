import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';
import Modal from 'react-native-modal';
import CountryFlagTable from './Flag';
import Email from './Email';
import {useDispatch, useSelector} from 'react-redux';
import Nodata from './NoData';
import apiInstance from '../../api';
import StatustModal from './StatustModal';
import InvoiceModal from './InvoiceModal';

const Ticket = () => {
  const [ticketData, setTicketData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [query, setquerry] = useState('');
  const [readTicket, setReadTicket] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [statusmodal, setStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null); // To store selected status
  const [emailData, setEmailData] = useState();
  const [statusData, setStatusData] = useState();
  const [invoiceData, setInvoiceData] = useState();
  const [tokenLoacal, setTokenLocal] = useState(null);
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(state => state.crmUser);

  const dispatch = useDispatch();

  const toggleModal = message => {
    setquerry(message);
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    // console.log("Refresh Tiket")
    fetchTicket();
    loadTicketFromLocalstorage();
  }, [statusmodal, emailModal, dispatch]);

  const loadTicketFromLocalstorage = async () => {
    try {
      const storedIds = await AsyncStorage.getItem('ticket_ids');
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Please Login');
        navigation.navigate('Login');
      }
      if (storedIds) {
        setReadTicket(JSON.parse(storedIds));
        // console.log("Load:",JSON.parse(storedIds))
      } else {
        console.log('No ticket IDs found in local storage');
      }
    } catch (error) {
      console.error('Error loading ticket IDs from local storage:', error);
    }
  };

  const fetchTicket = async () => {
    try {
      setLoading(true);
      // Make API call with token in headers
      const response = await apiInstance.get(
        '/third_party_api/ticket/getAllNewTickets',
      );
      console.log('Tickets:', response.data);
      setTicketData(response.data); // Update ticket data in state
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Alert.alert('Error', 'Failed to fetch tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = async uniqueQueryId => {
    try {
      setExpanded(expanded === uniqueQueryId ? null : uniqueQueryId);
      const existingIds = await AsyncStorage.getItem('ticket_ids');
      let idsArray = existingIds ? JSON.parse(existingIds) : [];
      if (!idsArray.includes(uniqueQueryId)) {
        idsArray.push(uniqueQueryId);
      }
      await AsyncStorage.setItem('ticket_ids', JSON.stringify(idsArray));
      setReadTicket(idsArray);
    } catch (error) {
      console.error('Error storing IDs in local storage:', error);
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'New':
        return '#57cc99';
      case 'Follow':
        return '#ffb3c1';
      case 'Sale':
        return '#7e804b';
      case 'Not_Pickup':
        return '#219ebc';
      case 'Wrong_Number':
        return 'red';
      case 'Not_Intersted':
        return '#aaa1c8';
      case 'Not_Connected':
        return '#936639';
      case 'Place_with_other':
        return '#b5179e';
      case 'hang_up':
        return 'pink';
      default:
        return '#0fc4f4'; // Default color
    }
  };
  // making mobile number
  const formatMobile = mobile => {
    if (mobile && mobile.length >= 4) {
      const firstTwo = mobile && mobile.slice(0, 2); // First two digits
      const lastTwo = mobile && mobile.slice(-3); // Last two digits
      const hiddenPart = '*'.repeat(mobile.length - 4); // Replace the rest with X
      return `${firstTwo}${hiddenPart}${lastTwo}`;
    }
    return 'Invalid Number';
  };
  const formateEmail = email => {
    if (email && email.length >= 4) {
      const firstTwo = email.slice(0, 2); // First two digits
      const lastTwo = email.slice(-2); // Last two digits
      const hiddenPart = '#'.repeat(email.length - 15); // Replace the rest with X
      return `${firstTwo}${hiddenPart}${lastTwo}`;
    }
    return 'Invalid Number'; // Fallback for invalid numbers
  };

  const openEmailModal = item => {
    console.log('email:', item);
    setEmailData(item);
    setEmailModal(true);
  };

  const openStatusModal = (item) => {
    console.log('email:', item);
    setStatusData(item);
    setStatusModal(true);
  };

  const closeEmailModal = () => {
    setEmailModal(false);
    setStatusModal(false);
    setInvoiceModal(false)
  };

  const InvoiceCreate = (item) => {
    console.log(item)
    setInvoiceModal(true)
    setInvoiceData(item)
    setStatusModal(false);
  };
  // open dialer pad

  const openCallLog = mobileNumber => {
    const phoneNumber = `tel:${mobileNumber}`;
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Failed to open call log: ', err);
      Alert.alert('Error', 'Unable to open call log.');
    });
  };

  // for copy amil and phone

  const copyToClipboard = text => {
    Clipboard.setString(text);
  };

  // open whatsapp
  const openWhatsApp = () => {
    const phoneNumber = '7460033731'; // Replace with the desired phone number
    const message = 'Hello, I need help!'; // Optional message

    const url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

    Linking.openURL(url)
      .then(supported => {
        if (!supported) {
          console.log('WhatsApp is not installed on this device');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('Error opening WhatsApp: ', err));
  };

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <Text style={{textAlign: 'center'}}>{loading ? 'Loading' : ' '}</Text>
          {ticketData && ticketData.length > 0 ? (
            ticketData?.map((item, index) => (
              <View key={index} style={styles.item}>
                <View
                  style={[
                    styles.header,
                    {backgroundColor: getStatusColor(item.ticketstatus)}, // Dynamic background color
                  ]}>
                  <Text style={styles.indexText}>{index + 1}</Text>

                  {readTicket &&
                    readTicket.some(ele => ele === item.uniqueQueryId) && (
                      <Image
                        source={{
                          uri: 'https://cdn-icons-png.flaticon.com/128/5290/5290058.png',
                        }}
                        style={styles.DoneIcon}
                      />
                    )}

                  <View
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      gap: 2,
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      paddingHorizontal: 2,
                    }}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}>
                      <Text style={{fontSize: 12}}>
                        {new Date(item.queryTime).toLocaleString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Text>
                      <View
                        style={{display: 'flex', flexDirection: 'row', gap: 4}}>
                        <Text
                          onPress={() => toggleAccordion(item.uniqueQueryId)}
                          style={styles.headerText}>
                          {item.senderName}
                        </Text>
                        <CountryFlagTable
                          key={index}
                          flagName={item.senderCountryIso}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleModal(item.queryMessage)}>
                        <Text style={styles.text}>
                          {item.queryMessage && item.queryMessage.slice(0, 20)}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Main item which toggles the dropdown menu */}
                    <TouchableOpacity onPress={() => openStatusModal(item)}>
                      <Text
                        style={[
                          styles.dropdownButton,
                          {
                            backgroundColor: getStatusColor(
                              selectedStatus || 'New',
                            ),
                          },
                        ]}>
                        {selectedStatus
                          ? ` ${selectedStatus}`
                          : `${item.ticketstatus}`}
                      </Text>
                    </TouchableOpacity>

                    <View
                      style={{
                        display: 'flex',
                        gap: 5,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {/* WhatsApp */}
                      <TouchableOpacity onPress={() => openWhatsApp()}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/15707/15707820.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                      {/* Call */}
                      <TouchableOpacity
                        onPress={() => openCallLog(item.senderMobile)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/455/455705.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>

                      {/* Email */}
                      <TouchableOpacity onPress={() => openEmailModal(item)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/9068/9068642.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                      {/* invoice Icon */}
                      <TouchableOpacity onPress={() => InvoiceCreate(item)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/5270/5270107.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {expanded === item.uniqueQueryId && (
                  <View style={styles.content}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        paddingHorizontal: 10,
                        gap: 5,
                      }}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 5,
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/3059/3059561.png',
                          }}
                          style={{height: 12, width: 12}}
                        />
                        <Text style={styles.contentText}>{` ${formatMobile(
                          item.senderMobile,
                        )}`}</Text>
                      </View>
                      {/* <TouchableOpacity onPress={() => copyToClipboard(item.senderMobile)}>
                                                <Image
                                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/128/1827/1827923.png' }}
                                                    style={styles.iconPaste}
                                                />
                                            </TouchableOpacity> */}
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: 5,
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/732/732200.png',
                          }}
                          style={{height: 10, width: 10}}
                        />
                        <Text style={styles.contentText}>{`${formateEmail(
                          item.senderEmail,
                        )}`}</Text>
                        {/* <TouchableOpacity onPress={() => copyToClipboard(item.senderEmail)}>
                                                    <Image
                                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/1827/1827923.png' }}
                                                        style={styles.iconPaste}
                                                    />
                                                </TouchableOpacity> */}
                      </View>
                    </View>

                    <Text style={styles.contentText}>
                      {item.subject && item.subject.slice(16)}
                    </Text>
                  </View>
                )}

                {isModalVisible && (
                  <Modal isVisible={true}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {query && query.replace(/<br\s*\/?>/gi, '\n')}
                      </Text>
                      <Text
                        style={{
                          backgroundColor: '#da5552',
                          color: '#fff',
                          textAlign: 'center',
                          paddingHorizontal: 20,
                          marginTop: 20,
                        }}
                        onPress={() => toggleModal()}>
                        Ok
                      </Text>
                    </View>
                  </Modal>
                )}
              </View>
            ))
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Nodata />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Email Modal */}
      <View style={styles.emailModal}>
        {emailModal && <Email data={emailData} closeModal={closeEmailModal} />}
      </View>

      {/* Status Modal */}
      <View style={styles.emailModal}>
        {statusmodal && (
          <StatustModal data={statusData} closeModal={closeEmailModal} />
        )}
      </View>

      {/* invoiceModal */}
      <View style={styles.emailModal}>
        {invoiceModal && <InvoiceModal data={invoiceData} closeModal={closeEmailModal} />}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  emailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  item: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: 16,
    backgroundColor: '#007BFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'relative',
  },
  indexText: {
    position: 'absolute',
    top: -6,
    left: -6,
    borderRadius: 50, // Ensures a rounded shape
    height: 25,
    width: 25,
    textAlign: 'center', // Horizontally centers the text
    lineHeight: 25, // Vertically centers the text
    backgroundColor: '#ffd8be',
    color: 'black', // Optional: sets text color
    fontWeight: 'bold', // Optional: makes the text bold
    fontSize: 12, // Optional: adjusts text size
  },
  DoneIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    borderRadius: 50, // Ensures a rounded shape
    height: 30,
    width: 30,
    textAlign: 'center', // Horizontally centers the text
    lineHeight: 25, // Vertically centers the text
    color: 'black', // Optional: sets text color
    fontWeight: 'bold', // Optional: makes the text bold
    fontSize: 12, // Optional: adjusts text size
  },
  headerText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  headerTextTicket: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    fontSize: 12,
  },
  content: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#333',
  },
  icon: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconPaste: {
    width: 15,
    height: 15,
    alignSelf: 'center',
    marginBottom: 20,
  },
  dropdown: {
    position: 'absolute',
    top: 10,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 100,
  },
  dropDownText: {
    backgroundColor: 'lightblue',
    textAlign: 'left',
    marginTop: 5,
    padding: 4,
    borderRadius: 5,
    fontSize: 10,
  },
  dropdownButton: {
    borderRadius: 5,
    fontSize: 12,
    padding: 2,
    color: '#fff',
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303036', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // For shadow effect on Android
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default Ticket;
