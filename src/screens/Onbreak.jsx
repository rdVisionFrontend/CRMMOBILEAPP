import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';

import {useSelector} from 'react-redux';
import {useAuth} from '../Authorization/AuthContext';
function OnBreak({
  breakHours,
  breakMinutes,
  breakSeconds,
  Whours,
  Wminutes,
  Wseconds,
}) {
  const {setTakingBreak} = useAuth();
  const [seconds, setSeconds] = useState(0);
  const {userData, jwtToken, refreshToken} = useSelector(
    state => state.crmUser,
  );

  console.log('Break:', breakHours, breakMinutes, breakSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEndBreak = () => {
    setTakingBreak(false);
  };

  function convertToImage(imageString) {
    const byteCharacters = atob(imageString);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/jpeg'});
    return URL.createObjectURL(blob);
  }

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const displaySeconds = seconds % 60;
  const displayMinutes = minutes % 60;

  const formattedTime = `${hours > 0 ? `${hours}:` : ''}${
    displayMinutes < 10 && hours > 0
      ? `0${displayMinutes}:`
      : `${displayMinutes}:`
  }${displaySeconds < 10 ? `0${displaySeconds}` : displaySeconds}`;

  return (
    <View style={styles.container}>
      <View style={styles.breakAlert}>
        <View style={styles.timeContainer}>
          <View style={[styles.infoBox, {backgroundColor: '#c7f9cc'}]}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Total Work - </Text> {Whours} :{' '}
              {Wminutes} : {Wseconds}
            </Text>
          </View>

          <View style={[styles.infoBox, {backgroundColor: '#d7e3fc'}]}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Total Break - </Text> {breakHours} :{' '}
              {breakMinutes} : {breakSeconds}
            </Text>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/1077/1077012.png',
            }}
            style={styles.profileImage}
          />
        </View>

        <Text style={styles.heading}>
          {`${userData.firstName} ${userData.lastName}, You Are On a Break`}
        </Text>

        <Text style={styles.subtext}>Take a moment to recharge!</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Break Time: {formattedTime}</Text>
        </View>

        <TouchableOpacity
          style={styles.endBreakButton}
          onPress={handleEndBreak}>
          <Text style={styles.buttonText}>End Break</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default OnBreak;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  breakAlert: {
    backgroundColor: '#dc3545',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  infoBox: {
    padding: 10,
    borderRadius: 10,
    minWidth: 120,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#264248',
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
  },
  profileContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtext: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  timerContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  endBreakButton: {
    backgroundColor: '#bf0603',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
