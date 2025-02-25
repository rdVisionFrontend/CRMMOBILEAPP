import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';
import Modal from 'react-native-modal';
import {useFocusEffect} from '@react-navigation/native';
import CountryFlagTable from './Flag';
import Email from './Email';
import Nodata from './NoData';
import apiInstance from '../../api';
import StatustModal from './StatustModal';
import TicketInvoiceModal from '../screens/TicketRaiseInvoiceModal/TicketInvoiceModal';
import TicketHistoryModal from './TicketHistroyModal';
import EmailScreen from '../screens/EmailCompose/EmailScreen';

const {width, height} = Dimensions.get('window');

const Ticket = () => {
  const [ticketData, setTicketData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [query, setquerry] = useState('');
  const [readTicket, setReadTicket] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [statusmodal, setStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [emailData, setEmailData] = useState();
  const [statusData, setStatusData] = useState();
  const [invoiceData, setInvoiceData] = useState();
  const [tokenLoacal, setTokenLocal] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleModal = message => {
    setquerry(message);
    setIsModalVisible(!isModalVisible);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTicket();
      loadTicketFromLocalstorage();
    }, [statusmodal, emailModal]),
  );

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
      const response = await apiInstance.get(
        '/third_party_api/ticket/getAllNewTickets',
      );
      console.log('Tickets:', response.data);
      setTicketData(response.data);
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
        return '#0fc4f4';
    }
  };

  const formatMobile = mobile => {
    if (mobile && mobile.length >= 4) {
      const firstTwo = mobile && mobile.slice(0, 2);
      const lastTwo = mobile && mobile.slice(-3);
      const hiddenPart = '*'.repeat(mobile.length - 4);
      return `${firstTwo}${hiddenPart}${lastTwo}`;
    }
    return 'Invalid Number';
  };

  const formateEmail = email => {
    if (email && email.length >= 4) {
      const firstTwo = email.slice(0, 2);
      const lastTwo = email.slice(-2);
      const hiddenPart = '#'.repeat(email.length - 15);
      return `${firstTwo}${hiddenPart}${lastTwo}`;
    }
    return 'Invalid Number';
  };

  const openEmailModal = item => {
    console.log('email:', item);
    setEmailData(item);
    setEmailModal(true);
  };

  const openStatusModal = item => {
    console.log('email:', item);
    setStatusData(item);
    setStatusModal(true);
  };

  const closeEmailModal = () => {
    fetchTicket();
    setEmailModal(false);
    setStatusModal(false);
    setInvoiceModal(false);
  };

  const InvoiceCreate = item => {
    console.log(item);
    setInvoiceModal(true);
    setInvoiceData(item);
    setStatusModal(false);
  };

  const openCallLog = mobileNumber => {
    const phoneNumber = `tel:${mobileNumber}`;
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Failed to open call log: ', err);
      Alert.alert('Error', 'Unable to open call log.');
    });
  };

  const copyToClipboard = text => {
    Clipboard.setString(text);
  };

  const openWhatsApp = () => {
    const phoneNumber = '7460033731';
    const message = 'Hello, I need help!';
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

  const [ticketHisModal, setTicketHisModal] = useState(false);
  const [selectedTicketInfo, setSelectedTicketInfo] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const openTicketHistroy = ticketId => {
    console.log(ticketId);
    setTicketHisModal(true);
    setModalVisible(true);
    fetchTicket();
    setSelectedTicketInfo(ticketId);
  };

  const closeTicketJourney = () => {
    setTicketHisModal(false);
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <Text>{loading ? 'Loading...' : ''}</Text>
          {ticketData && ticketData.length > 0 ? (
            ticketData?.map((item, index) => (
              <View key={index} style={styles.item}>
                <View
                  style={[
                    styles.header,
                    {backgroundColor: getStatusColor(item.ticketstatus)},
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
                      <Text style={{fontSize: width * 0.03}}>
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
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        paddingVertical: 2,
                        paddingHorizontal: 4,
                        borderRadius: 5,
                        fontWeight: 800,
                        fontSize: 18,
                      }}
                      onPress={() => openStatusModal(item)}>
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
                      <TouchableOpacity
                        onPress={() => openTicketHistroy(item.uniqueQueryId)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/9195/9195785.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openWhatsApp()}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/15707/15707820.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openCallLog(item.senderMobile)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/455/455705.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEmailModal(item)}>
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/9068/9068642.png',
                          }}
                          style={styles.icon}
                        />
                      </TouchableOpacity>
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
                  {expanded === item.uniqueQueryId && (
                    <View style={styles.content}>
                      <Text style={styles.contentText}>
                        Email: {formateEmail(item.senderEmail)}
                      </Text>
                      <Text style={styles.contentText}>
                        Mobile: {formatMobile(item.senderMobile)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Nodata />
            </View>
          )}
        </View>
      </ScrollView>

      {/* {emailModal && <Email data={emailData} closeModal={closeEmailModal} />} */}
      {/* {emailModal && <EmailScreen />} */}
      <Modal
        visible={emailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEmailModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <EmailScreen data={emailData} />
            {/* Close Button for Modal */}
            <TouchableOpacity
              onPress={closeEmailModal}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
        {invoiceModal && (
          <TicketInvoiceModal  data={invoiceData} closeModal={closeEmailModal} />
        )}
    

      {statusmodal && (
        <StatustModal
          data={statusData}
          closeModal={closeEmailModal}
          live={'live'}
        />
      )}

      <TicketHistoryModal
        ticketId={selectedTicketInfo}
        isVisible={modalVisible}
        closeTicketHisModal={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  emailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  item: {
    marginBottom: 10,
    paddingHorizontal: width * 0.03,
  },
  header: {
    padding: width * 0.04,
    backgroundColor: '#007BFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'relative',
  },
  indexText: {
    position: 'absolute',
    top: -6,
    left: -6,
    borderRadius: 50,
    height: width * 0.06,
    width: width * 0.06,
    textAlign: 'center',
    lineHeight: width * 0.06,
    backgroundColor: '#ffd8be',
    color: 'black',
    fontWeight: 'bold',
    fontSize: width * 0.03,
  },
  DoneIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    borderRadius: 50,
    height: width * 0.07,
    width: width * 0.07,
    textAlign: 'center',
    lineHeight: width * 0.06,
    color: 'black',
    fontWeight: 'bold',
    fontSize: width * 0.03,
  },
  headerText: {
    fontSize: width * 0.04,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  content: {
    padding: width * 0.04,
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  contentText: {
    fontSize: width * 0.035,
    color: '#333',
  },
  icon: {
    width: width * 0.07,
    height: width * 0.07,
    alignSelf: 'center',
    marginBottom: 20,
  },
  dropdownButton: {
    borderRadius: 5,
    fontSize: width * 0.03,
    padding: 2,
    color: '#fff',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width:'100%'
  },
  modalContainer: {
    width: '95%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Ticket;
