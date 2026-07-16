import React, { useContext } from 'react';
import { View, FlatList } from 'react-native';
import { List } from 'react-native-paper';
import { FieldLogContext } from '../context/FieldLogContext';

export default function MovementsLogScreen() {
  const { data } = useContext(FieldLogContext);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data.movements}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <List.Item title={item.description} description={new Date(item.timestamp).toLocaleString()} />
        )}
      />
    </View>
  );
}
