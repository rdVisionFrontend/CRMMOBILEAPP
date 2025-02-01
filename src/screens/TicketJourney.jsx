import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import apiInstance from '../../api';

const TicketJourney = ({ ticketId }) => {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [labels, setLabels] = useState([]);

    const customStyles = {
        stepIndicatorSize: 25,
        currentStepIndicatorSize: 30,
        separatorStrokeWidth: 2,        
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: '#fe7013',
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: '#fe7013',
        stepStrokeUnFinishedColor: '#aaaaaa',
        separatorFinishedColor: '#fe7013',
        separatorUnFinishedColor: '#aaaaaa',
        stepIndicatorFinishedColor: '#fe7013',
        stepIndicatorUnFinishedColor: '#ffffff',
        stepIndicatorCurrentColor: '#ffffff',
        stepIndicatorLabelFontSize: 13,
        currentStepIndicatorLabelFontSize: 13,
        stepIndicatorLabelCurrentColor: '#fe7013',
        stepIndicatorLabelFinishedColor: '#ffffff',
        stepIndicatorLabelUnFinishedColor: '#aaaaaa',
        labelColor: '#999999',
        labelSize: 15,
        currentStepLabelColor: '#fe7013'
    };

    useEffect(() => {
        console.log("Fetching ticket history for ticketId:", ticketId);
        setLoading(true);
        
        if (ticketId) {
            apiInstance.get(`/history/getByTicketId/${ticketId}`)
                .then((response) => {
                    const data = response.data;
                    setStages(data);

                    // Update labels to include both date, user name, and status
                    const newLabels = data.map(stage => 
                        `${stage.updateDate[2]}-${getMonthName(stage.updateDate[1])}-${stage.updateDate[0]} -> ${stage.userName} -> ${stage.status}`
                    );
                    setLabels(newLabels);

                    // Set the last step as the current position
                    setCurrentPosition(newLabels.length - 1);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [ticketId]);

    const getMonthName = (monthNumber) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[monthNumber - 1]; // monthNumber is 1-indexed
    };

    const onPageChange = (position) => {
        setCurrentPosition(position);
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : stages.length > 0 ? (
                <ScrollView style={styles.stagesList}>
                    <StepIndicator
                        customStyles={customStyles}
                        currentPosition={currentPosition}
                        labels={labels} // Dynamically set labels from API
                        onPress={onPageChange}
                        direction="vertical" // Vertical view
                        stepCount={labels.length} // Dynamically set step count
                    />
                </ScrollView>
            ) : (
                <Text style={styles.noDataText}>No Data Available</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 10,
        margin: 10,
        width: '100%',
      
    },
    stagesList: {
       height: '80%', 

    },
    stageItem: {
        padding: 10,
        marginBottom: 5,
    },
    evenBackground: {
        backgroundColor: '#f0f0f0',
    },
    oddBackground: {
        backgroundColor: '#fff',
    },
    stageDate: {
        fontWeight: 'bold',
        color: 'blue',
    },
    userName: {
        fontWeight: 'bold',
        marginTop: 5,  // Adds space between date and user name
    },
    stageText: {
        flex: 1,
    },
    stageStatus: {
        color: 'green',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
    },
});

export default TicketJourney;
