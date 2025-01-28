import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const CountryFlagTable = ({flagName}) => {
  // Ensure flagName is a valid string and fallback to 'us' if null or undefined
  const getFlagUrl = countryIso =>
    countryIso
      ? `https://flagcdn.com/32x24/${countryIso.toLowerCase()}.png`
      : '';

  const flagUrl = getFlagUrl(flagName === 'UK' ? 'gb' : flagName); // Check for UK and set to "gb"

  return (
    <View style={styles.row}>
      {/* Render image only if flagUrl is not empty */}
      {flagUrl ? (
        <Image
          source={{
            uri: flagUrl,
          }}
          style={styles.flag}
          alt={`${flagName} flag`}
        />
      ) : (
        <Text></Text> // Display text if flag URL is invalid
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flag: {
    width: 20,
    height: 24,
    borderRadius: 4,
    resizeMode: 'contain',
  },
});

export default CountryFlagTable;
