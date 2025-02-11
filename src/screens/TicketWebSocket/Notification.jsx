import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Notification = ({ title, details, requirement, name, type }) => {
    return (
        <View style={[styles.notification, { backgroundColor: type === "newLead" ? "#e3f2fd" : "#f0f4c3" }]}>
            <Text>HEllo</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.details}>{details}</Text>
            <Text style={styles.requirement}>{requirement}</Text>
            <Text style={styles.name}>{name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    notification: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    details: {
        fontSize: 14,
        color: "#555",
    },
    requirement: {
        fontSize: 14,
        color: "#777",
    },
    name: {
        fontSize: 14,
        color: "#999",
    },
});

export default Notification;