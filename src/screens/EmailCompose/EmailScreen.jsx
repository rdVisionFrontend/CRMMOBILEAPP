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

const EmailCompose = ({data, email, body}) => {
  const {width, height} = useWindowDimensions(); // Get dynamic width and height
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isInboxModalVisible, setIsInboxModalVisible] = useState(false);

  useEffect(() => {
    console.log('Email', data);
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

    try {
      const response = await apiInstance.post('/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
    setIsInboxModalVisible(true);
  };

  const closeInboxModal = () => {
    setIsInboxModalVisible(false);
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
      </View>

      <TextInput
        placeholder="To Email"
        value={emailData.toEmail || data.email || data.senderEmail} // Fallback to data.email if emailData.toEmail is empty
        onChangeText={text => handleInputChange('toEmail', text)}
        style={[styles.input, {fontSize: width * 0.04}]}
        keyboardType="email-address"
      />

      <Text style={[styles.label, {fontSize: width * 0.04}]}>Subject</Text>
      <Picker
        selectedValue={isCustomSubject ? 'custom' : emailData.subject}
        onValueChange={handleSubjectChange}
        style={[styles.picker, {fontSize: width * 0.04}]}>
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
          style={[styles.input, {fontSize: width * 0.04}]}
        />
      )}

      <Text style={[styles.label, {fontSize: width * 0.04}]}>Body</Text>
      <TextInput
        multiline
        numberOfLines={6}
        placeholder="Write your email..."
        value={emailData.body || data.comment ||data.subject}
        onChangeText={text => handleInputChange('body', text)}
        style={[styles.bodyInput, {fontSize: width * 0.04}]}
      />

      <TouchableOpacity onPress={handleFileSelection} style={styles.button}>
        <Text style={[styles.buttonText, {fontSize: width * 0.04}]}>
          Attach Files
        </Text>
      </TouchableOpacity>

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

      <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonTextSend, {fontSize: width * 0.04}]}>
            Send Email
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: '5%',
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#e0e1dd',
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    marginBottom: 15,
    paddingVertical: 8,

    borderRadius: 5,
  },
  bodyInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    minHeight: 100,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonTextSend: {
    color: '#000',
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
    backgroundColor: '#7bf1a8',
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
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
