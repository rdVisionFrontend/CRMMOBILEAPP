import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment-timezone';
import Svg, { Line, Circle } from 'react-native-svg';

// Analog Clock Component
// Analog Clock Component with Numbers
const AnalogClock = ({ timezone, isIndianClock }) => {
  const [time, setTime] = useState(moment.tz(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment.tz(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const hours = time.hours() % 12;
  const minutes = time.minutes();
  const seconds = time.seconds();

  const hourAngle = (hours + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  return (
    <View style={[styles.clockContainer, { backgroundColor: isIndianClock ? '#FFD1DC' : '#B2DFFC' }]}>
      <Svg height="100" width="100" viewBox="0 0 100 100">
        {/* Clock Circle */}
        <Circle cx="50" cy="50" r="45" stroke="black" strokeWidth="2" fill="white" />
        {/* Clock Numbers */}
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index + 1) * 30; // 30° per number
          const x = 50 + 38 * Math.sin((angle * Math.PI) / 180); // X position
          const y = 50 - 38 * Math.cos((angle * Math.PI) / 180); // Y position
          return (
            <Text key={index} x={x} y={y} fontSize="8" fill="black" textAnchor="middle" alignmentBaseline="middle">
              {index + 1}
            </Text>
          );
        })}

        {/* Hour Hand */}
        <Line x1="50" y1="50" x2={50 + 20 * Math.sin((hourAngle * Math.PI) / 180)}
              y2={50 - 20 * Math.cos((hourAngle * Math.PI) / 180)}
              stroke="black" strokeWidth="4" />
        {/* Minute Hand */}
        <Line x1="50" y1="50" x2={50 + 30 * Math.sin((minuteAngle * Math.PI) / 180)}
              y2={50 - 30 * Math.cos((minuteAngle * Math.PI) / 180)}
              stroke="black" strokeWidth="3" />
        {/* Second Hand */}
        <Line x1="50" y1="50" x2={50 + 35 * Math.sin((secondAngle * Math.PI) / 180)}
              y2={50 - 35 * Math.cos((secondAngle * Math.PI) / 180)}
              stroke="red" strokeWidth="2" />
      </Svg>
    </View>
  );
};


// Digital Clock Component
const DigitalClock = ({ timezone, country, isIndianClock }) => {
  const [time, setTime] = useState(moment.tz(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment.tz(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const digitalTime = time.format('hh:mm:ss A');
  const indianTime = moment.tz('Asia/Kolkata');
  const timeDifference = (time.utcOffset() - indianTime.utcOffset()) / 60;

  return (
    <View style={[styles.digitalClockContainer, { backgroundColor: isIndianClock ? '#FFD1DC' : '#a2d2ff' }]}>
      <Text style={styles.digitalTime}>{digitalTime}</Text>
      <Text style={styles.countryText}>{country}</Text>
      <Text style={styles.timeDiff}>
        {timeDifference >= 0 ? `+${timeDifference}` : `${timeDifference}`} hours from IST
      </Text>
    </View>
  );
};

// Main Component for Displaying Multiple Clocks
const TimezoneClocks = () => {
  const clocks = [
    { timezone: 'Asia/Kolkata', country: 'India', isIndianClock: true },
    { timezone: 'America/New_York', country: 'US', isIndianClock: false },
    { timezone: 'Europe/London', country: 'UK', isIndianClock: false },
    { timezone: 'Australia/Sydney', country: 'AU', isIndianClock: false },
  ];

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Global Timezone Clocks</Text>
        <View style={styles.clockWrapper}>
          {clocks.map((clock, index) => (
            <View key={index} style={styles.clockItem}>
              <AnalogClock timezone={clock.timezone} isIndianClock={clock.isIndianClock} />
              <DigitalClock timezone={clock.timezone} country={clock.country} isIndianClock={clock.isIndianClock} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '##fff',
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#555',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    
  },
  clockWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  clockItem: {
    alignItems: 'center',
    margin: 10,
  },
  clockContainer: {
    borderRadius: 100,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  digitalClockContainer: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop:5,    
    elevation: 4,
  },
  digitalTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  countryText: {
    fontSize: 12,
    marginTop: 5,
    color: '#555',
    fontWeight: 'bold',
  },
  timeDiff: {
    fontSize: 12,
    marginTop: 5,
    color: '#777',
  },
});

export default TimezoneClocks;
