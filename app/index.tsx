import { ActivityIndicator, View } from 'react-native';
import { App } from '../components/App';
import { LoginScreen } from '../components/LoginScreen';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-wed-bg items-center justify-center">
        <ActivityIndicator size="large" color="#2d2d2d" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <App />;
}
