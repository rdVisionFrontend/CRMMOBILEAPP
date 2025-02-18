import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';

const EmailView = () => {
  const [emailList, setEmailList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {width} = Dimensions.get('window');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchEmails();
  }, [page, searchQuery]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (!parsedUser?.userId) {
        Alert.alert('Error', 'User ID missing');
        return;
      }

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Error', 'Token Not Found');
        return;
      }

      const response = await axios.post(
        'https://uatbackend.rdvision.tech/fetch-emails',
        {
          userId: parsedUser.userId,
          password: 'RMrd@08052000',
          page,
          pageSize: 10,
          searchQuery,
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (response.data.emailList) {
        if (page === 1) {
          setEmailList(response.data.emailList);
          console.log(response.data.emailList);
        } else {
          setEmailList(prev => [...prev, ...response.data.emailList]);
        }
        setTotalPages(response.data.totalPages?.[0]?.totalPages || 1);
      } else {
        ToastAndroid.show('No emails found', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(query => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setSearchQuery(query);
      setPage(1); // Reset to first page when searching
    }, 500);
  }, []);

  const openModal = email => {
    setSelectedEmail(email);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEmail(null);
  };

  const extractEmailDetails = emailContent => {
    const emailDetails = {};
    const data = emailContent;
    const fromMatch = data.match(/^From:\s*(.*)$/m);
    emailDetails.from = fromMatch ? fromMatch[1].trim() : 'Unknown';
    const subjectMatch = data.match(/^Subject:\s*(.*)$/m);
    emailDetails.subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';

    const dateMatch = data.match(/^Received Date:\s*(.*)$/m);
    emailDetails.receivedDate = dateMatch
      ? dateMatch[1].trim()
      : 'Unknown Date';

    const contentMatch = data.match(/Content:\s*([\s\S]*)/m);
    emailDetails.content = contentMatch ? contentMatch[1].trim() : 'No Content';

    const statusMatch = data.match(/Status:\s*(.*)$/m);
    emailDetails.status = statusMatch ? statusMatch[1].trim() : 'Unknown';

    emailDetails.attachments = emailContent.attachments || [];
    emailDetails.file = emailContent.filesInBytecode || [];

    return emailDetails;
  };
  const formatDate = (receivedDate) => {
    const currentDate = moment(); // Get current date
    const emailDate = moment(receivedDate); // Convert the email received date to moment object
  
    // Check if it's today
    if (emailDate.isSame(currentDate, 'day')) {
      return `Today at ${emailDate.format('hh:mm A')}`;
    }
    
    // Check if it's yesterday
    if (emailDate.isSame(currentDate.subtract(1, 'days'), 'day')) {
      return `Yesterday at ${emailDate.format('hh:mm A')}`;
    }
  
    // For older dates, return the formatted date with time
    return emailDate.format('MMM DD, YYYY [at] hh:mm A'); // Example: "Feb 18, 2025 at 08:30 PM"
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      {/* <TextInput
        style={styles.searchInput}
        placeholder="Search emails"
        onChangeText={debouncedSearch}
        value={searchQuery}
      /> */}

      {/* FlatList for email list */}
      <FlatList
        data={emailList}
        renderItem={({item}) => {
          const emailDetails = extractEmailDetails(item?.emailContent || ''); // Extract email details from the item
          return (
            <TouchableOpacity onPress={() => openModal(item)}>
              <View style={styles.emailItem}>
                <Text style={{fontWeight:700}}> {emailDetails?.subject || 'Unknown'}</Text>
                <Text style={{fontWeight:500}}> {emailDetails?.from || 'Unknown'}</Text>
                <View style={{color:'#2b2d42', position:'absolute', bottom:5 , right:-160,}}>
                    <Text >{formatDate(emailDetails?.receivedDate || 'Unknown')}</Text>
                </View>
                {/* <Text>Date: {emailDetails?.status || 'Unknown'}</Text> */}
                {emailDetails?.status === 'Not Seen' && (
                  <TouchableOpacity style={styles.newButton}>
                    <Text style={styles.newButtonText}>New</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );s
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

      {/* Modal for email details */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          {selectedEmail && (
            <>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.modalSubject}>{selectedEmail.subject}</Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>

                {/* Extract and display the "From" field */}
                <Text>
                  From:{' '}
                  {extractEmailDetails(selectedEmail?.emailContent)?.from ||
                    'Unknown'}
                </Text>

                <Text>
                  Date:{' '}
                  {extractEmailDetails(selectedEmail?.emailContent)
                    ?.receivedDate || 'Unknown'}
                </Text>

                <View style={{width: '100%'}}>
                  <RenderHtml
                    contentWidth={width}
                    source={{
                      html:
                        extractEmailDetails(selectedEmail?.emailContent)
                          ?.content || '',
                    }}
                  />
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'transparent',
  },
  emailItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#caf0f8',
    borderRadius: 8,
    position:'relative'
  },
  emailSubject: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  loadMoreButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#04AA6D',
    marginTop: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  modalSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2980b9',
  },
  closeButton: {
    backgroundColor: 'red',
    position: 'absolute',
    top: 10,
    right: 10,
    height: 30,
    width: 30,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  searchInput: {
    height: 40,
    borderColor: 'transparent',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  noMoreEmails: {
    padding: 10,
    textAlign: 'center',
    color: 'gray',
  },
  newButton: {    
    backgroundColor: '#04AA6D',
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
    width:'20%'
  },
  newButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EmailView;
