import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
import apiInstance from '../../api';

const LiveCalendar = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [calendarDataUploaded, setCalendarDataUploaded] = useState([]); 
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [live, setLive] = useState(false);
  const [showclander, setShowCalnader] = useState(true);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // Prevents state update after unmount

    const fetchTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        if (isMounted) {
          setToken(storedToken);
          setUser(parsedUser);
        }

        if (parsedUser) {
          await fetchData(parsedUser.userId);
          await fetchUploadedData(parsedUser.userId);
        }
      } catch (error) {
        console.error('Error fetching token/user:', error);
      }
    };
    fetchTokenAndData();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchData = async userId => {
    try {
      const response = await apiInstance.get(
        `/third_party_api/ticket/followUpByDate/${userId}`,
      );
      setCalendarData(response.data.response);
      console.log('Live Events:', response.data.response);
      setLive(true);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchUploadedData = async userId => {
    try {
      const response = await apiInstance.get(
        `/upload/followUpByDate/${userId}`,
      );
      setCalendarDataUploaded(response.data.response);
      console.log('Uploaded Events:', response.data.response);
    } catch (error) {
      console.error('Error fetching uploaded data:', error);
    }
  };

  useEffect(() => {
    const markedDates = {};
    const today = moment().format('YYYY-MM-DD');

    [...calendarData, ...calendarDataUploaded].forEach(item => {
      const date = moment(item.date).format('YYYY-MM-DD');
      const type = item.hasOwnProperty('comments') ? 'live' : 'uploaded';

      if (!markedDates[date]) {
        markedDates[date] = {dots: []};
      }

      markedDates[date].dots.push({
        color: type === 'live' ? '#f44336' : '#ff9800',
        size: 15,
      });

      markedDates[date].selected = date === today;
      markedDates[date].selectedColor = '#2196F3';
    });

    markedDates[today] = {
      ...markedDates[today],
      selected: true,
      selectedColor: '#2196F3',
      customStyles: {
        container: {backgroundColor: '#2196F3', borderRadius: 8},
        text: {color: 'white', fontWeight: 'bold'},
      },
    };

    setEvents(markedDates);
  }, [calendarData, calendarDataUploaded]);

  const handleDayPress = day => {
    console.log('Selected day:', day);
    const selectedLiveEvents = calendarData.filter(
      event => moment(event.date).format('YYYY-MM-DD') === day.dateString,
    );

    const selectedUploadedEvents = calendarDataUploaded.filter(
      event => moment(event.date).format('YYYY-MM-DD') === day.dateString,
    );

    setSelectedDate(day.dateString);
    setSelectedEvents([...selectedLiveEvents, ...selectedUploadedEvents]);
    setIsModalVisible(true);

    // Scroll to the top of the ScrollView
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({x: 0, y: 0, animated: true});
    }
  };

  const theme = {
    backgroundColor: '#fff',
    calendarBackground: '#fff',
    textSectionTitleColor: '#333',
    dayTextColor: '#333',
    todayTextColor: '#333',
    selectedDayTextColor: '#fff',
    selectedDayBackgroundColor: '#2196F3',
    arrowColor: '#333',
    monthTextColor: '#333',
    todayBackgroundColor: '#2196F3',
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontWeight: 700,
          fontSize: 20,
          paddingTop: 24,
          marginLeft: 10,
        }}>
        Calander
        <Text
          style={{fontSize: 15, marginLeft: 10}}
          onPress={() => setShowCalnader(!showclander)}>
          {`${showclander ? '(Hide)' : '(View)'}`}
        </Text>
      </Text>
      {showclander && (
        <Calendar
          markingType={'multi-dot'}
          markedDates={events}
          onDayPress={handleDayPress}
          theme={theme}
          style={styles.calendar}
          current={moment().format('YYYY-MM-DD')}
        />
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.card}>
            {/* Close Button (X) */}
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Modal Title */}
            <Text style={styles.modalTitle}>Events on {selectedDate}</Text>

            {selectedEvents.length > 0 ? (
              <ScrollView
                ref={scrollViewRef}
                style={styles.eventsContainer}
                contentContainerStyle={{paddingBottom: 20}}>
                {selectedEvents.map((event, index) => (
                  <View key={index} style={styles.eventCard}>
                    <Text style={styles.eventTitle}>
                      {event.hasOwnProperty('comments')
                        ? 'Live Followup'
                        : 'Uploaded Followup'}
                    </Text>
                    {/* <View style={{marginLeft: 10, marginTop: 5, height:20}}>
                      <BlinkingCircle />
                    </View> */}
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventText}>➤ {event.comments}</Text>
                      <Text style={styles.eventText}>➤ {event.date}</Text>
                      <Text style={styles.eventText}>
                        ➤ {event['no of tickets']}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noEventsText}>No events for this date.</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Blinking Circle Component
const BlinkingCircle = () => {
  const sizeAnim = useRef(new Animated.Value(10)).current; // Initial size

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sizeAnim, {
          toValue: 20, // Larger size
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(sizeAnim, {
          toValue: 15, // Smaller size
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    );

    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, [sizeAnim]);

  return (
    <Animated.View
      style={{
        height: sizeAnim,
        width: sizeAnim,
        borderRadius: sizeAnim.interpolate({
          inputRange: [15, 30],
          outputRange: [7.5, 15],
        }),
        backgroundColor: 'green',
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: '#fff', width: '100%'},
  calendar: {
    borderRadius: 10,
    elevation: 3,
    marginVertical: 15,
    marginHorizontal: 15,
    backgroundColor: '#e9ecef',
    padding: 5,
  },
  eventsContainer: {marginTop: 20, paddingHorizontal: 5},
  eventItem: {padding: 15, borderRadius: 8, marginBottom: 10},
  eventTitle: {color: 'white', fontSize: 18, fontWeight: '500'},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent dark overlay
  },
  card: {
    width: '90%',
    backgroundColor: '#BCF2F6', // Modern gradient blue
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 8,
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
    color:'#001d3d'
  },
  eventsContainer: {
    maxHeight: 300,
    width: '100%',
  },
  eventCard: {
    backgroundColor: '#FFF2F2', // Vibrant warm contrast
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    borderBottomWidth: 1,
    borderBottomColor: '#22dff6',
    paddingBottom: 5,
  },
  eventDetails: {
    marginTop: 10,
  },
  eventText: {
    color: 'black',
    fontSize: 16,
  },
  noEventsText: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    marginVertical: 20,
  },
  
});

export default LiveCalendar;
