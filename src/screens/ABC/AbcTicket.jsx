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
} from 'react-native';
import {useAuth} from '../../Authorization/AuthContext';
import InvoiceModal from '../InvoiceModal';
import Email from '../Email';
import TicketHistoryModal from '../TicketHistroyModal';
import StatusModal from '../StatustModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UploadedTickets = () => {
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

  useEffect(() => {
    fetchData();
  }, [emailModal, currentPage, invoiceModal]);
  const fetchData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('jwtToken');
      const storedUser = JSON.parse(user);

      console.log('User Data:', storedUser);
   

      const response = await axios.get('https://uatbackend.rdvision.tech/upload/getAssignedTickets', {
        params: {
          userId: storedUser.userId,
          page: currentPage,
          size: 4,
          ticketStatus: 'New',
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
        
      });
      setData(response.data.dtoList);
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
    // Open email client with a new draft
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

  // Example usage
  const uploadDate = [2025, 1, 18]; // Example date array
  const formattedDate = formatDate(uploadDate);

  // Inside JSX
  <Text>{formattedDate}</Text>;
  const [ticketSts, setTicketSts] = useState();

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
            {/* ticket journey */}
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
            {/* email */}
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
            {/* quotation */}
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
            {/* invoice */}
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
            {/* whatsapp */}
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
            {/* call */}
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
      <FlatList
        data={data} // ✅ Filter items with 'New' status
        renderItem={renderItem}
        keyExtractor={item => item.uniqueQueryId}
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination Controls */}
      {!statusmodal && (
        <View style={styles.pagination}>
          {!statusmodal && (
            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === 0 && styles.disabledButton, // Apply disabled style
              ]}
              onPress={() => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1); // Only decrement if currentPage > 0
                }
              }}
              disabled={currentPage === 0} // Disable the button when currentPage is 0
            >
              <Text
                style={[
                  styles.pageText,
                  currentPage === 0 && styles.disabledText, // Apply disabled text style
                ]}>
                Previous
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.pageText}>Page {currentPage + 1}</Text>

          {!statusmodal && (
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => setCurrentPage(currentPage + 1)}>
              <Text style={styles.pageText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.emailModal}>
        {invoiceModal && (
          <InvoiceModal data={data} closeModal={closeEmailModal} />
        )}
      </View>

      <View style={styles.emailModal}>
        {emailModal && <Email data={emailData} closeModal={closeEmailModal} />}
      </View>

      {/* Ticket histroy modal */}
      <TicketHistoryModal
        ticketId={selectedTicketInfo}
        isVisible={modalVisible}
        closeTicketHisModal={() => setModalVisible(false)}
      />
      <View>
        {statusmodal && (
          <StatusModal data={statusmodaldata} closeModal={closeEmailModal} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    padding: 16,
    backgroundColor: '#f5f5f5',
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
    paddingBottom: 20,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 30,
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
  // emailModal: {
  //   paddingHorizontal: 10,
  // },
  emailModal: {
    position: 'absolute',
    top: 0,
    left: 15,
    width:'100%'
  },
  disabledButton: {
    backgroundColor: '#ccc', // Grayed-out background
  },
  disabledText: {
    color: '#888', // Grayed-out text
  },
});

export default UploadedTickets;
