import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import { useFieldLog } from '../context/FieldLogContext';

export default function SitesGridScreen({ onSelectSite }) {
  const { 
    sites, 
    materials, 
    isLoading, 
    addSite, 
    bulkAddSites,
    addMaterial 
  } = useFieldLog();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [excelText, setExcelText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // حالة إضافة موقع جديد
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [materialSearchText, setMaterialSearchText] = useState('');
  const [quickAddMatModal, setQuickAddMatModal] = useState(false);
  const [quickMatName, setQuickMatName] = useState('');
  const [quickMatCategory, setQuickMatCategory] = useState('أجهزة لاسلكي');

  const filteredSites = sites.filter(s => s.name.includes(searchQuery) || (s.location && s.location.includes(searchQuery)));
  const filteredMaterials = materials.filter(m => m.name.includes(materialSearchText) || m.category.includes(materialSearchText));

  const toggleMaterialSelection = (matId) => {
    if (selectedMaterials.includes(matId)) {
      setSelectedMaterials(selectedMaterials.filter(id => id !== matId));
    } else {
      setSelectedMaterials([...selectedMaterials, matId]);
    }
  };

  const handleQuickAddMaterial = () => {
    if (!quickMatName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المادة الجديدة');
      return;
    }
    const newMat = addMaterial({
      name: quickMatName.trim(),
      category: quickMatCategory,
      code: `GEN-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: 'تمت إضافتها من شاشة إضافة موقع جديد'
    });
    setSelectedMaterials([...selectedMaterials, newMat.id]);
    setQuickMatName('');
    setQuickAddMatModal(false);
    Alert.alert('تمت الإضافة ✔️', `تم حفظ (${newMat.name}) في مكتبة المواد وربطها بالموقع!`);
  };

  const handleSaveNewSite = () => {
    if (!newSiteName.trim()) {
      Alert.alert('تلميح إلزامي ⚠️', 'أدخل اسم الموقع كاملاً (حقل إلزامي)');
      return;
    }

    addSite({
      name: newSiteName.trim(),
      location: newSiteLocation.trim() || 'موقع ميداني عام',
      activeMaterials: selectedMaterials
    });

    setNewSiteName('');
    setNewSiteLocation('');
    setSelectedMaterials([]);
    setAddModalVisible(false);
    Alert.alert('نجاح 🚩', 'تمت إضافة الموقع وتخزينه محلياً بشكل دائم داخل الهاتف.');
  };

  // استيراد جماعي للمواقع من جداول إكسل / CSV
  const handleImportExcelSites = () => {
    if (!excelText.trim()) {
      Alert.alert('تنبيه', 'يرجى لصق نص جدول الإكسل أو أسطر المواقع في الحقل أولاً');
      return;
    }

    const lines = excelText.trim().split(/\r?\n/);
    const parsedSites = [];

    lines.forEach(line => {
      const parts = line.split(/[\t,;]/); // الفصل بالتاب (Excel) أو الفاصلة (CSV)
      if (parts[0] && parts[0].trim() && !parts[0].includes('اسم الموقع')) {
        parsedSites.push({
          name: parts[0].trim(),
          location: parts[1] ? parts[1].trim() : 'قطاع ميداني عام',
          code: parts[2] ? parts[2].trim() : `S-${Math.floor(100 + Math.random() * 900)}`
        });
      }
    });

    if (parsedSites.length === 0) {
      Alert.alert('خطأ في التنسيق', 'لم يتم التعرف على أسماء مواقع صحيحة. تأكد أن كل سطر يحتوي على اسم موقع.');
      return;
    }

    const count = bulkAddSites(parsedSites);
    setExcelText('');
    setImportModalVisible(false);
    Alert.alert('تم الاستيراد بنجاح 📥✔️', `تم استيراد وإضافة (${count}) موقع اتصال ميداني من جدول الإكسل وحفظها بالذاكرة الدائمة!`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={{ color: COLORS.white, marginTop: 12, fontWeight: 'bold' }}>جاري استرجاع بيانات سجل الميدان من ذاكرة الهاتف الدائمة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* شريط البحث العلوي وأزرار الإضافة والاستيراد */}
      <View style={styles.topSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 ابحث في سجل المواقع الميدانية..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.btnsRow}>
          <TouchableOpacity style={styles.importBtn} onPress={() => setImportModalVisible(true)}>
            <Text style={styles.importBtnText}>📥 استيراد Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addBtnText}>+ إضافة موقع</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* عرض شبكة المواقع */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.gridTitle}>📡 لوحة مواقع الاتصالات الميدانية ({filteredSites.length})</Text>

        {filteredSites.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>سجل الميدان جاهز للعمل الفعلي</Text>
            <Text style={styles.emptySubtitle}>لا توجد مواقع مضافة حالياً. يمكنك الضغط على "+ إضافة موقع" لإدخال موقع يدوي، أو اضغط "📥 استيراد Excel" لإدخال قائمة طويلة من مواقع الاتصالات بضغطة زر واحدة!</Text>
            <View style={styles.emptyBtnsRow}>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setAddModalVisible(true)}>
                <Text style={styles.emptyAddBtnText}>+ إضافة موقع يدوي</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.emptyAddBtn, { backgroundColor: COLORS.info }]} onPress={() => setImportModalVisible(true)}>
                <Text style={styles.emptyAddBtnText}>📥 استيراد من Excel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredSites.map(site => {
              const isUnderInvest = site.status === 'قيد الاستكشاف';
              const hasFaults = site.status.includes('أعطال');
              
              return (
                <TouchableOpacity
                  key={site.id}
                  style={[
                    styles.siteCard,
                    isUnderInvest && styles.siteCardInvest,
                    hasFaults && styles.siteCardFaults
                  ]}
                  onPress={() => onSelectSite(site)}
                >
                  {/* شريط حالة الموقع العلوي */}
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.statusBadge,
                      isUnderInvest ? styles.badgeInvest : (hasFaults ? styles.badgeFault : styles.badgeOk)
                    ]}>
                      <Text style={[
                        styles.statusText,
                        isUnderInvest ? styles.textInvest : (hasFaults ? styles.textFault : styles.textOk)
                      ]}>
                        {isUnderInvest ? '⚡ قيد الاستكشاف' : site.status}
                      </Text>
                    </View>
                    <Text style={styles.siteCode}>{site.code || 'SITE'}</Text>
                  </View>

                  {/* اسم الموقع والموقع الجغرافي */}
                  <Text style={styles.siteName}>{site.name}</Text>
                  <Text style={styles.siteLocation}>📍 {site.location}</Text>

                  {/* إحصائيات سريعة للموقع */}
                  <View style={styles.cardFooter}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{site.activeMaterials?.length || 0}</Text>
                      <Text style={styles.statLabel}>مواد بالخدمة</Text>
                    </View>
                    <View style={[styles.statBox, site.needsMaintenance?.length > 0 && styles.statBoxAlert]}>
                      <Text style={[styles.statNum, site.needsMaintenance?.length > 0 && { color: COLORS.danger }]}>
                        {site.needsMaintenance?.length || 0}
                      </Text>
                      <Text style={styles.statLabel}>تحتاج صيانة</Text>
                    </View>
                    <View style={[styles.statBox, site.pulledMaterials?.length > 0 && styles.statBoxPull]}>
                      <Text style={[styles.statNum, site.pulledMaterials?.length > 0 && { color: COLORS.info }]}>
                        {site.pulledMaterials?.length || 0}
                      </Text>
                      <Text style={styles.statLabel}>مسحوبة للورشة</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* نافذة استيراد المواقع من إكسل / CSV */}
      <Modal visible={importModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📥 استيراد أسماء المواقع من جداول Excel أو CSV</Text>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>تعليمات الاستيراد السريع لأسماء المواقع:</Text>
              <Text style={styles.hintText}>
                1. افتح جدول الإكسل (Excel) الخاص بوحدتك العسكرية.{'\n'}
                2. انسخ عمود (اسم الموقع) مع عمود (الموقع الجغرافي / القطاع إن وجد).{'\n'}
                3. الصق البيانات مباشرة في المربع أدناه واضغط زر الاستيراد!
              </Text>

              <TextInput
                style={[styles.input, { height: 160, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 }]}
                multiline
                placeholder={`مثال على ما يمكنك لصقه من الإكسل:\nموقع جبل عيبان 101\tالقمة الغربية\nمحطة الرقابة الغربية\tالقطاع الرابع\nمحطة البث المركزية\tالمقر الرئيسي`}
                placeholderTextColor="#9CA3AF"
                value={excelText}
                onChangeText={setExcelText}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.info }]} onPress={handleImportExcelSites}>
                <Text style={styles.saveBtnText}>📥 استيراد وحفظ المواقع فوراً</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setImportModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* نافذة إضافة موقع جديد مع الربط بمكتبة المواد */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏕️ إضافة موقع اتصال ميداني جديد</Text>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>اسم الموقع <Text style={{color: COLORS.danger}}>* (إلزامي)</Text>:</Text>
              <TextInput
                style={styles.input}
                placeholder="أدخل اسم الموقع كاملاً (مثال: محطة جبل صبر المتقدمة)"
                placeholderTextColor="#9CA3AF"
                value={newSiteName}
                onChangeText={setNewSiteName}
              />
              <Text style={styles.hintText}>💡 تلميح: أدخل اسم الموقع كاملاً ليسهل التعرف عليه في الميدان.</Text>

              <Text style={styles.label}>الموقع أو النطاق الجغرافي (اختياري):</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: القمة الغربية - قطاع اللواء الثالث"
                placeholderTextColor="#9CA3AF"
                value={newSiteLocation}
                onChangeText={setNewSiteLocation}
              />

              {/* قسم اختيار المواد التي يعمل عليها الموقع */}
              <Text style={styles.sectionHeader}>🔗 المواد التي يعمل عليها الموقع (من مكتبة المواد):</Text>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder="🔍 ابحث في مكتبة المواد لاختيارها..."
                placeholderTextColor="#9CA3AF"
                value={materialSearchText}
                onChangeText={setMaterialSearchText}
              />

              <View style={styles.materialsListBox}>
                {filteredMaterials.map(mat => {
                  const isSelected = selectedMaterials.includes(mat.id);
                  return (
                    <TouchableOpacity
                      key={mat.id}
                      style={[styles.matSelectItem, isSelected && styles.matSelectItemSelected]}
                      onPress={() => toggleMaterialSelection(mat.id)}
                    >
                      <Text style={[styles.matSelectText, isSelected && { color: COLORS.white }]}>
                        {isSelected ? '✔ ' : '+ '} {mat.name}
                      </Text>
                      <Text style={[styles.matSelectCat, isSelected && { color: '#E0F2FE' }]}>
                        ({mat.category})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* زر إضافة مادة جديدة للمكتبة في أسفل القائمة */}
              <TouchableOpacity
                style={styles.quickAddMatBtn}
                onPress={() => setQuickAddMatModal(true)}
              >
                <Text style={styles.quickAddMatBtnText}>+ إضافة مادة جديدة لمكتبة المواد (إذا لم تكن موجودة)</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNewSite}>
                <Text style={styles.saveBtnText}>💾 حفظ الموقع في ذاكرة الهاتف الدائمة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* نافذة الإضافة السريعة لمادة إلى المكتبة مباشرة */}
      <Modal visible={quickAddMatModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 380 }]}>
            <Text style={styles.modalTitle}>📦 إدخال مادة جديدة لمكتبة المواد</Text>
            <Text style={styles.label}>اسم المادة / الجهاز:</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: بطارية طاقة شمسية جل 200 أمبير"
              placeholderTextColor="#9CA3AF"
              value={quickMatName}
              onChangeText={setQuickMatName}
            />
            <Text style={styles.label}>التصنيف العسكري/الفني:</Text>
            <TextInput
              style={styles.input}
              value={quickMatCategory}
              onChangeText={setQuickMatCategory}
            />

            <View style={[styles.modalActions, { marginTop: 20 }]}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleQuickAddMaterial}>
                <Text style={styles.saveBtnText}>إضافة للمكتبة وللموقع فوراً</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setQuickAddMatModal(false)}>
                <Text style={styles.cancelBtnText}>تراجع</Text>
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
  topSection: { flexDirection: 'row-reverse', padding: 12, backgroundColor: COLORS.primaryDark, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#374151', color: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, textAlign: 'right', fontSize: 13 },
  btnsRow: { flexDirection: 'row-reverse', marginLeft: 8, gap: 6 },
  addBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  importBtn: { backgroundColor: COLORS.info, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  importBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  
  scrollArea: { padding: 14 },
  gridTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 14 },
  
  emptyBox: { backgroundColor: COLORS.white, padding: 30, borderRadius: 16, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: COLORS.gray, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtnsRow: { flexDirection: 'row-reverse', gap: 10 },
  emptyAddBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  emptyAddBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between' },
  siteCard: { width: '48.5%', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: COLORS.cardBorder, elevation: 3 },
  siteCardInvest: { borderColor: COLORS.accent, backgroundColor: '#FFFBEB' },
  siteCardFaults: { borderColor: COLORS.danger, backgroundColor: '#FEF2F2' },
  
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  siteCode: { fontSize: 11, fontWeight: 'bold', color: COLORS.gray },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeOk: { backgroundColor: '#D1FAE5' },
  badgeInvest: { backgroundColor: '#FEF3C7' },
  badgeFault: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  textOk: { color: '#065F46' },
  textInvest: { color: '#B45309' },
  textFault: { color: '#991B1B' },
  
  siteName: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', minHeight: 38, marginBottom: 4 },
  siteLocation: { fontSize: 11, color: COLORS.gray, textAlign: 'right', marginBottom: 10 },
  
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
  statBox: { alignItems: 'center', flex: 1 },
  statBoxAlert: { backgroundColor: '#FEE2E2', borderRadius: 6 },
  statBoxPull: { backgroundColor: '#EFF6FF', borderRadius: 6 },
  statNum: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 9, color: COLORS.gray, marginTop: 1 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, maxHeight: '88%' },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.primaryDark, textAlign: 'right', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, paddingBottom: 8 },
  modalForm: { maxHeight: 420 },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginTop: 10, marginBottom: 4 },
  hintText: { fontSize: 12, color: COLORS.gray, textAlign: 'right', lineHeight: 18, marginBottom: 10 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right', fontSize: 13, color: COLORS.dark },
  
  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: COLORS.primaryLight, textAlign: 'right', marginTop: 16, marginBottom: 8 },
  materialsListBox: { maxHeight: 160, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 8, padding: 6, backgroundColor: '#F9FAFB' },
  matSelectItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, marginBottom: 4, backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E5E7EB' },
  matSelectItemSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  matSelectText: { fontSize: 12, fontWeight: 'bold', color: COLORS.dark },
  matSelectCat: { fontSize: 11, color: COLORS.gray },
  
  quickAddMatBtn: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  quickAddMatBtnText: { color: '#1E40AF', fontWeight: 'bold', fontSize: 12 },
  
  modalActions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 16 },
  saveBtn: { backgroundColor: COLORS.secondary, flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginLeft: 8 },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { backgroundColor: '#E5E7EB', flex: 0.5, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 14 }
});
