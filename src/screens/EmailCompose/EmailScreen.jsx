import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Modal,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiInstance from '../../../api';
import GetAllEmail from './GetAllEmail';

const EmailCompose = ({autoClose, email, body}) => {
  const {width} = useWindowDimensions(); // Get dynamic width
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isInboxModalVisible, setIsInboxModalVisible] = useState(false); // State for modal visibility

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = async () => {
    const storedUser = await AsyncStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
  };

  const predefinedSubjects = [
    'Meeting Reminder',
    'Project Update',
    'Invoice Attached',
    'Follow-Up',
  ];

  const [emailData, setEmailData] = useState({
    toEmail: email || '',
    subject: '',
    body: body || '',
  });

  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const handleInputChange = (field, value) => {
    setEmailData({...emailData, [field]: value});
  };

  const handleSubjectChange = value => {
    if (value === 'custom') {
      setIsCustomSubject(true);
      setEmailData({...emailData, subject: ''});
    } else {
      setIsCustomSubject(false);
      setEmailData({...emailData, subject: value});
    }
  };

  const handleFileSelection = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      setAttachments([...attachments, ...results]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled file picker.');
      } else {
        console.error(err);
      }
    }
  };

  const removeAttachment = index => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  const handleSubmit = async () => {
    if (emailData.subject.length === 0) {
      Alert.alert('Subject is required');
      return;
    }

    setLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append('toEmail', emailData.toEmail);
    formData.append('subject', emailData.subject);
    formData.append('body', emailData.body);
    formData.append('userId', user.userId);

    attachments.forEach(file => {
      formData.append('attachments', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });

    // Log the FormData for debugging
    console.log('Form Data:', formData);

    try {
      const response = await apiInstance.post('/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Log the response to inspect
      console.log('Response from API:', response);
      Alert.alert('Success', 'Email sent successfully');
      setEmailData({
        toEmail: email || '',
        subject: '',
        body: body || '',
      });
      setAttachments([]);
      setTimeout(() => {
        setIsInboxModalVisible(true);
      }, 4000);
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInbox = () => {
    setIsInboxModalVisible(true); // Open the modal
  };

  const closeInboxModal = () => {
    setIsInboxModalVisible(false); // Close the modal
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={[styles.title, {fontSize: width * 0.05}]}>
          Compose Email
        </Text>
        <TouchableOpacity
          onPress={handleInbox}
          style={{backgroundColor: 'gray', padding: 5, borderRadius: 5}}>
          <Text style={{fontSize: 16}}>Inbox ➡️</Text>
        </TouchableOpacity>
      </View>

      {/* To Email */}
      <TextInput
        placeholder="To Email"
        value={emailData.toEmail}
        onChangeText={text => handleInputChange('toEmail', text)}
        style={styles.input}
        keyboardType="email-address"
      />

      {/* Subject */}
      <Text style={styles.label}>Subject</Text>
      <Picker
        selectedValue={isCustomSubject ? 'custom' : emailData.subject}
        onValueChange={handleSubjectChange}
        style={styles.picker}>
        <Picker.Item label="Select a subject" value="" />
        {predefinedSubjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
        <Picker.Item label="Custom Subject" value="custom" />
      </Picker>

      {isCustomSubject && (
        <TextInput
          placeholder="Enter your subject"
          value={emailData.subject}
          onChangeText={text => handleInputChange('subject', text)}
          style={styles.input}
        />
      )}

      {/* Body */}
      <Text style={styles.label}>Body</Text>
      <TextInput
        multiline
        numberOfLines={6}
        placeholder="Write your email..."
        value={emailData.body}
        onChangeText={text => handleInputChange('body', text)}
        style={styles.bodyInput}
      />

      {/* Attachments */}
      <TouchableOpacity onPress={handleFileSelection} style={styles.button}>
        <Text style={styles.buttonText}>Attach Files</Text>
      </TouchableOpacity>

      {/* Show Attachments */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {attachments.map((file, index) => (
            <View key={index} style={styles.attachment}>
              {file.type.includes('image') ? (
                <Image source={{uri: file.uri}} style={styles.imagePreview} />
              ) : (
                <Text style={styles.attachmentText}>📎 {file.name}</Text>
              )}
              <TouchableOpacity
                onPress={() => removeAttachment(index)}
                style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Send Button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Email</Text>
        )}
      </TouchableOpacity>

      {/* Inbox Modal */}
      <Modal
        visible={isInboxModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeInboxModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inbox</Text>
            <ScrollView>
              <GetAllEmail />
            </ScrollView>
            <TouchableOpacity
              onPress={closeInboxModal}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#e0e1dd',
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 8,
    fontSize: 16,
    width: '100%',
  },
  bodyInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
    marginBottom: 15,
    textAlignVertical: 'top',
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  attachmentsContainer: {
    marginBottom: 15,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  imagePreview: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 60,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default EmailCompose;
