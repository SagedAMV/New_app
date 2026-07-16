import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { COLORS } from './src/theme/colors';
import { FieldLogProvider } from './src/context/FieldLogContext';

import SitesGridScreen from './src/screens/SitesGridScreen';
import SiteDetailsScreen from './src/screens/SiteDetailsScreen';
import TasksScreen from './src/screens/TasksScreen';
import MaterialsLibraryScreen from './src/screens/MaterialsLibraryScreen';
import MovementsLogScreen from './src/screens/MovementsLogScreen';
import InvestigationsLogScreen from './src/screens/InvestigationsLogScreen';

function MainNavigator() {
  const [activeTab, setActiveTab] = useState('sites');
  const [selectedSite, setSelectedSite] = useState(null);

  const renderScreen = () => {
    // إذا كان التبويب هو لوحة المواقع وتم اختيار موقع معين، نعرض تفاصيله
    if (activeTab === 'sites' && selectedSite) {
      return (
        <SiteDetailsScreen 
          site={selectedSite} 
          onBack={() => setSelectedSite(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'sites':
        return (
          <SitesGridScreen 
            onSelectSite={(site) => setSelectedSite(site)} 
          />
        );
      case 'tasks':
        return <TasksScreen />;
      case 'library':
        return <MaterialsLibraryScreen />;
      case 'movements':
        return <MovementsLogScreen />;
      case 'investigations':
        return <InvestigationsLogScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* شريط العنوان التكتيكي العلوي */}
      <View style={styles.topBar}>
        <View style={styles.titleBox}>
          <Text style={styles.appTitle}>📡 سجل الميدان – مواقعي</Text>
          <Text style={styles.appSubtitle}>منظومة ضابط اتصالات ميداني</Text>
        </View>
        <View style={styles.expoBadge}>
          <Text style={styles.expoBadgeText}>EXPO GO PRO</Text>
        </View>
      </View>

      {/* منطقة عرض الشاشات */}
      <View style={styles.contentArea}>
        {renderScreen()}
      </View>

      {/* شريط التنقل السفلي المتجاوب (Tab Bar) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sites' && !selectedSite && styles.tabItemActive]}
          onPress={() => {
            setSelectedSite(null);
            setActiveTab('sites');
          }}
        >
          <Text style={styles.tabIcon}>📡</Text>
          <Text style={[styles.tabLabel, activeTab === 'sites' && !selectedSite && styles.tabLabelActive]}>
            المواقع
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'tasks' && styles.tabItemActive]}
          onPress={() => {
            setSelectedSite(null);
            setActiveTab('tasks');
          }}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'tasks' && styles.tabLabelActive]}>
            قائمة المهام
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'library' && styles.tabItemActive]}
          onPress={() => {
            setSelectedSite(null);
            setActiveTab('library');
          }}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={[styles.tabLabel, activeTab === 'library' && styles.tabLabelActive]}>
            مكتبة المواد
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'movements' && styles.tabItemActive]}
          onPress={() => {
            setSelectedSite(null);
            setActiveTab('movements');
          }}
        >
          <Text style={styles.tabIcon}>🔄</Text>
          <Text style={[styles.tabLabel, activeTab === 'movements' && styles.tabLabelActive]}>
            سجل الحركات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'investigations' && styles.tabItemActive]}
          onPress={() => {
            setSelectedSite(null);
            setActiveTab('investigations');
          }}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabLabel, activeTab === 'investigations' && styles.tabLabelActive]}>
            الاستكشافات
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <FieldLogProvider>
      <MainNavigator />
    </FieldLogProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  titleBox: {
    alignItems: 'flex-end',
  },
  appTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  appSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  expoBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  expoBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  tabBar: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingVertical: 6,
    paddingHorizontal: 4,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#F3F4F6',
  },
  tabIcon: {
    fontSize: 19,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  tabLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
  },
});
