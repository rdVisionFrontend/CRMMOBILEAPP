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
          paddingVertical: 10,
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
        animationType="slide"
        transparent={true}
        visible={isModalVisible} // Ensure modal only shows when true
        onRequestClose={() => setIsModalVisible(false)} // Handle Android back press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close Button (X) */}
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 15,
                zIndex: 10,
                padding: 5, // Increased tap area
              }}>
              <Text style={{fontSize: 22, fontWeight: 'bold', color: '#333'}}>
                ✕
              </Text>
            </TouchableOpacity>

            {selectedEvents.length > 0 ? (
              <ScrollView
                ref={scrollViewRef}
                style={styles.eventsContainer}
                contentContainerStyle={{paddingBottom: 20}}>
                {selectedEvents.map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.eventItem,
                      {
                        backgroundColor: event.hasOwnProperty('comments')
                          ? '#f4a261'
                          : '#ff9800',
                      },
                    ]}
                    onPress={() => setSelectedEvent(event)}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>
                        {live ? 'Live Followup' : ''}
                      </Text>
                      <View style={{marginLeft: 10, marginTop: 5}}>
                        <BlinkingCircle />
                      </View>
                    </View>
                    <View style={{marginTop: 10}}>
                      <Text
                        style={styles.eventText}>{`➤ ${event.comments}`}</Text>
                      <Text style={styles.eventText}>{`➤ ${event.date}`}</Text>
                      <Text
                        style={
                          styles.eventText
                        }>{`➤ ${event['no of tickets']}`}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={{textAlign: 'center', marginVertical: 20}}>
                No events for this date.
              </Text>
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
    marginVertical: 10,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 15},
  modalScrollView: {maxHeight: 400, marginBottom: 10},
  modalEventItem: {marginBottom: 10},
  modalEventText: {fontSize: 16, color: '#333'},
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {color: 'white', fontWeight: '500'},
  eventHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '70%',
    height: 50,
  },
});

export default LiveCalendar;
