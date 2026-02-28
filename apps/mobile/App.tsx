import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { calculateTirePressure } from '@velotrace/logic';

export default function App() {
  const pressure = calculateTirePressure({
    riderWeight: 75,
    bikeWeight: 9,
    tireWidth: 28,
    isTubeless: true,
    surfaceType: 'normal'
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VeloTrace Mobile POC</Text>
      <Text style={styles.subtitle}>Shared Engine (Tire Pressure):</Text>
      <Text style={styles.result}>Front: {pressure.front.psi} PSI</Text>
      <Text style={styles.result}>Rear: {pressure.rear.psi} PSI</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#06B6D4',
    fontStyle: 'italic',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginVertical: 4
  }
});
