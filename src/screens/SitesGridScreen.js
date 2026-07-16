import React, { useContext } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { FieldLogContext } from '../context/FieldLogContext';

export default function SitesGridScreen({ navigation }) {
  const { data, loading } = useContext(FieldLogContext);

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>جارٍ التحميل...</Text></View>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data.sites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('SiteDetails', { siteId: item.id })}>
            <Card style={{ marginBottom: 10 }}>
              <Card.Title title={item.name} subtitle={item.location} />
              <Card.Content>
                <Text numberOfLines={2}>{item.notes || 'لا توجد ملاحظات'}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
