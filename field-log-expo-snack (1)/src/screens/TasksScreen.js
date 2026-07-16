import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { useFieldLog } from '../context/FieldLogContext';

export default function TasksScreen() {
  const { tasks, sites, completeTask, returnMaterialToSite } = useFieldLog();
  const [showCompleted, setShowCompleted] = useState(false);

  // تجميع كل عمليات السحب للصيانة النشطة من جميع المواقع
  const activePulledOperations = [];
  sites.forEach(site => {
    if (site.pulledMaterials && site.pulledMaterials.length > 0) {
      site.pulledMaterials.forEach(pullItem => {
        activePulledOperations.push({
          siteId: site.id,
          siteName: site.name,
          siteCode: site.code,
          ...pullItem
        });
      });
    }
  });

  // المهام المعلقة العادية (صيانة أو طلبات مواد أو استكشاف ميداني) - نستثني منها المواد التي تم سحبها للورشة حتى لا تتكرر
  const pendingTasks = tasks.filter(t => {
    if (t.status === 'منجزة') return false;
    // التحقق مما إذا كانت هذه المادة مسحوبة حالياً للورشة الفنية
    const isThisMaterialPulled = activePulledOperations.some(p => p.siteId === t.siteId && p.materialId === t.materialId);
    return !isThisMaterialPulled;
  });

  const completedTasks = tasks.filter(t => t.status === 'منجزة');

  // إنجاز الصيانة وإرجاع المادة للموقع من شاشة المهام مباشرة
  const handleCompletePullOperation = (op) => {
    Alert.alert(
      'إنجاز الصيانة وإرجاع المادة 🚩',
      `هل تم إتمام صيانة (${op.materialName}) بالورشة الخارجية وإعادتها للعمل في (${op.siteName})؟\n\nتنبيه: عند التأكيد سيتم إرجاع المادة فوراً لخدمة الموقع، وإقفال مهمة الصيانة، وتوثيق حركة الارتجاع!`,
      [
        {
          text: 'نعم، إنجاز الصيانة وإرجاع المادة للموقع',
          onPress: () => {
            returnMaterialToSite(op.siteId, op.id, false);
            Alert.alert('تم الإرجاع بنجاح 🔙✔️', `عادت المادة (${op.materialName}) إلى خدمة الموقع (${op.siteName}) وتم إقفال المهمة وتحديث الأرصدة تلقائياً.`);
          }
        },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  // إنجاز مهمة صيانة أو طلب مادة عادي
  const handleCompleteTask = (task) => {
    Alert.alert(
      'تأكيد إنجاز المهمة 🚩',
      `هل تم إنجاز (${task.title}) في (${task.siteName})؟\n\nتنبيه: عند التأكيد سيتم نقل المهمة للمنجزة وإلغاء الحاجة للمادة تلقائياً من سجل الموقع!`,
      [
        {
          text: 'نعم، إنجاز المهمة الآن',
          onPress: () => {
            completeTask(task.id);
            Alert.alert('تم الإنجاز ✔️', 'تم إقفال المهمة وتحديث بيانات الموقع المرتبط تلقائياً.');
          }
        },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ملخص إحصائيات المهام والعمليات */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNum}>{pendingTasks.length}</Text>
            <Text style={styles.summaryLabel}>مهام معلقة بالموقع</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Text style={[styles.summaryNum, { color: COLORS.info }]}>{activePulledOperations.length}</Text>
            <Text style={styles.summaryLabel}>عمليات سحب بالورشة</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.summaryNum, { color: COLORS.secondary }]}>{completedTasks.length}</Text>
            <Text style={styles.summaryLabel}>مهام منجزة ومقفلة</Text>
          </View>
        </View>

        {/* ==================== 1. قسم عمليات سحب للصيانة (المواد المسحوبة بالورشة الخارجية) ==================== */}
        <View style={styles.pulledSectionBox}>
          <Text style={styles.pulledSectionHeader}>
            📥 عمليات سحب للصيانة (مواد مسحوبة للورشة الفنية) ({activePulledOperations.length})
          </Text>
          <Text style={styles.pulledSectionHint}>
            💡 هذه الميزات تتيح لك إدارة الأجهزة المسحوبة خارج المواقع، وبمجرد الضغط على زر "إنجاز وإرجاع للموقع" تعود المادة للخدمة النشطة بالموقع فوراً لأنها تمت صيانتها!
          </Text>

          {activePulledOperations.length === 0 ? (
            <View style={styles.emptyPulledBox}>
              <Text style={styles.emptyPulledText}>لا توجد أجهزة مسحوبة للورشة حالياً من أي موقع.</Text>
            </View>
          ) : (
            activePulledOperations.map(op => (
              <View key={op.id} style={styles.pulledCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.badgePulled}>
                    <Text style={styles.textPulled}>🔧 مسحوبة للصيانة بالورشة</Text>
                  </View>
                  <Text style={styles.taskDate}>سُحبت في: {op.pullDate}</Text>
                </View>

                <Text style={styles.siteTitle}>📍 الموقع: {op.siteName}</Text>
                <Text style={styles.taskTitle}>📦 المادة: {op.materialName}</Text>

                {op.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>📝 ملاحظة السحب: {op.notes}</Text>
                  </View>
                ) : null}

                {/* زر إنجاز الصيانة وإرجاع المادة للموقع */}
                <TouchableOpacity
                  style={styles.returnCompleteBtn}
                  onPress={() => handleCompletePullOperation(op)}
                >
                  <Text style={styles.returnCompleteBtnText}>✔ إنجاز المهمة وإرجاع المادة للموقع بالخدمة 🔙</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ==================== 2. قسم المهام الميدانية المعلقة في المواقع ==================== */}
        <Text style={styles.sectionHeader}>⚡ المهام والاحتياجات الميدانية في المواقع ({pendingTasks.length})</Text>

        {pendingTasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>لا توجد مهام معلقة في المواقع</Text>
            <Text style={styles.emptySub}>جميع التجهيزات والتمديدات المربوطة بالمواقع تعمل بكفاءة عالية دون طلبات معلقة.</Text>
          </View>
        ) : (
          pendingTasks.map(task => {
            const isInvest = task.type === 'صيانة – استكشاف ميداني';
            const isReq = task.type === 'مادة مطلوبة';

            return (
              <View key={task.id} style={[styles.taskCard, isInvest && styles.taskCardInvest]}>
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.typeBadge,
                    isInvest ? styles.badgeInvest : (isReq ? styles.badgeReq : styles.badgeMaint)
                  ]}>
                    <Text style={[
                      styles.typeText,
                      isInvest ? styles.textInvest : (isReq ? styles.textReq : styles.textMaint)
                    ]}>
                      {task.type}
                    </Text>
                  </View>
                  <Text style={styles.taskDate}>{task.createdAt}</Text>
                </View>

                {/* اسم الموقع وعنوان المهمة */}
                <Text style={styles.siteTitle}>📍 {task.siteName}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                
                {task.description ? (
                  <Text style={styles.taskDesc}>{task.description}</Text>
                ) : null}

                {/* زر إنجاز المهمة البارز */}
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => handleCompleteTask(task)}
                >
                  <Text style={styles.completeBtnText}>✔ إنجاز المهمة وإقفالها</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* زر ومساحة المهام المنجزة القابلة للتوسيع */}
        <TouchableOpacity
          style={styles.toggleCompletedBtn}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Text style={styles.toggleCompletedText}>
            {showCompleted ? '▲ إخفاء المهام المنجزة' : `▼ عرض الأرشيف: المهام المنجزة ومستودع الإنجازات (${completedTasks.length})`}
          </Text>
        </TouchableOpacity>

        {showCompleted && (
          <View style={styles.completedSection}>
            {completedTasks.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد مهام منجزة مسجلة في الأرشيف حتى الآن.</Text>
            ) : (
              completedTasks.map(task => (
                <View key={task.id} style={styles.completedCard}>
                  <View style={styles.completedHeader}>
                    <Text style={styles.completedTitle}>✔ {task.title}</Text>
                    <Text style={styles.completedDate}>أنجزت: {task.completedAt}</Text>
                  </View>
                  <Text style={styles.completedSite}>الموقع: {task.siteName} ({task.type})</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  scrollArea: { padding: 14 },
  
  summaryBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  summaryBox: { flex: 1, backgroundColor: '#FFFBEB', paddingVertical: 10, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' },
  summaryNum: { fontSize: 20, fontWeight: 'bold', color: COLORS.accent },
  summaryLabel: { fontSize: 9, color: COLORS.dark, marginTop: 2, textAlign: 'center', fontWeight: 'bold' },
  
  pulledSectionBox: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6', borderWidth: 2, borderRadius: 16, padding: 14, marginBottom: 20 },
  pulledSectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#1E40AF', textAlign: 'right', marginBottom: 4 },
  pulledSectionHint: { fontSize: 11, color: '#1E3A8A', textAlign: 'right', lineHeight: 17, marginBottom: 12 },
  emptyPulledBox: { backgroundColor: COLORS.white, padding: 16, borderRadius: 10, alignItems: 'center' },
  emptyPulledText: { color: COLORS.gray, fontSize: 12, fontWeight: 'bold' },
  
  pulledCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12, borderLeftWidth: 6, borderLeftColor: COLORS.info, elevation: 3 },
  badgePulled: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  textPulled: { color: '#1E40AF', fontSize: 11, fontWeight: 'bold' },
  notesBox: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 6, marginVertical: 8 },
  notesText: { fontSize: 12, color: COLORS.dark, textAlign: 'right', lineHeight: 18 },
  returnCompleteBtn: { backgroundColor: COLORS.info, paddingVertical: 13, borderRadius: 10, alignItems: 'center', elevation: 2, marginTop: 4 },
  returnCompleteBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 12 },
  
  emptyBox: { backgroundColor: COLORS.white, padding: 26, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16 },
  emptyIcon: { fontSize: 40, marginBottom: 6 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.gray, textAlign: 'center', lineHeight: 18 },
  
  taskCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder, elevation: 2 },
  taskCardInvest: { borderColor: COLORS.accent, borderWidth: 2, backgroundColor: '#FFFDF0' },
  
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskDate: { fontSize: 11, color: COLORS.gray },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeMaint: { backgroundColor: '#FEE2E2' },
  badgeReq: { backgroundColor: '#DBEAFE' },
  badgeInvest: { backgroundColor: '#FEF3C7' },
  typeText: { fontSize: 11, fontWeight: 'bold' },
  textMaint: { color: '#991B1B' },
  textReq: { color: '#1E40AF' },
  textInvest: { color: '#B45309' },
  
  siteTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.primaryLight, textAlign: 'right', marginBottom: 2 },
  taskTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 6 },
  taskDesc: { fontSize: 12, color: COLORS.gray, textAlign: 'right', lineHeight: 18, marginBottom: 12 },
  
  completeBtn: { backgroundColor: COLORS.secondary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', elevation: 2 },
  completeBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  
  toggleCompletedBtn: { backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 14, marginBottom: 10 },
  toggleCompletedText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 13 },
  
  completedSection: { marginTop: 8 },
  completedCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  completedHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  completedTitle: { fontSize: 13, fontWeight: 'bold', color: '#065F46' },
  completedDate: { fontSize: 10, color: COLORS.gray },
  completedSite: { fontSize: 11, color: COLORS.dark, textAlign: 'right' },
  emptyText: { fontSize: 12, color: COLORS.gray, textAlign: 'center', paddingVertical: 12 }
});
