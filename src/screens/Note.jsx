import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import apiInstance from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from '../Authorization/AuthContext';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Enotebook = () => {
  const [notes, setNotes] = useState([]);
  const [isOpened, setIsOpened] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dark, setDark] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [noteDetails, setNoteDetails] = useState({
    title: '',
    noteContent: '',
    user: { userId: '' },
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setNoteDetails(prevDetails => ({
            ...prevDetails,
            user: { userId: parsedUser.userId },
          }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (noteDetails.user.userId) {
      fetchNotes(noteDetails.user.userId);
    }
  }, [noteDetails.user.userId]);

  const fetchNotes = useCallback(async userId => {
    if (!userId) return;
    try {
      const response = await apiInstance.get(`/enote/getallByUser/${userId}`);
      setNotes(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, []);

  const handleChange = (name, value) => {
    setNoteDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const addNote = async () => {
    if (!noteDetails.title.trim()) {
      Alert.alert('Please enter a note title.');
      return;
    }
    if (!noteDetails.noteContent.trim()) {
      Alert.alert('Please enter note content.');
      return;
    }
    try {
      const authToken = await AsyncStorage.getItem('jwtToken');
      if (!authToken) {
        setIsAuthenticated(false);
        Alert.alert('Error', 'Authentication token is missing.');
        return;
      }

      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        Alert.alert('Error', 'User data not found.');
        return;
      }

      const user = JSON.parse(storedUser);
      if (!user.userId) {
        Alert.alert('Error', 'User ID is missing.');
        return;
      }
      // if(searchValue.length<1){
      //   Alert.alert("Please Fill all Field")
      //   return;
      // }
      const response = await axios.post(
        'https://uatbackend.rdvision.tech/enote/createNote',
        {
          ...noteDetails,
          userId: user.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Note Saved');
        setNotes(prevNotes => [...prevNotes, response.data]);
        setNoteDetails({
          title: '',
          noteContent: '',
          user: { userId: user.userId },
        });
        fetchNotes(user.userId);
        setIsOpened(false);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', error.response?.data?.message || error.message);
    }
  };

  const deleteNote = async noteId => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiInstance.delete(
                `/enote/delete/${noteId}`,
              );
              if (response.data === 'Deleted') {
                Alert.alert('Success', 'Note deleted successfully');
                setNotes(notes.filter(note => note.noteId !== noteId));
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data || error.message);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleAddNote = () => {
    setIsOpened(!isOpened);
  };

  const formatDate = dateArray => {
    if (!Array.isArray(dateArray) || dateArray.length < 6)
      return 'Invalid Date';

    const [year, month, day, hour, minute, second] = dateArray; // Extract values

    // Create a Date object (Note: month is 0-based in JS, so subtract 1)
    const date = new Date(year, month - 1, day, hour, minute, second);

    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date

    const formattedDay = date.getDate();
    const formattedMonth = date
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase();
    const formattedYear = date.getFullYear();
    const formattedHours = date.getHours() % 12 || 12; // Convert 24h to 12h format
    const formattedMinutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two-digit minutes
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${formattedDay}-${formattedMonth}-${formattedYear} ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <View
      style={[
        styles.container,
        dark ? styles.darkContainer : styles.lightContainer,
      ]}>
      <View
        style={[
          styles.searchContainer,
          dark ? styles.darkContainer : styles.lightContainer,
        ]}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/954/954591.png',
          }}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            dark ? styles.darkInput : styles.lightInput,
          ]}
          placeholder="Search notes by title..."
          placeholderTextColor={dark ? '#aaa' : '#888'}
          value={searchValue}
          onChangeText={text => setSearchValue(text)}
        />
      </View>

      {filteredNotes.length === 0 ? (
        <Text style={styles.noNotesText}>No notes found!</Text>
      ) : (
        <ScrollView style={styles.notesList}>
          {[...filteredNotes].reverse().map(note => (
            <View
              key={note.noteId}
              style={[
                styles.noteCard,
                dark ? styles.darkNoteCard : styles.lightNoteCard,
              ]}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDate}>
                Saved on: {formatDate(note.date)}
              </Text>
              <Text style={styles.noteContent}>{note.noteContent}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNote(note.noteId)}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/6861/6861362.png',
                  }}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/2921/2921226.png',
          }}
          style={styles.addNoteIcon}
        />
      </TouchableOpacity>

      {isOpened && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.addNoteForm,
              dark ? styles.darkForm : styles.lightForm,
            ]}>
            <TouchableOpacity onPress={()=>setIsOpened(false)}>
              <AntDesign name='close' color={'red'} size={20}
                style={{ position: 'relative', top: -15, left: 270 }} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, dark ? styles.darkInput : styles.lightInput]}
              placeholder="Note Title"
              value={noteDetails.title}
              onChangeText={text => handleChange('title', text)}
            />
            <TextInput
              style={[
                styles.textArea,
                dark ? styles.darkInput : styles.lightInput,
              ]}
              placeholder="Write your note content here..."
              multiline
              numberOfLines={4}
              value={noteDetails.noteContent}
              onChangeText={text => handleChange('noteContent', text)}
            />
            <View style={{alignItems: 'center'}}>
            <TouchableOpacity style={styles.saveButton} onPress={addNote}>
              <Text style={styles.saveButtonText}>Save Note</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, },
  darkContainer: { backgroundColor: '#000' },
  lightContainer: { backgroundColor: '#ced4da' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 18
  },
  searchIcon: { width: 20, height: 20, marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16 },
  notesList: { flex: 1 },
  noteCard: { padding: 10, borderRadius: 10, marginBottom: 16, backgroundColor: '#ffffff' },
  noteTitle: { fontSize: 16, fontWeight: 'bold' },
  noteDate: { fontSize: 12, color: '#666', marginBottom: 8 },
  noteContent: { marginTop: 8 },
  deleteButton: { alignItems: 'flex-end' },
  addNoteButton: { position: 'absolute', bottom: 80, right: 20 },
  addNoteIcon: { width: 40, height: 40 },
  /* Overlay with Slate Background */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(108, 122, 137, 0.7)', // Slate with 70% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteForm: {
    position: 'absolute',
    bottom: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: '#bfdbf7',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  darkForm: {
    backgroundColor: '#222',
  },

  input: {
    height: 40,
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    borderRadius: 8,
  },

  textArea: {
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    textAlignVertical: 'top',
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: '#007bff',
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Enotebook;
