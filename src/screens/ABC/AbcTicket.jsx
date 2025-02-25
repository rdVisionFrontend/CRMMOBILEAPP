import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
  Button,
} from 'react-native';
import {useAuth} from '../../Authorization/AuthContext';
import TicketInvoiceModal from '../TicketRaiseInvoiceModal/TicketInvoiceModal';

import TicketHistoryModal from '../TicketHistroyModal';
import StatusModal from '../StatustModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InvoiceModal from '../InvoiceModal';
import Email from './EmailModal';
import EmailCompose from '../EmailCompose/EmailScreen';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AbcTicket = () => {
  const {userId, dark} = useAuth();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState();
  const [statusmodal, setStatusModal] = useState(false);
  const [statusmodaldata, setStatusModalData] = useState();
  const [emailData, setEmailData] = useState();
  const [hasMoreData, setHasMoreData] = useState(true); // State to track if there is more data

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('jwtToken');
      const storedUser = JSON.parse(user);

      const response = await axios.get(
        'https://uatbackend.rdvision.tech/upload/getAssignedTickets',
        {
          params: {
            userId: storedUser.userId,
            page: currentPage,
            size: 4,
            ticketStatus: 'New',
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setData(response.data.dtoList);

      // Check if there is more data to load
      if (response.data.dtoList.length < 4) {
        setHasMoreData(false); // No more data to load
      } else {
        setHasMoreData(true); // More data is available
      }

      console.log('ABC Data:', response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tickets');
      console.error('Fetch Error:', error);
    }
  };

  const toggleAccordion = ticketId => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  const formatDate = dateArray => {
    const [year, month, day] = dateArray;
    return `${day.toString().padStart(2, '0')}-${month
      .toString()
      .padStart(2, '0')}-${year}`;
  };

  const closeEmailModal = () => {
    fetchData();
    setEmailModal(false);
    setStatusModal(false);
    setInvoiceModal(false);
    setStatusModal(false);
  };

  const InvoiceCreate = item => {
    console.log('ABC', item);
    setData(item);
    setInvoiceModal(true);
    setInvoiceData(item);
    setStatusModal(false);
  };

  const openEmailModal = item => {
    console.log('email:', item);
    setEmailData(item);
    setEmailModal(true);
  };

  const handleEmailButtonPress = () => {
    Linking.openURL('mailto:');
  };

  const openWhatsApp = mobileNumber => {
    const whatsappUrl = `https://wa.me/${mobileNumber}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const openTicketStatus = item => {
    console.log('status', item);
    setStatusModal(true);
    setStatusModalData(item);
    console.log('status data', statusmodaldata);
  };

  const [ticketHisModal, setTicketHisModal] = useState(false);
  const [selectedTicketInfo, setSelectedTicketInfo] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const openTicketHistroy = ticketId => {
    console.log(ticketId);
    setTicketHisModal(true);
    setModalVisible(true);
    setSelectedTicketInfo(ticketId);
  };

  const closeTicketJourney = () => {
    setTicketHisModal(false);
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[styles.card, dark && styles.darkCard]}
      onPress={() => toggleAccordion(item.uniqueQueryId)}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, dark && styles.darkText]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.cardDate, dark && styles.darkText]}>
          {formatDate(item.uploadDate)}
        </Text>

        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
          }}
          style={{width: 30, height: 30}}
        />
      </View>

      <View style={styles.basicInfo}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/15047/15047587.png',
            }}
            style={{width: 18, height: 18, marginRight: 5}}
          />
          <Text style={[styles.infoText, dark && styles.darkText]}>
            {item.email}
          </Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/5585/5585856.png',
            }}
            style={{width: 18, height: 18, marginRight: 5}}
          />

          <Text style={[styles.infoText, dark && styles.darkText]}>
            {item.mobileNumber}
          </Text>
        </View>
      </View>

      {expandedTicketId === item.uniqueQueryId && (
        <View style={styles.expandedContent}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark && styles.darkText]}>
              Status:
            </Text>
            <TouchableOpacity
              style={{backgroundColor: '#f4acb7'}}
              onPress={() => openTicketStatus(item)}>
              <Text
                style={{
                  paddingVertical: 2,
                  paddingHorizontal: 7,
                  fontWeight: 600,
                }}>
                {item.ticketstatus}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark && styles.darkText]}>
              Country:
            </Text>
            <Text style={[styles.detailValue, dark && styles.darkText]}>
              {item.senderCountryIso}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, dark && styles.darkText]}>
              Requirement:
            </Text>
            <Text style={[styles.detailValue, dark && styles.darkText]}>
              {item.productEnquiry}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => openTicketHistroy(item.uniqueQueryId)}
              style={styles.actionButton}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/9195/9195785.png',
                }}
                style={{width: 18, height: 18, marginRight: 5}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEmailButtonPress}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/732/732200.png',
                }}
                style={{width: 18, height: 18, marginRight: 5}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEmailModal(item)}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/4388/4388554.png',
                }}
                style={{width: 18, height: 18, marginRight: 5}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => InvoiceCreate(item)}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/18787/18787177.png',
                }}
                style={{width: 18, height: 18, marginRight: 5}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openWhatsApp(item.mobileNumber)}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/3670/3670051.png',
                }}
                style={{width: 18, height: 18, marginRight: 5}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Linking.openURL(`tel:${item.mobileNumber}`)}>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/5585/5585856.png',
                }}
                style={{width: 18, height: 18, marginRight: 5}}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, dark && styles.darkContainer]}>
      <View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.uniqueQueryId}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Fixed Pagination at the Bottom */}
      {!statusmodal && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === 0 && styles.disabledButton,
            ]}
            onPress={() => {
              if (currentPage > 0) {
                setCurrentPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 0}>
            <Text
              style={[
                styles.pageText,
                currentPage === 0 && styles.disabledText,
              ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>Page {currentPage + 1}</Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              !hasMoreData && styles.disabledButton, // Disable the button if there is no more data
            ]}
            onPress={() => setCurrentPage(currentPage + 1)}
            disabled={!hasMoreData} // Disable the button if there is no more data
          >
            <Text
              style={[
                styles.pageText,
                !hasMoreData && styles.disabledText, // Change text color if the button is disabled
              ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <Modal
        visible={invoiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEmailModal}>
       
            <TicketInvoiceModal data={data} closeModal={closeEmailModal} />
       
      </Modal>

      <Modal
        visible={emailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEmailModal}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            flex: 1,
          }}>
          <View
            style={{
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}>
            {/* <Email data={emailData} closeModal={closeEmailModal} /> */}
            <EmailCompose data={emailData} />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                console.log('Closing modal');
                setEmailModal(false);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TicketHistoryModal
        ticketId={selectedTicketInfo}
        isVisible={modalVisible}
        closeTicketHisModal={() => setModalVisible(false)}
      />

      <Modal
        visible={statusmodal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEmailModal}>
        <View
          style={{
            marginTop: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',

            width: '100%',
          }}>
          <View
            style={{
              width: '110%',
              backgroundColor: 'black',
              borderRadius: 10,
              padding: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}>
            {/* <Email data={emailData} closeModal={closeEmailModal} /> */}
            <StatusModal
              data={statusmodaldata}
              closeModal={closeEmailModal}
              live={'live'}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e3f2fd',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: '#fff',
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  cardDate: {},
  basicInfo: {
    marginVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  expandedContent: {
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#f4a261',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: '30%',
  },
  detailValue: {
    fontSize: 14,
    color: '#444',
    width: '65%',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  pagination: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#e3f2fd',
  },
  pageButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  pageText: {
    color: '#000000',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#888',
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton:{
    backgroundColor:'#ee6055',
    paddingVertical:8,
    borderRadius:10,
    marginHorizontal:30
  }
});

export default AbcTicket;
