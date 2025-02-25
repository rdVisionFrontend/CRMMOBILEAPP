import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  ToastAndroid,
  Dimensions,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import EmailScreen from './EmailScreen';

const EmailView = () => {
  const [emailList, setEmailList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {width} = Dimensions.get('window');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false); // Modal state
  const isMounted = useRef(true); // Use a ref to track if component is mounted

  useEffect(() => {
    return () => {
      isMounted.current = false; // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [page]);

  const composeEmail = () => {
    console.log('Opening modal');
    setModalVisible(true);
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (!parsedUser?.userId) {
        if (isMounted.current) {
          Alert.alert('Error', 'User ID missing');
        }
        return;
      }

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        if (isMounted.current) {
          Alert.alert('Error', 'Token Not Found');
        }
        return;
      }

      const response = await axios.post(
        'https://uatbackend.rdvision.tech/fetch-emails',
        {
          userId: parsedUser.userId,
          password: 'RMrd@08052000',
          page,
          pageSize: 10,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (response.data.emailList) {
        if (page === 1) {
          setEmailList(response.data.emailList);
        } else {
          setEmailList(prev => [...prev, ...response.data.emailList]);
        }
        setTotalPages(response.data.totalPages?.[0]?.totalPages || 1);
      } else {
        if (isMounted.current) {
          ToastAndroid.show('No emails found', ToastAndroid.SHORT);
        }
      }
    } catch (error) {
      console.error(error);
      if (isMounted.current) {
        Alert.alert('Error', 'Failed to fetch emails. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const formatDate = receivedDate => {
    const currentDate = moment();
    const emailDate = moment(receivedDate);

    if (emailDate.isSame(currentDate, 'day')) {
      return `Today at ${emailDate.format('hh:mm A')}`;
    }

    if (emailDate.isSame(currentDate.subtract(1, 'days'), 'day')) {
      return `Yesterday at ${emailDate.format('hh:mm A')}`;
    }

    return emailDate.format('MMM DD, YYYY [at] hh:mm A');
  };

  return (
    <View style={styles.container}>
      {selectedEmail ? (
        <EmailDetails
          email={selectedEmail}
          onBack={() => setSelectedEmail(null)}
        />
      ) : (
        <FlatList
          data={emailList}
          renderItem={({item}) => {
            const emailDetails = extractEmailDetails(item?.emailContent || '');
            return (
              <TouchableOpacity onPress={() => setSelectedEmail(item)}>
                <View style={styles.emailItem}>
                  <Text style={styles.emailSubject}>
                    {emailDetails?.subject || 'No Subject'}
                  </Text>
                  <Text style={styles.emailFrom}>
                    {emailDetails?.from || 'Unknown'}
                  </Text>
                  <Text style={styles.emailDate}>
                    {formatDate(emailDetails?.receivedDate || 'Unknown')}
                  </Text>
                  {emailDetails?.status === 'Not Seen' && (
                    <View style={styles.newTag}>
                      <Text style={styles.newTagText}>New</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) =>
            `${item?.id || index}-${item?.subject || 'unknown'}`
          }
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" /> : null
          }
          onEndReached={() => {
            if (page < totalPages) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={composeEmail} // Open modal on press
      >
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/7710/7710448.png',
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <Modal
     
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)} // Close modal on request
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <EmailScreen/>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                console.log('Closing modal');
                setModalVisible(false);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Email Details Component
const EmailDetails = ({email, onBack}) => {
  const {width} = Dimensions.get('window');
  const emailDetails = extractEmailDetails(email?.emailContent || '');

  return (
    <ScrollView contentContainerStyle={styles.detailsContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.detailsSubject}>
        {emailDetails?.subject || 'No Subject'}
      </Text>
      <Text style={styles.detailsInfo}>
        <Text style={styles.label}>From:</Text>{' '}
        {emailDetails?.from || 'Unknown'}
      </Text>
      <Text style={styles.detailsInfo}>
        <Text style={styles.label}>Date:</Text>{' '}
        {emailDetails?.receivedDate || 'Unknown'}
      </Text>

      <View style={styles.emailContent}>
        <RenderHtml
          contentWidth={width}
          source={{html: emailDetails?.content || ''}}
        />
      </View>
    </ScrollView>
  );
};

// Extract Email Details Function
const extractEmailDetails = emailContent => {
  const emailDetails = {};
  const data = emailContent;

  const fromMatch = data.match(/^From:\s*(.*)$/m);
  emailDetails.from = fromMatch ? fromMatch[1].trim() : 'Unknown';

  const subjectMatch = data.match(/^Subject:\s*(.*)$/m);
  emailDetails.subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';

  const dateMatch = data.match(/^Received Date:\s*(.*)$/m);
  emailDetails.receivedDate = dateMatch ? dateMatch[1].trim() : 'Unknown Date';

  const contentMatch = data.match(/Content:\s*([\s\S]*)/m);
  emailDetails.content = contentMatch ? contentMatch[1].trim() : 'No Content';

  const statusMatch = data.match(/Status:\s*(.*)$/m);
  emailDetails.status = statusMatch ? statusMatch[1].trim() : 'Unknown';

  return emailDetails;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    position: 'relative',
    zIndex:2
  },
  emailItem: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#caf0f8',
    borderRadius: 8,
  },
  emailSubject: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emailFrom: {
    fontSize: 14,
    color: '#555',
  },
  emailDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  newTag: {
    backgroundColor: '#04AA6D',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  newTagText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 15,
  },
  detailsSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsInfo: {
    fontSize: 14,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  emailContent: {
    marginTop: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#2980b9',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    borderRadius: 50,
    backgroundColor: '#3a86ff',
    height: 50,
    width: 50,
    justifyContent: 'center', // Center image vertically
    alignItems: 'center', // Center image horizontally
  },
  image: {
    height: 20,
    width: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', // Adjust opacity to make sure it's visible
    zIndex: 9999, // Ensure modal is on top
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#e63946',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmailView;
