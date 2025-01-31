import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
import apiInstance from '../../api';
import {useSelector} from 'react-redux';

const LiveCalendar = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [calendarDataUploaded, setCalendarDataUploaded] = useState([]);
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const {userData} = useSelector(state => state.crmUser);

  useEffect(() => {
    if (userData && userData.userId) {
      console.log('User ID available:', userData.userId); // Debug log to check userData
      fetchData();
      fetchUploadedData();
    } else {
      console.log('User ID is not available.'); // Debug log if userData is missing
    }
  }, []); // Ensure the effect runs when userData changes

  const fetchData = async () => {
    try {
      const response = await apiInstance.get(
        `/third_party_api/ticket/followUpByDate/${userData.userId}`,
      );
      setCalendarData(response.data.response);
      console.log('Calendar Data 1:', response.data.response); // Debug log for calendar data
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchUploadedData = async () => {
    try {
      const response = await apiInstance.get(
        `/upload/followUpByDate/${userData.userId}`,
      );
      setCalendarDataUploaded(response.data.response);
      console.log('Calendar Data 2:', response.data.response); // Debug log for uploaded data
    } catch (error) {
      console.error('Error fetching uploaded calendar data:', error);
    }
  };

  useEffect(() => {
    const markedDates = {};
    const combinedEvents = {};
    const today = moment().format('YYYY-MM-DD');

    // Process calendar events
    [...calendarData, ...calendarDataUploaded].forEach(item => {
      const date = moment(item.date).format('YYYY-MM-DD');
      const type = item.hasOwnProperty('comments') ? 'live' : 'uploaded';

      if (!combinedEvents[date]) {
        combinedEvents[date] = [];
      }

      combinedEvents[date].push({
        title:
          type === 'live'
            ? `Live Follow-up: ${item['no of tickets']}`
            : `ABC Follow-up: ${item['no of tickets']}`,
        comments: item.comments?.split(',') || [],
        type,
      });

      markedDates[date] = {
        dots: [
          {
            color: type === 'live' ? '#f44336' : '#ff9800',
            size: 15, // Increase the dot size
          }
        ],
        selected: date === today,
        selectedColor: '#2196F3',
      };
      
    });

    // Always highlight today's date
    markedDates[today] = {
      ...markedDates[today],
      selected: true,
      selectedColor: '#2196F3',
      customStyles: {
        container: {
          backgroundColor: '#2196F3',
          borderRadius: 8,
        },
        text: {
          color: 'white',
          fontWeight: 'bold',
        },
      },
    };

    setEvents(markedDates);
  }, [calendarData, calendarDataUploaded]);

  const handleDayPress = day => {
    console.log('Selected day:', day);

    // Filter events for the selected date
    const selectedEvents = calendarData.filter(
      event => moment(event.date).format('YYYY-MM-DD') === day.dateString,
    );

    setSelectedDate(day.dateString);
    setSelectedEvents(!selectedEvents);
  };

  const handleEventPress = event => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const handleNavigate = () => {
    setIsModalVisible(false);
    // if () {
    //   navigation.navigate('InNegotiation', {
    //     date: moment(selectedDate).format('YYYY-MM-DD')
    //   });
    // }
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
      <Calendar
        markingType={'multi-dot'}
        markedDates={events} // Use dynamically generated events
        onDayPress={handleDayPress} // Directly pass the function
        theme={theme}
        style={styles.calendar}
        current={moment().format('YYYY-MM-DD')}
      />

      <ScrollView style={styles.eventsContainer}>
        {calendarData.map((event, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.eventItem,
              {backgroundColor: event.type === 'live' ? '#f44336' : '#463f3a'},
            ]}>
            <Text style={styles.eventTitle}>{`➤ ${event.comments}`}</Text>
            <Text style={styles.eventTitle}>{`➤ ${event.date}`}</Text>
            <Text
              style={styles.eventTitle}>{`➤ ${event['no of tickets']}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.eventsContainer}>
        {calendarDataUploaded.map((event, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.eventItem,
              {backgroundColor: event.type === 'live' ? '#f44336' : '#ff7d00'},
            ]}>
            <Text style={styles.eventTitle}>{`➤ ${event.comments}`}</Text>
            <Text style={styles.eventTitle}>{`➤ ${event.date}`}</Text>
            <Text
              style={styles.eventTitle}>{`➤ ${event['no of tickets']}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedEvent?.title || 'Ticket Journey'}
            </Text>

            <ScrollView style={styles.commentsContainer}>
              {selectedEvent?.comments?.length > 0 ? (
                selectedEvent.comments.map((comment, index) => {
                  const [text, name] = comment.split('(');
                  const formattedName = name ? name.split(')')[0] : 'Unknown';

                  return (
                    <View key={index} style={styles.commentItem}>
                      <Text style={styles.commentName}>{formattedName}:</Text>
                      <View style={styles.commentBubble}>
                        <Text>{text.trim()}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text>No comments available.</Text>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleNavigate}>
                <Text style={styles.buttonText}>Go to Tickets</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  calendar: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventsContainer: {
    marginTop: 20,
    flex: 1,
  },
  eventItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  commentsContainer: {
    marginBottom: 15,
  },
  commentItem: {
    marginBottom: 15,
  },
  commentName: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  commentBubble: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default LiveCalendar;
