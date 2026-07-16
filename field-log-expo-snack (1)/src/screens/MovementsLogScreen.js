import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { useFieldLog } from '../context/FieldLogContext';

export default function MovementsLogScreen() {
  const { movements } = useFieldLog();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionHeader}>🔄 سجل حركات سحب وإرجاع مواد الصيانة ({movements.length})</Text>

        {movements.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🚚</Text>
            <Text style={styles.emptyTitle}>لا توجد حركات سحب أو إرجاع مسجلة</Text>
            <Text style={styles.emptySub}>عند قيامك بسحب مادة من أي موقع للورشة أو إعادة إرجاعها للميدان، سيتم توثيق كل حركة هنا بالتاريخ والملاحظات.</Text>
          </View>
        ) : (
          movements.map(mov => {
            const isPull = mov.movementType.includes('سحب');
            return (
              <View key={mov.id} style={[styles.movCard, isPull ? styles.cardPull : styles.cardReturn]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, isPull ? styles.badgePull : styles.badgeReturn]}>
                    <Text style={[styles.typeText, isPull ? styles.textPull : styles.textReturn]}>
                      {mov.movementType}
                    </Text>
                  </View>
                  <Text style={styles.movDate}>{mov.date}</Text>
                </View>

                <Text style={styles.siteTitle}>📍 الموقع: {mov.siteName}</Text>
                <Text style={styles.matName}>الجهاز/المادة: {mov.materialName}</Text>

                {mov.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>📝 الملاحظات: {mov.notes}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  scrollArea: { padding: 14 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 14 },
  
  emptyBox: { backgroundColor: COLORS.white, padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, marginTop: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.gray, textAlign: 'center', lineHeight: 18 },
  
  movCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder, elevation: 2 },
  cardPull: { borderLeftWidth: 6, borderLeftColor: COLORS.info },
  cardReturn: { borderLeftWidth: 6, borderLeftColor: COLORS.secondary },
  
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  movDate: { fontSize: 11, color: COLORS.gray },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePull: { backgroundColor: '#DBEAFE' },
  badgeReturn: { backgroundColor: '#D1FAE5' },
  typeText: { fontSize: 11, fontWeight: 'bold' },
  textPull: { color: '#1E40AF' },
  textReturn: { color: '#065F46' },
  
  siteTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.primaryLight, textAlign: 'right', marginBottom: 4 },
  matName: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 8 },
  
  notesBox: { backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, marginTop: 4 },
  notesText: { fontSize: 12, color: COLORS.dark, textAlign: 'right', lineHeight: 18 }
});
