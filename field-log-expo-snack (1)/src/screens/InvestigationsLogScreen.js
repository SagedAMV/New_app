import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { useFieldLog } from '../context/FieldLogContext';

export default function InvestigationsLogScreen() {
  const { investigations, materials } = useFieldLog();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionHeader}>📋 تقارير النزول واستكشاف الأعطال الميدانية ({investigations.length})</Text>

        {investigations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>لا توجد استكشافات ميدانية مسجلة</Text>
            <Text style={styles.emptySub}>عند قيامك بالنزول لأي موقع لاستكشاف عطل أو تقييم وضع البث، سيتم حفظ التقرير هنا مع النتيجة الميدانية.</Text>
          </View>
        ) : (
          investigations.map(inv => {
            const isNeedRepair = inv.action === 'يحتاج صيانة';
            const isActive = inv.action === 'قيد الاستكشاف';
            
            return (
              <View key={inv.id} style={[styles.invCard, isNeedRepair && styles.cardRepair, isActive && styles.cardActive]}>
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.actionBadge,
                    isActive ? styles.badgeActive : (isNeedRepair ? styles.badgeRepair : styles.badgeOk)
                  ]}>
                    <Text style={[
                      styles.actionText,
                      isActive ? styles.textActive : (isNeedRepair ? styles.textRepair : styles.textOk)
                    ]}>
                      {inv.action}
                    </Text>
                  </View>
                  <Text style={styles.invDate}>{inv.date}</Text>
                </View>

                <Text style={styles.siteTitle}>📍 الموقع: {inv.siteName}</Text>
                <Text style={styles.reasonText}>❓ سبب النزول / البلاغ: {inv.reason}</Text>

                {inv.result ? (
                  <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>🔍 التقييم والنتيجة الميدانية:</Text>
                    <Text style={styles.resultText}>{inv.result}</Text>
                  </View>
                ) : null}

                {/* المواد المتضررة إن وجدت */}
                {inv.affectedMaterials && inv.affectedMaterials.length > 0 && (
                  <View style={styles.affectedBox}>
                    <Text style={styles.affectedLabel}>⚠️ المواد المتضررة المحددة:</Text>
                    <View style={styles.tagsContainer}>
                      {inv.affectedMaterials.map(matId => {
                        const mat = materials.find(m => m.id === matId);
                        return (
                          <View key={matId} style={styles.tagItem}>
                            <Text style={styles.tagText}>{mat ? mat.name : matId}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
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
  
  invCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder, elevation: 2 },
  cardActive: { borderLeftWidth: 6, borderLeftColor: COLORS.accent, backgroundColor: '#FFFDF0' },
  cardRepair: { borderLeftWidth: 6, borderLeftColor: COLORS.danger },
  
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  invDate: { fontSize: 11, color: COLORS.gray },
  actionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeActive: { backgroundColor: '#FEF3C7' },
  badgeRepair: { backgroundColor: '#FEE2E2' },
  badgeOk: { backgroundColor: '#D1FAE5' },
  actionText: { fontSize: 11, fontWeight: 'bold' },
  textActive: { color: '#B45309' },
  textRepair: { color: '#991B1B' },
  textOk: { color: '#065F46' },
  
  siteTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.primaryLight, textAlign: 'right', marginBottom: 4 },
  reasonText: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 8 },
  
  resultBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginTop: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  resultLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.gray, textAlign: 'right', marginBottom: 2 },
  resultText: { fontSize: 13, color: COLORS.dark, textAlign: 'right', lineHeight: 18 },
  
  affectedBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
  affectedLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.danger, textAlign: 'right', marginBottom: 6 },
  tagsContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  tagItem: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: 'bold', color: '#991B1B' }
});
