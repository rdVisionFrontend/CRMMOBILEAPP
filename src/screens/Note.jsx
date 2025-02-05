import React, {useEffect, useState} from 'react';
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
import {useSelector} from 'react-redux';

const Enotebook = () => {
  const [notes, setNotes] = useState([]);
  const [isOpened, setIsOpened] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dark, setDark] = useState(false);
  const {userData} = useSelector(state => state.crmUser);

  const [noteDetails, setNoteDetails] = useState({
    title: '',
    noteContent: '',
    user: {
      userId: userData.userId,
    },
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleChange = (name, value) => {
    setNoteDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const addNote = async () => {
    try {
      const response = await apiInstance.post('/enote/createNote', noteDetails);
      if (response.status === 201) {
        Alert.alert('Note Saved');
        setNoteDetails({
          title: '',
          noteContent: '',
          user: {
            userId: userData.userId,
          },
        });
        fetchNotes();
        setIsOpened(false); // Close the form after adding a note
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await apiInstance.get(
        `/enote/getallByUser/${userData.userId}`,
      );
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const deleteNote = async (noteId) => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiInstance.delete(`/enote/delete/${noteId}`);
              if (response.data === 'Deleted') {
                Alert.alert('Success', 'Note deleted successfully');
                fetchNotes(); // Refresh the notes list
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  const formatLocalDateTime = dateArray => {
    const [year, month, day, hours, minutes] = dateArray;
    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day}-${monthNames[month - 1]}-${year} ${formattedHours}:${String(
      minutes,
    ).padStart(2, '0')} ${period}`;
  };

  // Filter notes based on search value
  const filteredNotes = notes.filter(note => {
    if (searchValue.length > 0) {
      return note.title.toLowerCase().includes(searchValue.toLowerCase());
    }
    return true; // Return all notes if search value is empty
  });

  const handleAddNote = () => {
    setIsOpened(!isOpened); // Toggle the form visibility
  };

  return (
    <View
      style={[
        styles.container,
        dark ? styles.darkContainer : styles.lightContainer,
      ]}>
      {/* Search Bar */}
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

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Text style={styles.noNotesText}>No notes found!</Text>
      ) : (
        <ScrollView style={styles.notesList}>
          {filteredNotes
            .slice()
            .reverse()
            .map(note => (
              <View
                key={note.noteId}
                style={[
                  styles.noteCard,
                  dark ? styles.darkNoteCard : styles.lightNoteCard,
                ]}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteDate}>
                  Saved on: {formatLocalDateTime(note.date)}
                </Text>
                <View
                  style={[
                    styles.noteContentContainer,
                    dark ? styles.darkBorder : styles.lightBorder,
                  ]}>
                  <Text style={styles.noteContent}>{note.noteContent}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteNote(note.noteId)}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/6861/6861362.png',
                    }}
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      )}

      {/* Add Note Button */}
      <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/2921/2921226.png',
          }}
          style={styles.addNoteIcon}
        />
      </TouchableOpacity>

      {/* Add Note Form */}
      {isOpened && (
        <View
          style={[
            styles.addNoteForm,
            dark ? styles.darkForm : styles.lightForm,
          ]}>
          <Text style={styles.formTitle}>Add a New Note</Text>
          <TextInput
            style={[styles.input, dark ? styles.darkInput : styles.lightInput]}
            placeholder="Note Title"
            placeholderTextColor={dark ? '#aaa' : '#888'}
            value={noteDetails.title}
            onChangeText={text => handleChange('title', text)}
          />
          <TextInput
            style={[
              styles.textArea,
              dark ? styles.darkInput : styles.lightInput,
            ]}
            placeholder="Write your note content here..."
            placeholderTextColor={dark ? '#aaa' : '#888'}
            multiline
            numberOfLines={4}
            value={noteDetails.noteContent}
            onChangeText={text => handleChange('noteContent', text)}
          />
          <TouchableOpacity style={styles.saveButton} onPress={addNote}>
            <Text style={styles.saveButtonText}>Save Note</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
  darkInput: {
    backgroundColor: '#444',
    color: '#fff',
    borderColor: '#555',
  },
  lightInput: {
    backgroundColor: '#fff',
    color: '#000',
    borderColor: '#ddd',
  },
  notesList: {
    flex: 1,
  },
  noNotesText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  noteCard: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  darkNoteCard: {
    backgroundColor: '#333',
  },
  lightNoteCard: {
    backgroundColor: '#fff',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  noteContentContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 5,
  },
  darkBorder: {
    borderColor: '#555',
    borderWidth: 1,
  },
  lightBorder: {
    borderColor: '#ddd',
    borderWidth: 1,
  },
  noteContent: {
    fontSize: 14,
    color: '#000',
  },
  deleteButton: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 14,
  },
  addNoteButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 10,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addNoteIcon: {
    width: 40,
    height: 40,
  },
  addNoteForm: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#ffc8dd',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 2,
  },
  darkForm: {
    backgroundColor: '#333',
  },
  lightForm: {
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
});

export default Enotebook;
