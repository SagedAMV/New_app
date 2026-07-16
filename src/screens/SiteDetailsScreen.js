import React, { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { FieldLogContext } from '../context/FieldLogContext';

export default function SiteDetailsScreen({ route, navigation }) {
  const { siteId } = route.params;
  const { data } = useContext(FieldLogContext);
  const site = data.sites.find(s => s.id === siteId);

  if (!site) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>الموقع غير موجود</Text></View>;

  return (
    <ScrollView style={{ padding: 12 }}>
      <Card>
        <Card.Title title={site.name} subtitle={site.location} />
        <Card.Content>
          <Text>ملاحظات:</Text>
          <Text>{site.notes || 'لا توجد'}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate('Tasks', { siteId })}>المهام</Button>
          <Button onPress={() => navigation.navigate('Materials')}>المواد</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}
