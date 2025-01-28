import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import Stage4 from './Stage4';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Make sure axios is imported
import apiInstance from '../../../api';


const In_Nagociation = ({navigation}) => {
    const [stage, setStage] = useState(1); // To track the current stage
    const [someDataArray, setSomeDataArray] = useState([]); // To store the fetched Stage 1 data
    const { userData, jwtToken } = useSelector((state) => state.crmUser);

    useEffect(() => {
        console.log("page load");

        const fetchToken = async () => {
            try {
                const token = await AsyncStorage.getItem('jwtToken'); // Use await to ensure the async operation completes
                console.log("token", token);
                if (!token) {
                    navigation.navigate('Login');
                }
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        const fetchStage1Data = async () => {
            try {
                if (jwtToken) {  // Only call the API if jwtToken is available
                    const response = await apiInstance.post( `/third_party_api/ticket/negotiationstagebased`,
                        {
                            user: userData.userId,
                            stage: 1,
                        },
                        
                    );
                    console.log("Stage 1 response", response);
                    setSomeDataArray(response.data); // Store the fetched data in state
                }
            } catch (error) {
                console.error("Error fetching Stage 1 data:", error);
            }
        };
        fetchToken();  
        fetchStage1Data();  

    }, [jwtToken]); 

    const getStageColor = (stageNum) => {
        switch (stageNum) {
            case 1:
                return '#dda15e';
            case 2:
                return '#ffe1a8';
            case 3:
                return '#57cc99';
            case 4:
                return '#ff9b54';
            default:
                return '#000';
        }
    }

    // Conditionally render components based on the selected stage
    const renderStageContent = () => {
        switch (stage) {
            case 1:
                return <Stage1 someData={someDataArray} />;  // Pass the fetched data as a prop to Stage1
            case 2:
                return <Stage2 />;
            case 3:
                return <Stage3 />;
            case 4:
                return <Stage4 />;
            default:
                return <Text>Select a Stage</Text>;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.wrapper}>
                {/* Stage Buttons */}
                <View style={styles.buttonContainer}>
                    {[1, 2, 3, 4].map(stageNum => (
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
                                    gap: 5
                                }
                            ]}
                            onPress={() => setStage(stageNum)}
                        >
                            <Text style={styles.buttonText}>Stage{stageNum}</Text>
                            <Image
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/128/189/189253.png' }}
                                style={{ height: 15, width: 15 }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Render the content for the active stage */}
                <View style={styles.stageContent}>
                    {renderStageContent()}
                </View>
            </View>
        </View>
    );
}

export default In_Nagociation;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    wrapper: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 2,
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
        width: '100%'
    },
});