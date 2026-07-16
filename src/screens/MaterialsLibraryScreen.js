import React, { useContext } from 'react';
import { View, FlatList } from 'react-native';
import { List } from 'react-native-paper';
import { FieldLogContext } from '../context/FieldLogContext';

export default function MaterialsLibraryScreen() {
  const { data } = useContext(FieldLogContext);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={data.materials}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <List.Item title={item.name} description={`الكمية: ${item.qty}`} />
        )}
      />
    </View>
  );
}
