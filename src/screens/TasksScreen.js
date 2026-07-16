import React, { useContext } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Checkbox, List } from 'react-native-paper';
import { FieldLogContext } from '../context/FieldLogContext';

export default function TasksScreen({ route }) {
  const { siteId } = route.params || {};
  const { data, setData } = useContext(FieldLogContext);

  const tasks = siteId ? data.tasks.filter(t => t.siteId === siteId) : data.tasks;

  const toggle = (id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={tasks}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.done ? 'تم' : 'قيد التنفيذ'}
            onPress={() => toggle(item.id)}
            left={props => <Checkbox status={item.done ? 'checked' : 'unchecked'} />}
          />
        )}
      />
    </View>
  );
}
