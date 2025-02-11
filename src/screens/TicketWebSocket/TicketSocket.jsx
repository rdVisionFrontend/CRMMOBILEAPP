import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from "react-native";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Notification from "./Notification"; // Your custom Notification component

import { Alert } from "react-native";

const NotificationContainer = () => {
    const [notifications, setNotifications] = useState([]);
    const [noOfNewTicketsReceived, setNoOfNewTicketsReceived] = useState(0);
    const fadeAnim = useState(new Animated.Value(0))[0]; // For fade animations

    useEffect(() => {
        // ✅ Initialize WebSocket Client Correctly
        const stompClient = new Client({
            webSocketFactory: () => new SockJS("https://uatbackend.rdvision.tech/ws"),
            reconnectDelay: 5000, // Auto-reconnect every 5 seconds if disconnected
            debug: (msg) => console.log("[WebSocket Debug]:", msg),
        });

        // ✅ WebSocket Connection Established
        stompClient.onConnect = () => {
            console.log("✅ Connected to WebSocket");

            // 📌 Subscribe to "invoice" topic
            stompClient.subscribe("/topic/invoice/", (message) => {
                const updateData = JSON.parse(message.body);
                setNotifications((prev) => [
                    { name: "Verification Pending", type: "inProgress", message: "Paid Invoice Received", ...updateData },
                    ...prev,
                ]);
            });

            // 📌 Subscribe to "invoice verified" topic
            stompClient.subscribe("/topic/invoice/verified/", (message) => {
                const updateData = JSON.parse(message.body);
                setNotifications((prev) => [
                    { type: "completed", message: "Invoice Verified", ...updateData },
                    ...prev,
                ]);
            });

            // 📌 Subscribe to "third-party ticket" topic
            stompClient.subscribe("/topic/third_party_api/ticket/", (message) => {
                const newNotification = JSON.parse(message.body);
                setNotifications((prev) => [
                    {
                        type: "newLead",
                        name: newNotification.senderName,
                        message: newNotification.senderCountryIso,
                        product: newNotification.queryProductName,
                        ...newNotification,
                    },
                    ...prev,
                ]);
                setNoOfNewTicketsReceived((prevCount) => prevCount + 1);
                playNotificationSound();
            });
        };

        // ✅ Activate WebSocket Connection
        stompClient.activate();

        // 🛑 Cleanup Function to Deactivate WebSocket on Component Unmount
        return () => {
            if (stompClient) {
                stompClient.deactivate();
                console.log("❌ Disconnected from WebSocket");
            }
        };
    }, []);

    // 🔊 Play Notification Sound on New Ticket
    const playNotificationSound = () => {
        Alert.alert(
            "New Notification",
            "You have received a new ticket.",
            [{ text: "OK", onPress: () => console.log("Alert Closed") }]
        );
    };

    // 🗑️ Remove Notification
    const removeNotification = (index) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setNotifications((prev) => prev.filter((_, i) => i !== index));
            fadeAnim.setValue(1); // Reset animation
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {notifications.map((notification, index) => (
                    <Animated.View
                        key={index}
                        style={[styles.notificationWrapper, { opacity: fadeAnim }]}
                    >
                        <TouchableOpacity onPress={() => removeNotification(index)}>
                            <Notification
                                title={notification.type}
                                details={notification.message}
                                requirement={notification.product}
                                name={notification.name}
                                type={notification.type} // Pass type for color styling
                            />
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 10000,
        maxHeight: "100%",
        width: "100%",
        padding: 10,
    },
    scrollView: {
        flexGrow: 1,
    },
    notificationWrapper: {
        marginBottom: 10,
    },
});

export default NotificationContainer;