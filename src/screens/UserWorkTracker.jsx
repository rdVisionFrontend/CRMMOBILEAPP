import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import {useAuth} from '../Authorization/AuthContext';
import Svg, {Circle, Line} from 'react-native-svg';
import OnBreak from './Onbreak';
import apiInstance from '../../api';
import { useSelector } from 'react-redux';

const ChartWorktime = () => {
  const {takingBreak, setTakingBreak} = useAuth();

  const [teammates, setTeammates] = useState([]);
  const [liveClosers, setLiveClosers] = useState([]);
  const [dark, setDark] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // Working time in seconds
  const [initialWorkingTime, setInitialWorkingTime] = useState(0); // Initial working time in seconds
  const [breakTime, setBreakTime] = useState(0); // Break time in seconds
  const [breakStartTime, setBreakStartTime] = useState(null); // When the break started
  const loginTime = useState(Date.now())[0];
  const {userData, jwtToken} = useSelector(state => state.crmUser);

  // Update the working timer only if the user is not taking a break
  useEffect(() => {
    if (initialWorkingTime > 0 && !takingBreak) {
      const interval = setInterval(() => {
        setTimeElapsed(
          initialWorkingTime + Math.floor((Date.now() - loginTime) / 1000),
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [initialWorkingTime, takingBreak]);

  // Start/continue the break timer when takingBreak is true
  useEffect(() => {
    if (takingBreak && breakStartTime) {
      const interval = setInterval(() => {
        setBreakTime(prev => prev + 1); // Increment by 1 second
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [takingBreak, breakStartTime]);

  // Fetch initial working hours and break hours on component load
  //   useEffect(() => {
  //     setInitialWorkingTime(parseInt(localStorage.getItem("workTime")));
  //     setBreakTime(parseInt(localStorage.getItem("breakTime")));
  //   }, []);

  const shiftDurationHours = 12;
  const totalShiftTime = shiftDurationHours * 3600;
  const timeElapsedPercentage = Math.min(
    (timeElapsed / totalShiftTime) * 100,
    100,
  );

  const hours = String(Math.floor(timeElapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeElapsed % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(timeElapsed % 60).padStart(2, '0');

  const breakHours = String(Math.floor(breakTime / 3600)).padStart(2, '0');
  const breakMinutes = String(Math.floor((breakTime % 3600) / 60)).padStart(
    2,
    '0',
  );
  const breakSeconds = String(breakTime % 60).padStart(2, '0');

  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const pastDate = new Date(today); // Create a new Date object based on today
  pastDate.setDate(pastDate.getDate() - 7); // Subtract 7 days
  const formattedPastDate = pastDate.toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(formattedPastDate);
  const [endDate, setEndDate] = useState(formattedToday);

  const toggleBreak = () => {
    toggleBreakOnServer();
    if (!takingBreak) {
      // Starting the break
      setBreakStartTime(Date.now());
    } else {
      // Ending the break: update the break time based on how long the break was
      if (breakStartTime) {
        const timeSpentOnBreak = Math.floor(
          (Date.now() - breakStartTime) / 1000,
        ); // in seconds
        setBreakTime(prev => prev + timeSpentOnBreak); // add the time spent on break to the total break time
        setBreakStartTime(null); // reset the break start time
      }
    }
    setTakingBreak(!takingBreak); // toggle the break state
  };

  const toggleBreakOnServer = async () => {
    const response = await apiInstance.get(
      `/user/toggleBreak/${userData.userId}`,
    );
  };

  useEffect(() => {
    // Function to call the API and set the data
    const fetchBestSellingTeammates = async () => {
      try {
        const response = await apiInstance.get(
          `/team/bestsellingTeammates/${userData.userId}`,
        );
        setTeammates(response.data); // Assuming the data is in response.data
      } catch (error) {
        console.error('Error fetching best selling teammates', error);
      }
    };
    const fetchLiveStatus = async () => {
      try {
        const response = await apiInstance.get(
          `/user/getLiveTeammates/${userData.userId}`,
        );
        setLiveClosers(response.data); // Assuming the data is in response.data
      } catch (error) {
        console.error('Error fetching live status', error);
      }
    };
    fetchLiveStatus();
    fetchBestSellingTeammates();
  }, []);

  const checkuserLive = userName => {
    return liveClosers.some(
      closer => closer.firstName === userName.split(' ')[0],
    );
  };

  return (
    <ScrollView style={dark ? styles.darkContainer : styles.lightContainer}>
      <View style={styles.container}>
        <View style={styles.row}>
          <View>
            <View style={styles.workTimeContainer}>
              <View style={styles.timerContainer}>
                <Svg height="10" width="160">
                  {/* Background Line */}
                  <Line
                    x1="0"
                    y1="5"
                    x2="160"
                    y2="5"
                    stroke="#e6e6e6"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Progress Line */}
                  <Line
                    x1="0" // Ensure the progress starts from 0
                    y1="5"
                    x2={(160 * timeElapsedPercentage) / 100} // Ensure it extends properly
                    y2="5"
                    stroke="#007bff"
                    strokeWidth="10" // Keep width in sync with the background line
                    strokeLinecap="round"
                  />
                </Svg>

                <View style={styles.timerTextContainer}>
                  <Text style={styles.timerText}>
                    {hours} : {minutes}
                    <Text style={styles.timerText}>Hrs.</Text>
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.breakButton} onPress={toggleBreak}>
              <Text style={styles.breakButtonText}>
                {takingBreak ? 'Continue' : 'Take Break'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={takingBreak} transparent={true} animationType="slide">
        <OnBreak
          breakHours={breakHours}
          breakMinutes={breakMinutes}
          breakSeconds={breakSeconds}
          Whours={hours}
          Wminutes={minutes}
          Wseconds={seconds}
        />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 5,
  },
  workTrackerText: {
    fontSize: 15,
    color: 'gray',
  },
  breakButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  breakButtonText: {
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 5,
    fontWeight: 600,
    textAlign: 'center',
  },
});

export default ChartWorktime;
