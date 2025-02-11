import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const NotificationContainer = () => {
    const [notifications, setNotifications] = useState([]);
    const [noOfNewTicketsReceived, setNoOfNewTicketsReceived] = useState(0);
    const [connected, setConnected] = useState(false); // Track WebSocket connection status

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS("https://uatbackend.rdvision.tech/ws"),
            reconnectDelay: 5000,
            debug: (msg) => console.log("[WebSocket Debug]:", msg),
        });

        stompClient.onConnect = () => {
            console.log("✅ Connected to WebSocket");
            setConnected(true); // Set connection status to true

            stompClient.subscribe("/topic/invoice/", (message) => {
                const updateData = JSON.parse(message.body);
                setNotifications((prev) => [
                    { name: "Verification Pending", type: "inProgress", message: "Paid Invoice Received", ...updateData },
                    ...prev,
                ]);
            });

            stompClient.subscribe("/topic/invoice/verified/", (message) => {
                const updateData = JSON.parse(message.body);
                setNotifications((prev) => [
                    { type: "completed", message: "Invoice Verified", ...updateData },
                    ...prev,
                ]);
            });

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

        stompClient.onDisconnect = () => {
            console.log("❌ Disconnected from WebSocket");
            setConnected(false); // Set connection status to false
        };

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const playNotificationSound = () => {
        Alert.alert("New Notification", "You have received a new ticket.", [{ text: "OK" }]);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.statusText, connected ? styles.connected : styles.disconnected]}>
                {connected ? "🟢 Connected to WebSocket" : "🔴 Disconnected"}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    statusText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    connected: {
        color: "green",
    },
    disconnected: {
        color: "red",
    },
});

export default NotificationContainer;
