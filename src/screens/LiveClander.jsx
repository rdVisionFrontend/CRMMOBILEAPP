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
  const [selectedEvents, setSelectedEvents] = useState([]); // Holds selected events
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const {userData} = useSelector(state => state.crmUser);

  useEffect(() => {
    if (userData && userData.userId) {
      console.log('User ID available:', userData.userId);
      fetchData();
      fetchUploadedData();
    } else {
      console.log('User ID is not available.');
    }
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiInstance.get(
        `/third_party_api/ticket/followUpByDate/${userData.userId}`,
      );
      setCalendarData(response.data.response);
      console.log('Calendar Data 1:', response.data.response);
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
      console.log('Calendar Data 2:', response.data.response);
    } catch (error) {
      console.error('Error fetching uploaded calendar data:', error);
    }
  };

  useEffect(() => {
    const markedDates = {};
    const today = moment().format('YYYY-MM-DD');

    [...calendarData, ...calendarDataUploaded].forEach(item => {
      const date = moment(item.date).format('YYYY-MM-DD');
      const type = item.hasOwnProperty('comments') ? 'live' : 'uploaded';

      if (!markedDates[date]) {
        markedDates[date] = { dots: [] };
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

  const handleDayPress = (day) => {
    console.log('Selected day:', day);

    const selectedLiveEvents = calendarData.filter(
      event => moment(event.date).format('YYYY-MM-DD') === day.dateString
    );

    const selectedUploadedEvents = calendarDataUploaded.filter(
      event => moment(event.date).format('YYYY-MM-DD') === day.dateString
    );

    setSelectedDate(day.dateString);
    setSelectedEvents([...selectedLiveEvents, ...selectedUploadedEvents]);
  };

  const handleEventPress = event => {
    setSelectedEvent(event);
    setIsModalVisible(true);
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
        markedDates={events}
        onDayPress={handleDayPress}
        theme={theme}
        style={styles.calendar}
        current={moment().format('YYYY-MM-DD')}
      />

      {selectedEvents.length > 0 && (
        <ScrollView style={styles.eventsContainer}>
          {selectedEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.eventItem,
                {backgroundColor: event.type === 'live' ? '#f44336' : '#ff7d00'},
              ]}
              onPress={() => handleEventPress(event)}
            >
              <Text style={styles.eventTitle}>{`➤ ${event.comments}`}</Text>
              <Text style={styles.eventTitle}>{`➤ ${event.date}`}</Text>
              <Text style={styles.eventTitle}>{`➤ ${event['no of tickets']}`}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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
                onPress={() => setIsModalVisible(false)}>
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
  container: { backgroundColor: 'transparent', width: '100%' },
  calendar: { borderRadius: 10, elevation: 3 },
  eventsContainer: { marginTop: 20, flex: 1 },
  eventItem: { padding: 15, borderRadius: 8, marginBottom: 10 },
  eventTitle: { color: 'white', fontSize: 16, fontWeight: '500' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  commentItem: { marginBottom: 15 },
  commentName: { fontWeight: 'bold', color: '#2196F3', marginBottom: 5 },
  commentBubble: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 },
  buttonPrimary: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8 },
  buttonSecondary: { backgroundColor: '#6c757d', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '500' },
});

export default LiveCalendar;
