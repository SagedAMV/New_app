import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FieldLogProvider } from './src/context/FieldLogContext';
import SitesGridScreen from './src/screens/SitesGridScreen';
import SiteDetailsScreen from './src/screens/SiteDetailsScreen';
import TasksScreen from './src/screens/TasksScreen';
import MaterialsLibraryScreen from './src/screens/MaterialsLibraryScreen';
import MovementsLogScreen from './src/screens/MovementsLogScreen';
import InvestigationsLogScreen from './src/screens/InvestigationsLogScreen';
import colors from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <FieldLogProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Sites"
            screenOptions={{
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff'
            }}
          >
            <Stack.Screen name="Sites" component={SitesGridScreen} />
            <Stack.Screen name="SiteDetails" component={SiteDetailsScreen} options={{ title: 'تفاصيل الموقع' }} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="Materials" component={MaterialsLibraryScreen} options={{ title: 'مكتبة المواد' }} />
            <Stack.Screen name="Movements" component={MovementsLogScreen} options={{ title: 'سجل الحركات' }} />
            <Stack.Screen name="Investigations" component={InvestigationsLogScreen} options={{ title: 'سجل الاستكشافات' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </FieldLogProvider>
  );
}
