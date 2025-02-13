import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../Authorization/AuthContext';

const In_Negotiation = ({ navigation }) => {
  const [stage, setStage] = useState(1); // Tracks the current stage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch user ID only once
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('User Data:', parsedUser);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUserId();
  }, []);

  // Returns button color based on the stage
  const getStageColor = (stageNum) => {
    switch (stageNum) {
      case 1:
        return '#dda15e';
      case 2:
        return '#ffe1a8';
      case 3:
        return '#57cc99';
      default:
        return '#000';
    }
  };

  // Render component based on the selected stage
  const renderStageContent = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    switch (stage) {
      case 1:
        return <Stage1 />;
      case 2:
        return <Stage2 />;
      case 3:
        return <Stage3 />;
      default:
        return <Text>Select a Stage</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* Stage Buttons */}
        <View style={styles.buttonContainer}>
          {[1, 2, 3].map((stageNum) => ( // Removed Stage 4 from the array
            <TouchableOpacity
              key={stageNum}
              style={[
                styles.button,
                {
                  backgroundColor: getStageColor(stageNum),
                  borderWidth: stage === stageNum ? 2 : 0,
                  borderColor: stage === stageNum ? 'green' : 'transparent',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                },
              ]}
              onPress={() => setStage(stageNum)} // Updates state without reloading
            >
              <Text style={styles.buttonText}>Stage {stageNum}</Text>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/189/189253.png',
                }}
                style={{ height: 15, width: 15 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Render the content for the active stage */}
        <View style={styles.stageContent}>{renderStageContent()}</View>
      </View>
    </View>
  );
};

export default In_Negotiation;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',    
    backgroundColor: '#fff',
  },
  wrapper: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 30,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#1d2d44',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stageContent: {
    marginTop: 20,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    width: '100%',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});