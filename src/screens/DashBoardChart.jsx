import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import apiInstance from '../../api';
import { useSelector } from 'react-redux';
import UserWorkTracker from './UserWorkTracker';

function UserWorkTimeReport(props) {
    const [monthly, setMonthly] = useState(false);
    const [useDetails, setUserDetails] = useState({});
    const [totalWorktime, setTotalWorktime] = useState(0);
    const [totalBreakTime, setTotalBreakTime] = useState(0);
    const [defaultUrl, setDefaultUrl] = useState("/third_party_api/ticket");
    const [dateChange, setDateChange] = useState();
    const [dark, setDark] = useState(false);
    const { userData, jwtToken, refreshToken } = useSelector(
        state => state.crmUser,
    );

    const [chartData, setChartData] = useState({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], // Default labels
        datasets: [
            {
                data: [],
                color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, // Green for work
            },
            {
                data: [],
                color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, // Red for break
            },
        ],
    });

    const [apiData, setApiData] = useState([]);
    const [workData, setWorkData] = useState({ userId: userData.userId, weeks: 1 });

    useEffect(() => {
        loadWorks();
        loadWorksMonthly();
        setWorkData({ userId: userData.userId, weeks: 1 });
        console.log(userData.userId);
    }, []);

    const loadWorksMonthly = async () => {
        try {
            const response = await apiInstance.post("/user/userreportbymonth",workData);
            console.log("load1Month", response.data);
            setApiData(response.data);
        } catch (error) {
            console.error("Error loading monthly data:", error);
        }
    };

    const loadWorks = async () => {
        try {
            const response = await apiInstance.post("/user/userreport",workData);
            console.log("load2Works", response.data);
            setApiData(processData(response.data));
        } catch (error) {
            console.error("Error loading works data:", error);
        }
    };

    const getDayOfWeek = (dateArray) => {
        const [year, month, day] = dateArray;
        const date = new Date(year, month - 1, day);
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return daysOfWeek[date.getDay()];
    };

    const processData = (data) => {
        return data.map(item => {
            const dayOfWeek = getDayOfWeek(item.date);
            return {
                totalBreakTime: item.totalBreakTime,
                totalWorkTime: item.totalWorkTime,
                day: dayOfWeek,
            };
        });
    };

    const numberToMonthName = (number) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        return months[number - 1] || "Invalid month";
    };

    useEffect(() => {
        if (apiData.length > 0) {
            const labels = monthly
                ? apiData.map(item => `${numberToMonthName(item.month)}_${item.year}`)
                : apiData.map(item => item.day);

            const workData = apiData.map(item => item.totalWorkTime / 3600);
            const breakData = apiData.map(item => item.totalBreakTime / 60);

            let workTimeSum = 0;
            let breakTimeSum = 0;

            for (let i = 0; i < apiData.length; i++) {
                workTimeSum += apiData[i].totalWorkTime;
                breakTimeSum += apiData[i].totalBreakTime;
            }

            setTotalWorktime(workTimeSum);
            setTotalBreakTime(breakTimeSum * 60);

            setChartData({
                labels: labels.length > 0 ? labels : ["Mon", "Tue", "Wed", "Thu", "Fri"], // Fallback to default labels
                datasets: [
                    {
                        data: workData,
                        color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`, // Green for work
                    },
                    {
                        data: breakData,
                        color: (opacity = 1) => `rgba(220, 53, 69, ${opacity})`, // Red for break
                    },
                ],
            });
        }
    }, [apiData, monthly]);

    return (
        <ScrollView style={dark ? styles.darkContainer : styles.lightContainer}>
            <View style={styles.container}>
                <View style={styles.summaryContainer}>
                    <Text style={[styles.summaryText, dark ? styles.darkText : styles.lightText]}>
                        Total Work: <Text style={styles.workText}>{(totalWorktime / 3600).toFixed(2)} hrs.</Text>
                    </Text>
                    <Text style={[styles.summaryText, dark ? styles.darkText : styles.lightText]}>
                        Total Break: <Text style={styles.breakText}>{(totalBreakTime / 3600).toFixed(2)} mins.</Text>
                    </Text>
                </View>
                <Text style={[styles.reportText, dark ? styles.darkText : styles.lightText]}>Work Report</Text>
                <View style={styles.chartContainer}>
                    <BarChart
                        data={chartData}
                        width={350} // Adjust width as needed
                        height={200} // Adjust height as needed
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: dark ? '#333' : '#fff',
                            backgroundGradientFrom: dark ? '#333' : '#fff',
                            backgroundGradientTo: dark ? '#333' : '#fff',
                            decimalPlaces: 2,
                            color: (opacity = 1) => dark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => dark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                </View>
            </View>
            <UserWorkTracker/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    darkContainer: {
        backgroundColor: '#333',
        flex: 1,
    },
    lightContainer: {
        backgroundColor: '#fff',
        flex: 1,
    },
    container: {
        padding: 16,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryText: {
        fontSize: 12,
    },
    darkText: {
        color: '#fff',
    },
    lightText: {
        color: '#000',
    },
    workText: {
        color: 'green',
    },
    breakText: {
        color: 'red',
    },
    reportText: {
        fontSize: 12,
        marginBottom: 8,
    },
    chartContainer: {
        height: 200, // Adjust height as needed
    },
});

export default UserWorkTimeReport;