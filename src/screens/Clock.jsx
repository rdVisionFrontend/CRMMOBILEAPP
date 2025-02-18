import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import moment from 'moment-timezone';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';

const AnalogClock = ({ timezone, isIndianClock }) => {
  const [time, setTime] = useState(moment.tz(timezone));
  const { width } = useWindowDimensions();
  const clockSize = width > 400 ? 120 : 90; // Adjust clock size based on screen width

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
    <View style={[styles.clockContainer, { backgroundColor: isIndianClock ? '#FFD1DC' : '#B2DFFC', width: clockSize, height: clockSize }]}>
      <Svg height={clockSize} width={clockSize} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" stroke="black" strokeWidth="1" fill="white" />
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index + 1) * 30;
          const x = 50 + 38 * Math.sin((angle * Math.PI) / 180);
          const y = 50 - 38 * Math.cos((angle * Math.PI) / 180);
          return (
            <SvgText key={index} x={x} y={y + 3} fontSize="8" fill="black" textAnchor="middle">
              {index + 1}
            </SvgText>
          );
        })}
        <Circle cx="50" cy="50" r="3" fill="black" />
        <Line x1="50" y1="50" x2={50 + 20 * Math.sin((hourAngle * Math.PI) / 180)} y2={50 - 20 * Math.cos((hourAngle * Math.PI) / 180)} stroke="black" strokeWidth="4" />
        <Line x1="50" y1="50" x2={50 + 30 * Math.sin((minuteAngle * Math.PI) / 180)} y2={50 - 30 * Math.cos((minuteAngle * Math.PI) / 180)} stroke="black" strokeWidth="3" />
        <Line x1="50" y1="50" x2={50 + 35 * Math.sin((secondAngle * Math.PI) / 180)} y2={50 - 35 * Math.cos((secondAngle * Math.PI) / 180)} stroke="red" strokeWidth="2" />
      </Svg>
    </View>
  );
};

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
      <Text style={styles.timeDiff}>{timeDifference >= 0 ? `+${timeDifference}` : `${timeDifference}`} hours from IST</Text>
    </View>
  );
};

const TimezoneClocks = () => {
  const clocks = [
    { timezone: 'Asia/Kolkata', country: 'India', isIndianClock: true },
    { timezone: 'America/New_York', country: 'US', isIndianClock: false },
    { timezone: 'Europe/London', country: 'UK', isIndianClock: false },
    { timezone: 'Australia/Sydney', country: 'AU', isIndianClock: false },
  ];
  const { width } = useWindowDimensions();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 20,   
    flex:1
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 20,
    width: '100%',
    alignItems: 'center',
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
    justifyContent: 'space-evenly', // Ensures two clocks per row
  },
  clockItem: {
    alignItems: 'center',
    width: '45%', // Ensures exactly 2 clocks per row
    marginBottom: 20,
  },
  clockContainer: {
    borderRadius: 100,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitalClockContainer: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
    elevation: 4,
    width: '90%',
    maxWidth: 180,
  },
  digitalTime: {
    fontSize: 14,
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
