import React from "react";
import { View, Text, Dimensions } from "react-native";
import * as Progress from "react-native-progress";

const WorkTimeProgressBar = ({ workHours }) => {
  const maxHours = 12; // Maximum allowed hours
  const progress = Math.min(workHours, maxHours) / maxHours; // Normalize (0 to 1)
  
  return (
    <View style={{ alignItems: "left" ,width:'80%' ,}}>
      {/* Label */}
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5, textAlign:'left', marginTop:10 }}>
        Work Progress ({workHours.toFixed(1)} / {maxHours} hrs)
      </Text>

      {/* Progress Bar */}
      <Progress.Bar
        progress={progress}
        width={Dimensions.get("window").width - 100} // Responsive width
        height={8}
        color={progress >= 1 ? "#ff5252" : "#007bff"} // Red when max reached
        borderRadius={10}
        borderWidth={1}
      />
    </View>
  );
};

export default WorkTimeProgressBar;
