import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { useFieldLog } from '../context/FieldLogContext';

export default function SiteDetailsScreen({ site, onBack }) {
  const { 
    materials, 
    updateSiteActiveMaterials,
    updateSiteDetails, 
    pullMaterialForRepair, 
    startInvestigation, 
    finishInvestigation,
    getSiteAnalytics
  } = useFieldLog();

  // الحالة المحلية لتعديل مواد الصيانة والمواد المطلوبة والمواد بالخدمة
  const [needsMaintenance, setNeedsMaintenance] = useState(site.needsMaintenance || []);
  const [requiredMaterials, setRequiredMaterials] = useState(site.requiredMaterials || []);
  const [activeMaterials, setActiveMaterials] = useState(site.activeMaterials || []);

  // حالة النوافذ (Modals)
  const [pickerModal, setPickerModal] = useState({ visible: false, targetField: '' });
  const [searchPickerQuery, setSearchPickerQuery] = useState('');

  // حالة تعديل مواد الموقع الفعاله في أي وقت
  const [editActiveModalVisible, setEditActiveModalVisible] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // حالة نافذة الإحصائيات الشاملة للموقع
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

  // حالة سحب مادة للصيانة
  const [pullModal, setPullModal] = useState({ visible: false, matId: null, matName: '' });
  const [pullNotes, setPullNotes] = useState('');

  // حالة استكشاف الأعطال (نزول ميداني / إنهاء استكشاف)
  const [startInvModal, setStartInvModal] = useState(false);
  const [invReason, setInvReason] = useState('');

  const [finishInvModal, setFinishInvModal] = useState(false);
  const [invResult, setInvResult] = useState('');
  const [invAction, setInvAction] = useState('يحتاج صيانة');
  const [problemDescription, setProblemDescription] = useState('');
  const [affectedMats, setAffectedMats] = useState([]);
  const [autoFinishTasks, setAutoFinishTasks] = useState(true);

  // تحديث التغييرات الأساسية (صيانة وطلبات) في سجل الموقع
  const handleSaveChanges = () => {
    updateSiteDetails(site.id, {
      needsMaintenance,
      requiredMaterials
    });
    Alert.alert('تم التحديث ✔️', 'تم حفظ التغييرات وتوليد المهام الميدانية التلقائية في قائمة المهام وتخزينها محلياً.');
  };

  // تبديل اختيار مادة للموقع (تعديل المواد المربوطة بالخدمة في أي وقت)
  const toggleActiveMaterialSelection = (matId) => {
    if (activeMaterials.includes(matId)) {
      setActiveMaterials(activeMaterials.filter(id => id !== matId));
    } else {
      setActiveMaterials([...activeMaterials, matId]);
    }
  };

  const handleSaveActiveMaterialsEdit = () => {
    updateSiteActiveMaterials(site.id, activeMaterials);
    setEditActiveModalVisible(false);
    Alert.alert('تم تعديل أجهزة الموقع ✔️', 'تم حفظ تحديث قائمة الأجهزة والمواد العاملة في الخدمة بهذا الموقع بنجاح.');
  };

  // فتح وإضافة مادة في الخانة المحددة (صيانة أو مطلوب)
  const handleToggleItemInField = (matId) => {
    if (pickerModal.targetField === 'maintenance') {
      if (needsMaintenance.includes(matId)) {
        setNeedsMaintenance(needsMaintenance.filter(id => id !== matId));
      } else {
        setNeedsMaintenance([...needsMaintenance, matId]);
      }
    } else if (pickerModal.targetField === 'required') {
      if (requiredMaterials.includes(matId)) {
        setRequiredMaterials(requiredMaterials.filter(id => id !== matId));
      } else {
        setRequiredMaterials([...requiredMaterials, matId]);
      }
    } else if (pickerModal.targetField === 'affected') {
      if (affectedMats.includes(matId)) {
        setAffectedMats(affectedMats.filter(id => id !== matId));
      } else {
        setAffectedMats([...affectedMats, matId]);
      }
    }
  };

  // تأكيد سحب مادة للصيانة (تظهر في الموقع وتفتح مهمة في قائمة المهام تحت قسم عمليات سحب للصيانة)
  const handleConfirmPull = () => {
    pullMaterialForRepair(site.id, pullModal.matId, pullNotes);
    setActiveMaterials(activeMaterials.filter(id => id !== pullModal.matId));
    setPullModal({ visible: false, matId: null, matName: '' });
    setPullNotes('');
    Alert.alert('تم السحب للورشة 🔧', `تم سحب المادة من الخدمة المباشرة ونقلها إلى قسم (عمليات سحب للصيانة) داخل قائمة المهام حيث يمكنك إنجازها وإرجاعها للموقع من هناك!`);
  };

  // بدء نزول لاستكشاف عطل
  const handleStartInvestigation = () => {
    if (!invReason.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال سبب النزول أو وصف البلاغ الأولي');
      return;
    }
    startInvestigation(site.id, invReason.trim());
    setInvReason('');
    setStartInvModal(false);
    Alert.alert('تم بدء النزول الميداني 🚨', `تم تحويل حالة الموقع إلى (قيد الاستكشاف) ويمكنك لاحقاً توثيق تقرير النتيجة من نفس الشاشة.`);
  };

  // إنهاء الاستكشاف وحفظ النتيجة
  const handleFinishInvestigation = () => {
    if (invAction === 'يحتاج صيانة' && !problemDescription.trim()) {
      Alert.alert('حقل إلزامي ⚠️', 'يرجى إدخال (وصف المشكلة) لتوليد مهمة الصيانة الميدانية بدقة.');
      return;
    }

    finishInvestigation(
      site.id,
      site.lastInvestigation ? site.lastInvestigation.id : null,
      invResult.trim(),
      invAction,
      affectedMats,
      problemDescription.trim(),
      autoFinishTasks
    );

    setFinishInvModal(false);
    setInvResult('');
    setProblemDescription('');
    setAffectedMats([]);
    Alert.alert('تم إنهاء الاستكشاف الميداني ✔️', 'تم توثيق النتيجة وتحديث المهام تلقائياً بنجاح.');
  };

  // تصفية المواد للبحث
  const filteredLibraryMaterials = materials.filter(m => 
    m.name.includes(searchPickerQuery) || m.category.includes(searchPickerQuery)
  );

  const filteredActiveMaterialsPicker = materials.filter(m => 
    m.name.includes(activeSearchQuery) || m.category.includes(activeSearchQuery)
  );

  const analyticsData = getSiteAnalytics(site.id);

  return (
    <View style={styles.container}>
      {/* شريط العنوان العلوي وتراجع */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>➡ عودة للوحة</Text>
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.siteTitleText}>{site.name}</Text>
          <Text style={styles.siteSubText}>الكود: {site.code} | {site.location}</Text>
        </View>
        <TouchableOpacity style={styles.analyticsBtn} onPress={() => setAnalyticsModalVisible(true)}>
          <Text style={styles.analyticsBtnText}>📊 الإحصائيات</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* زر الإحصائيات الشامل بوسط الشاشة للوصول السريع */}
        <TouchableOpacity style={styles.analyticsBanner} onPress={() => setAnalyticsModalVisible(true)}>
          <Text style={styles.analyticsBannerIcon}>📈</Text>
          <View style={{ flex: 1, textAlign: 'right' }}>
            <Text style={styles.analyticsBannerTitle}>إحصائيات وسجل حركات الإنجاز والصرف للموقع</Text>
            <Text style={styles.analyticsBannerSub}>استعراض كم مرة تم إنجاز مهام في الموقع أو سحب أجهزة وسجل زمني مفصل</Text>
          </View>
          <Text style={styles.arrowIcon}>⬅</Text>
        </TouchableOpacity>

        {/* تنبيه حالة الموقع إذا كان قيد الاستكشاف */}
        {site.status === 'قيد الاستكشاف' && (
          <View style={styles.investActiveAlert}>
            <View style={{ flex: 1, textAlign: 'right' }}>
              <Text style={styles.investAlertTitle}>⚡ الموقع حالياً قيد الاستكشاف الميداني</Text>
              <Text style={styles.investAlertSub}>سبب النزول: {site.lastInvestigation?.reason || 'فحص عام'}</Text>
            </View>
            <TouchableOpacity style={styles.finishInvestBtn} onPress={() => setFinishInvModal(true)}>
              <Text style={styles.finishInvestBtnText}>📝 إنهاء وإضافة النتيجة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* زر النزول لاستكشاف عطل في حال عدم وجود استكشاف نشط */}
        {site.status !== 'قيد الاستكشاف' && (
          <TouchableOpacity style={styles.startInvestBanner} onPress={() => setStartInvModal(true)}>
            <Text style={styles.startInvestBannerIcon}>🔍</Text>
            <View style={{ flex: 1, textAlign: 'right' }}>
              <Text style={styles.startInvestBannerTitle}>نزول ميداني لاستكشاف عطل بالموقع</Text>
              <Text style={styles.startInvestBannerSub}>توثيق البلاغات والفحص الميداني وتوليد مهام الصيانة</Text>
            </View>
            <Text style={styles.arrowIcon}>⬅</Text>
          </TouchableOpacity>
        )}

        {/* ==================== 1. خانة مواد تحتاج صيانة ==================== */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🛠️ 1. مواد تحتاج صيانة (في الموقع)</Text>
            <TouchableOpacity
              style={styles.pickBtn}
              onPress={() => {
                setSearchPickerQuery('');
                setPickerModal({ visible: true, targetField: 'maintenance' });
              }}
            >
              <Text style={styles.pickBtnText}>+ اختر أو أضف مادة</Text>
            </TouchableOpacity>
          </View>

          {needsMaintenance.length === 0 ? (
            <Text style={styles.emptyFieldText}>لا توجد أجهزة أو مواد مدرجة للصيانة حالياً.</Text>
          ) : (
            <View style={styles.tagsContainer}>
              {needsMaintenance.map(matId => {
                const mat = materials.find(m => m.id === matId);
                return (
                  <View key={matId} style={[styles.tagItem, styles.tagMaintenance]}>
                    <TouchableOpacity onPress={() => setNeedsMaintenance(needsMaintenance.filter(id => id !== matId))}>
                      <Text style={styles.tagRemoveBtn}>× </Text>
                    </TouchableOpacity>
                    <Text style={styles.tagText}>{mat ? mat.name : matId}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ==================== 2. خانة مواد مطلوبة للموقع ==================== */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📦 2. مواد مطلوبة للموقع (نواقص واحتياجات)</Text>
            <TouchableOpacity
              style={[styles.pickBtn, { backgroundColor: COLORS.info }]}
              onPress={() => {
                setSearchPickerQuery('');
                setPickerModal({ visible: true, targetField: 'required' });
              }}
            >
              <Text style={styles.pickBtnText}>+ طلب مادة للموقع</Text>
            </TouchableOpacity>
          </View>

          {requiredMaterials.length === 0 ? (
            <Text style={styles.emptyFieldText}>لا توجد نواقص أو طلبات مواد مسجلة لهذا الموقع.</Text>
          ) : (
            <View style={styles.tagsContainer}>
              {requiredMaterials.map(matId => {
                const mat = materials.find(m => m.id === matId);
                return (
                  <View key={matId} style={[styles.tagItem, styles.tagRequired]}>
                    <TouchableOpacity onPress={() => setRequiredMaterials(requiredMaterials.filter(id => id !== matId))}>
                      <Text style={styles.tagRemoveBtn}>× </Text>
                    </TouchableOpacity>
                    <Text style={[styles.tagText, { color: '#1E40AF' }]}>{mat ? mat.name : matId}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* زر حفظ التغييرات الأساسية */}
        <TouchableOpacity style={styles.saveChangesBtn} onPress={handleSaveChanges}>
          <Text style={styles.saveChangesBtnText}>💾 حفظ تحديثات الصيانة والطلبات للموقع</Text>
        </TouchableOpacity>

        {/* ==================== 3. قائمة المواد العاملة بالموقع وإمكانية تعديلها في أي وقت ==================== */}
        <View style={[styles.sectionCard, { marginTop: 20 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>📡 الأجهزة والمواد العاملة حالياً بالخدمة ({activeMaterials?.length || 0})</Text>
            <TouchableOpacity
              style={[styles.pickBtn, { backgroundColor: COLORS.secondary }]}
              onPress={() => {
                setActiveSearchQuery('');
                setEditActiveModalVisible(true);
              }}
            >
              <Text style={styles.pickBtnText}>✏️ إضافة/تعديل أجهزة الموقع</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subHint}>
            يمكنك إضافة أو إزالة أي أجهزة يعمل بها الموقع في أي وقت بالضغط على زر (✏️ إضافة/تعديل أجهزة الموقع). ولإرسال جهاز للورشة اضغط "سحب للصيانة".
          </Text>

          {activeMaterials?.length === 0 ? (
            <Text style={styles.emptyFieldText}>لا توجد أجهزة مربوطة بالخدمة حالياً. اضغط (✏️ إضافة/تعديل أجهزة الموقع) لإضافتها.</Text>
          ) : (
            activeMaterials?.map(matId => {
              const mat = materials.find(m => m.id === matId);
              if (!mat) return null;
              return (
                <View key={matId} style={styles.activeMatRow}>
                  <View style={{ flex: 1, textAlign: 'right' }}>
                    <Text style={styles.activeMatName}>{mat.name}</Text>
                    <Text style={styles.activeMatCat}>{mat.category} | {mat.code}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.pullBtn}
                    onPress={() => setPullModal({ visible: true, matId: mat.id, matName: mat.name })}
                  >
                    <Text style={styles.pullBtnText}>🔧 سحب للصيانة</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* ==================== 4. قسم مواد مسحوبة للصيانة بالموقع (توضيح الترابط مع المهام) ==================== */}
        <View style={[styles.sectionCard, { borderColor: COLORS.info, borderWidth: 2 }]}>
          <Text style={[styles.cardTitle, { color: COLORS.info }]}>
            📥 مواد مسحوبة للصيانة الخارجية ({site.pulledMaterials?.length || 0})
          </Text>
          <Text style={styles.subHint}>
            💡 تنبيه: وفقاً للنظام الميداني، تظهر كل عملية سحب للصيانة هنا وفي شاشة (قائمة المهام - قسم عمليات سحب للصيانة)، وعند إنجاز المهمة هناك تعود المادة تلقائياً للخدمة بهذا الموقع!
          </Text>

          {site.pulledMaterials?.length === 0 ? (
            <Text style={styles.emptyFieldText}>لا توجد مواد مسحوبة من هذا الموقع للورشة حالياً.</Text>
          ) : (
            site.pulledMaterials?.map(p => (
              <View key={p.id} style={styles.pulledCard}>
                <View style={styles.pulledHeader}>
                  <Text style={styles.pulledName}>{p.materialName}</Text>
                  <Text style={styles.pulledDate}>سُحبت في: {p.pullDate}</Text>
                </View>
                {p.notes ? <Text style={styles.pulledNotes}>📝 ملاحظة السحب: {p.notes}</Text> : null}
                <View style={styles.pulledFooterAlert}>
                  <Text style={styles.pulledFooterAlertText}>➡ اضغط "إنجاز المهمة" في شاشة (قائمة المهام) لإرجاعها للخدمة هنا</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ==================== نوافذ الاختيار والإحصائيات والعمليات (Modals) ==================== */}

      {/* 1. نافذة إحصائيات وسجل حركات الموقع الشامل */}
      <Modal visible={analyticsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '92%' }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.modalTitle}>📊 إحصائيات وسجل حركات موقع ({site.name})</Text>
            </View>

            {analyticsData && (
              <ScrollView style={{ maxHeight: 500, marginVertical: 10 }}>
                {/* ملخص الإنجازات والحركات */}
                <View style={styles.analyticsStatsGrid}>
                  <View style={styles.analyticsStatCard}>
                    <Text style={styles.analyticsStatNum}>{analyticsData.totalCompletedTasks}</Text>
                    <Text style={styles.analyticsStatLabel}>✔ مهام منجزة ومقفلة</Text>
                  </View>
                  <View style={[styles.analyticsStatCard, { borderColor: COLORS.info }]}>
                    <Text style={[styles.analyticsStatNum, { color: COLORS.info }]}>{analyticsData.totalMovements}</Text>
                    <Text style={styles.analyticsStatLabel}>🔄 حركات صرف وسحب وإرجاع</Text>
                  </View>
                </View>

                <View style={styles.analyticsStatsGrid}>
                  <View style={[styles.analyticsStatCard, { borderColor: COLORS.accent }]}>
                    <Text style={[styles.analyticsStatNum, { color: COLORS.accent }]}>{analyticsData.totalInvestigations}</Text>
                    <Text style={styles.analyticsStatLabel}>🔍 استكشافات ونزول ميداني</Text>
                  </View>
                  <View style={[styles.analyticsStatCard, { borderColor: COLORS.danger }]}>
                    <Text style={[styles.analyticsStatNum, { color: COLORS.danger }]}>{analyticsData.totalPendingTasks}</Text>
                    <Text style={styles.analyticsStatLabel}>⚡ مهام نشطة بانتظار الإنجاز</Text>
                  </View>
                </View>

                {/* الخط الزمني المفصل لكل ما صار بالموقع */}
                <Text style={[styles.sectionHeader, { marginTop: 14 }]}>⏳ السجل الزمني المفصل (Audit Trail Timeline):</Text>
                {analyticsData.timeline && analyticsData.timeline.length === 0 ? (
                  <Text style={styles.emptyFieldText}>لا توجد حركات أو إنجازات سابقة مسجلة لهذا الموقع حتى الآن.</Text>
                ) : (
                  analyticsData.timeline?.map(item => (
                    <View key={item.id} style={styles.timelineItem}>
                      <View style={styles.timelineIconBox}>
                        <Text style={styles.timelineIconText}>{item.icon}</Text>
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeader}>
                          <Text style={styles.timelineTitle}>{item.title}</Text>
                          <Text style={styles.timelineDate}>{item.date}</Text>
                        </View>
                        <Text style={styles.timelineDetails}>{item.details}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.saveChangesBtn} onPress={() => setAnalyticsModalVisible(false)}>
              <Text style={styles.saveChangesBtnText}>إغلاق شاشة الإحصائيات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. نافذة تعديل المواد التي يعمل بها الموقع بالخدمة في أي وقت */}
      <Modal visible={editActiveModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ إضافة وتعديل أجهزة ومواد الموقع بالخدمة</Text>
            <Text style={styles.hintText}>اختر المواد والأجهزة من المكتبة لإضافتها أو إزالتها من الخدمة الفعلية بهذا الموقع:</Text>
            
            <TextInput
              style={styles.input}
              placeholder="🔍 ابحث في مكتبة المواد..."
              placeholderTextColor="#9CA3AF"
              value={activeSearchQuery}
              onChangeText={setActiveSearchQuery}
            />

            <ScrollView style={{ maxHeight: 350, marginVertical: 10 }}>
              {filteredActiveMaterialsPicker.map(mat => {
                const isSelected = activeMaterials.includes(mat.id);
                return (
                  <TouchableOpacity
                    key={mat.id}
                    style={[styles.matSelectItem, isSelected && styles.matSelectItemSelected]}
                    onPress={() => toggleActiveMaterialSelection(mat.id)}
                  >
                    <Text style={[styles.matSelectText, isSelected && { color: COLORS.white }]}>
                      {isSelected ? '✔ ' : '+ '} {mat.name}
                    </Text>
                    <Text style={[styles.matSelectCat, isSelected && { color: '#E0F2FE' }]}>{mat.category}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveActiveMaterialsEdit}>
                <Text style={styles.saveBtnText}>💾 حفظ تحديث قائمة أجهزة الموقع</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditActiveModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. نافذة اختيار مواد من مكتبة المواد (صيانة / طلبات) */}
      <Modal visible={pickerModal.visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {pickerModal.targetField === 'maintenance' ? '🛠️ اختيار مواد تحتاج صيانة' : (pickerModal.targetField === 'required' ? '📦 طلب مواد لاحتياج الموقع' : '🔗 تحديد المواد المتضررة')}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="🔍 ابحث في مكتبة المواد..."
              placeholderTextColor="#9CA3AF"
              value={searchPickerQuery}
              onChangeText={setSearchPickerQuery}
            />

            <ScrollView style={{ maxHeight: 350, marginVertical: 10 }}>
              {filteredLibraryMaterials.map(mat => {
                const list = pickerModal.targetField === 'maintenance' ? needsMaintenance : (pickerModal.targetField === 'required' ? requiredMaterials : affectedMats);
                const isSelected = list.includes(mat.id);
                return (
                  <TouchableOpacity
                    key={mat.id}
                    style={[styles.matSelectItem, isSelected && styles.matSelectItemSelected]}
                    onPress={() => handleToggleItemInField(mat.id)}
                  >
                    <Text style={[styles.matSelectText, isSelected && { color: COLORS.white }]}>
                      {isSelected ? '✔ ' : '+ '} {mat.name}
                    </Text>
                    <Text style={[styles.matSelectCat, isSelected && { color: '#E0F2FE' }]}>{mat.category}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.saveChangesBtn} onPress={() => setPickerModal({ visible: false, targetField: '' })}>
              <Text style={styles.saveChangesBtnText}>✔ اعتماد الاختيار وإغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. نافذة تأكيد سحب مادة للصيانة */}
      <Modal visible={pullModal.visible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 340 }]}>
            <Text style={styles.modalTitle}>🔧 تأكيد سحب مادة للصيانة الخارجية</Text>
            <Text style={styles.label}>المادة المستهدفة: {pullModal.matName}</Text>
            <Text style={styles.subHint}>عند تأكيد السحب، ستُنقل المادة إلى قسم (عمليات سحب للصيانة) داخل شاشة قائمة المهام حيث يمكنك تأكيد إنجازها وإرجاعها للعمل من هناك.</Text>
            
            <Text style={styles.label}>ملاحظة أو سبب السحب (اختياري):</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: نقلت للورشة الفنية بسبب عطل في دائرة التغذية"
              placeholderTextColor="#9CA3AF"
              value={pullNotes}
              onChangeText={setPullNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmPull}>
                <Text style={styles.saveBtnText}>✔ تأكيد السحب للورشة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPullModal({ visible: false, matId: null, matName: '' })}>
                <Text style={styles.cancelBtnText}>تراجع</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. نافذة بدء نزول لاستكشاف عطل */}
      <Modal visible={startInvModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 320 }]}>
            <Text style={styles.modalTitle}>🚨 توثيق نزول ميداني لاستكشاف عطل</Text>
            <Text style={styles.subHint}>سيتم تسجيل التاريخ تلقائياً وتحويل حالة الموقع إلى (قيد الاستكشاف) لتمييزه في اللوحة.</Text>
            
            <Text style={styles.label}>سبب النزول / البلاغ الأولي:</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: انقطاع إشارة التكرار في الفجر وضعف البطاريات"
              placeholderTextColor="#9CA3AF"
              value={invReason}
              onChangeText={setInvReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.accent }]} onPress={handleStartInvestigation}>
                <Text style={styles.saveBtnText}>🚀 بدء الاستكشاف الميداني</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setStartInvModal(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. نافذة إنهاء الاستكشاف وتوثيق النتيجة */}
      <Modal visible={finishInvModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 تقرير إنهاء الاستكشاف الميداني</Text>
            
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.label}>نتيجة الاستكشاف والفحص (اختياري):</Text>
              <TextInput
                style={styles.input}
                placeholder="تفاصيل ما تم فحصه في الموقع..."
                placeholderTextColor="#9CA3AF"
                value={invResult}
                onChangeText={setInvResult}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>الإجراء المتخذ أو القرار الميداني:</Text>
              <View style={styles.actionOptions}>
                {['لا يوجد عطل', 'تم إصلاحه ميدانياً', 'يحتاج صيانة'].map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.actionOptionBtn, invAction === opt && styles.actionOptionBtnActive]}
                    onPress={() => setInvAction(opt)}
                  >
                    <Text style={[styles.actionOptionText, invAction === opt && styles.actionOptionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {invAction === 'تم إصلاحه ميدانياً' && (
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAutoFinishTasks(!autoFinishTasks)}
                >
                  <Text style={styles.checkboxIcon}>{autoFinishTasks ? '☑' : '☐'}</Text>
                  <Text style={styles.checkboxLabel}>إنجاز وإنهاء كافة المهام المعلقة (صيانة/طلبات) لهذا الموقع تلقائياً</Text>
                </TouchableOpacity>
              )}

              {invAction === 'يحتاج صيانة' && (
                <View style={styles.needsRepairBox}>
                  <Text style={[styles.label, { color: COLORS.danger }]}>
                    وصف المشكلة وتفاصيل العطل <Text style={{fontWeight: 'bold'}}>* (إلزامي لتوليد المهمة)</Text>:
                  </Text>
                  <TextInput
                    style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                    multiline
                    placeholder="اشرح المشكلة الفنية بدقة (مثال: احتراق وحدة الإرسال بالحارة الثانية والتمدید بحاجة لتغيير)..."
                    placeholderTextColor="#9CA3AF"
                    value={problemDescription}
                    onChangeText={setProblemDescription}
                  />

                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.label}>تحديد المواد المتضررة؟ (اختياري):</Text>
                    <TouchableOpacity
                      style={styles.pickBtn}
                      onPress={() => {
                        setSearchPickerQuery('');
                        setPickerModal({ visible: true, targetField: 'affected' });
                      }}
                    >
                      <Text style={styles.pickBtnText}>+ إضافة مواد من المكتبة</Text>
                    </TouchableOpacity>
                  </View>

                  {affectedMats.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {affectedMats.map(matId => {
                        const mat = materials.find(m => m.id === matId);
                        return (
                          <View key={matId} style={[styles.tagItem, styles.tagMaintenance]}>
                            <TouchableOpacity onPress={() => setAffectedMats(affectedMats.filter(id => id !== matId))}>
                              <Text style={styles.tagRemoveBtn}>× </Text>
                            </TouchableOpacity>
                            <Text style={styles.tagText}>{mat ? mat.name : matId}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.secondary }]} onPress={handleFinishInvestigation}>
                <Text style={styles.saveBtnText}>✔ حفظ وإنهاء الاستكشاف وتحديث المهام</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setFinishInvModal(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  headerBar: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: COLORS.primaryDark, padding: 12, elevation: 4 },
  backBtn: { backgroundColor: '#374151', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 11 },
  titleArea: { flex: 1, textAlign: 'right', marginHorizontal: 10 },
  siteTitleText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, textAlign: 'right' },
  siteSubText: { fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginTop: 2 },
  analyticsBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  analyticsBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 11 },
  
  scrollArea: { padding: 14 },
  
  analyticsBanner: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14 },
  analyticsBannerIcon: { fontSize: 24, marginLeft: 10 },
  analyticsBannerTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E40AF', textAlign: 'right' },
  analyticsBannerSub: { fontSize: 11, color: '#1E3A8A', textAlign: 'right', marginTop: 2 },
  arrowIcon: { fontSize: 18, color: '#1E40AF' },
  
  investActiveAlert: { backgroundColor: '#FFFBEB', borderColor: COLORS.accent, borderWidth: 2, borderRadius: 14, padding: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  investAlertTitle: { fontSize: 14, fontWeight: 'bold', color: '#B45309', textAlign: 'right' },
  investAlertSub: { fontSize: 12, color: '#92400E', textAlign: 'right', marginTop: 2 },
  finishInvestBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  finishInvestBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  
  startInvestBanner: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14 },
  startInvestBannerIcon: { fontSize: 24, marginLeft: 10 },
  startInvestBannerTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', textAlign: 'right' },
  startInvestBannerSub: { fontSize: 11, color: '#B45309', textAlign: 'right', marginTop: 2 },
  
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.cardBorder, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right' },
  pickBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  pickBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 11 },
  
  emptyFieldText: { fontSize: 12, color: COLORS.gray, textAlign: 'right', paddingVertical: 10 },
  subHint: { fontSize: 11, color: COLORS.gray, textAlign: 'right', marginBottom: 10, lineHeight: 17 },
  
  tagsContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  tagItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginBottom: 6 },
  tagMaintenance: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
  tagRequired: { backgroundColor: '#DBEAFE', borderWidth: 1, borderColor: '#93C5FD' },
  tagRemoveBtn: { fontSize: 16, fontWeight: 'bold', color: COLORS.danger, marginLeft: 4 },
  tagText: { fontSize: 12, fontWeight: 'bold', color: '#991B1B' },
  
  saveChangesBtn: { backgroundColor: COLORS.secondary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 3, marginVertical: 6 },
  saveChangesBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  
  activeMatRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  activeMatName: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right' },
  activeMatCat: { fontSize: 11, color: COLORS.gray, textAlign: 'right', marginTop: 2 },
  pullBtn: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  pullBtnText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 12 },
  
  pulledCard: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  pulledHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pulledName: { fontSize: 13, fontWeight: 'bold', color: COLORS.info },
  pulledDate: { fontSize: 11, color: COLORS.gray },
  pulledNotes: { fontSize: 12, color: COLORS.dark, textAlign: 'right', marginBottom: 6 },
  pulledFooterAlert: { backgroundColor: '#E0F2FE', padding: 6, borderRadius: 6, alignItems: 'center' },
  pulledFooterAlertText: { color: '#0369A1', fontSize: 11, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, maxHeight: '90%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryDark, textAlign: 'right', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginTop: 8, marginBottom: 4 },
  hintText: { fontSize: 12, color: COLORS.gray, textAlign: 'right', lineHeight: 18, marginBottom: 10 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right', fontSize: 13, color: COLORS.dark },
  
  matSelectItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 6, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.cardBorder },
  matSelectItemSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  matSelectText: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark },
  matSelectCat: { fontSize: 11, color: COLORS.gray },
  
  modalActions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 16 },
  saveBtn: { backgroundColor: COLORS.secondary, flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginLeft: 8 },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { backgroundColor: '#E5E7EB', flex: 0.5, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 13 },
  
  analyticsStatsGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  analyticsStatCard: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.secondary, borderRadius: 12, padding: 12, alignItems: 'center' },
  analyticsStatNum: { fontSize: 22, fontWeight: 'bold', color: COLORS.secondary },
  analyticsStatLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.dark, marginTop: 4, textAlign: 'center' },
  
  timelineItem: { flexDirection: 'row-reverse', marginBottom: 12, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  timelineIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginLeft: 10, borderWidth: 1, borderColor: COLORS.cardBorder },
  timelineIconText: { fontSize: 16 },
  timelineContent: { flex: 1 },
  timelineHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  timelineTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark },
  timelineDate: { fontSize: 10, color: COLORS.gray },
  timelineDetails: { fontSize: 11, color: COLORS.gray, textAlign: 'right', lineHeight: 16 },
  
  actionOptions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 6 },
  actionOptionBtn: { flex: 1, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', marginHorizontal: 3, borderWidth: 1, borderColor: COLORS.cardBorder },
  actionOptionBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  actionOptionText: { fontSize: 11, fontWeight: 'bold', color: COLORS.dark },
  actionOptionTextActive: { color: COLORS.white },
  
  checkboxRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 12, backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8 },
  checkboxIcon: { fontSize: 18, color: COLORS.secondary, marginLeft: 8 },
  checkboxLabel: { fontSize: 12, fontWeight: 'bold', color: '#065F46', flex: 1, textAlign: 'right' },
  
  needsRepairBox: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: '#FCA5A5' }
});
