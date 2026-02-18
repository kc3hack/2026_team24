import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const userName = await AsyncStorage.getItem('userName');

        if (!hasLaunched) {
          router.replace('/welcome');
        } else if (!userName) {
          router.replace('/setup');
        } else {
          router.replace('/(tabs)');
        }
      } catch (e) {
        router.replace('/welcome');
      }
    };
    checkStatus();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}