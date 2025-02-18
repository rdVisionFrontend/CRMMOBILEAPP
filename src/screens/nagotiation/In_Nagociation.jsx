import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  useWindowDimensions, 
  ScrollView 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../Authorization/AuthContext';

const In_Negotiation = ({ navigation }) => {
  const [stage, setStage] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const { width, height } = useWindowDimensions();

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
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.wrapper, { width: width * 0.9 }]}>
          <View style={styles.buttonContainer}>
            {[1, 2, 3].map((stageNum) => (
              <TouchableOpacity
                key={stageNum}
                style={[
                  styles.button,
                  {
                    backgroundColor: getStageColor(stageNum),
                    borderWidth: stage === stageNum ? 2 : 0,
                    borderColor: stage === stageNum ? 'green' : 'transparent',
                    width: width * 0.25,
                  },
                ]}
                onPress={() => setStage(stageNum)}
              >
                <Text style={[styles.buttonText, { fontSize: width * 0.04 }]}>
                  Stage {stageNum}
                </Text>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/128/189/189253.png' }}
                  style={{ height: width * 0.04, width: width * 0.04 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.stageContent, { height: height * 0.7 }]}>
            {renderStageContent()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default In_Negotiation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap:10
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#1d2d44',
    fontWeight: 'bold',
  },
  stageContent: {
    padding: 10,
    width: '100%',
    
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});
