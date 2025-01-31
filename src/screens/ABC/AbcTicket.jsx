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
import Icon from 'react-native-vector-icons/FontAwesome';
import {useAuth} from '../../Authorization/AuthContext';
import apiInstance from '../../../api';
import {useSelector} from 'react-redux';
import InvoiceModal from '../InvoiceModal';
import Email from '../Email';

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
  const {userData} = useSelector(state => state.crmUser);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState();
  const [statusmodal, setStatusModal] = useState(false);
  const [emailData, setEmailData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiInstance.get('/upload/getAssignedTickets', {
          params: {userId: userData.userId, page: currentPage, size: 10},
        });
        setData(response.data.dtoList);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch tickets');
      }
    };
    fetchData();
  }, [currentPage]);

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
    setEmailModal(false);
    setStatusModal(false);
    setInvoiceModal(false);
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

  const openWhatsApp = (mobileNumber) => {
    const whatsappUrl = `https://wa.me/${mobileNumber}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  // Example usage
  const uploadDate = [2025, 1, 18]; // Example date array
  const formattedDate = formatDate(uploadDate);

  // Inside JSX
  <Text>{formattedDate}</Text>;

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
            <Text style={[styles.detailValue, dark && styles.darkText]}>
              {item.ticketstatus}
            </Text>
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
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.uniqueQueryId}
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination Controls */}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}>
          <Text style={styles.pageText}>Previous</Text>
        </TouchableOpacity>

        <Text style={[styles.pageText, dark && styles.darkText]}>
          Page {currentPage + 1}
        </Text>

        <TouchableOpacity
          style={styles.pageButton}
          onPress={() => setCurrentPage(currentPage + 1)}>
          <Text style={styles.pageText}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emailModal}>
        {invoiceModal && (
          <InvoiceModal data={data} closeModal={closeEmailModal} />
        )}
      </View>

      <View style={styles.emailModal}>
        {emailModal && <Email data={emailData} closeModal={closeEmailModal} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
   borderWidth:1,
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
  },
  pageButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  pageText: {
    color: '#fff',
    fontSize: 14,
  },
  // emailModal: {
  //   paddingHorizontal: 10,
  // },
  emailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default UploadedTickets;
