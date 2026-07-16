import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { useFieldLog } from '../context/FieldLogContext';

export default function MaterialsLibraryScreen() {
  const { materials, addMaterial, bulkAddMaterials, updateMaterial, deleteMaterial } = useFieldLog();
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [excelText, setExcelText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // بيانات النموذج
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState('أجهزة لاسلكي');
  const [matCode, setMatCode] = useState('');
  const [matNotes, setMatNotes] = useState('');

  const filteredMaterials = materials.filter(m => 
    m.name.includes(searchQuery) || m.category.includes(searchQuery) || m.code.includes(searchQuery)
  );

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setMatName('');
    setMatCategory('أجهزة لاسلكي');
    setMatCode(`MAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setMatNotes('');
    setModalVisible(true);
  };

  const openEditModal = (mat) => {
    setIsEditing(true);
    setCurrentId(mat.id);
    setMatName(mat.name);
    setMatCategory(mat.category);
    setMatCode(mat.code || '');
    setMatNotes(mat.notes || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!matName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المادة (حقل إلزامي)');
      return;
    }

    if (isEditing && currentId) {
      updateMaterial({
        id: currentId,
        name: matName.trim(),
        category: matCategory.trim() || 'عام',
        code: matCode.trim(),
        notes: matNotes.trim()
      });
      Alert.alert('تم التعديل ✔️', 'تم حفظ تعديلات المادة في المستودع بنجاح.');
    } else {
      addMaterial({
        name: matName.trim(),
        category: matCategory.trim() || 'عام',
        code: matCode.trim() || `GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: matNotes.trim()
      });
      Alert.alert('تمت الإضافة ✔️', 'تم إدراج المادة في مكتبة المواد العامة.');
    }

    setModalVisible(false);
  };

  // استيراد جماعي للمواد من جداول إكسل / CSV
  const handleImportExcelMaterials = () => {
    if (!excelText.trim()) {
      Alert.alert('تنبيه', 'يرجى لصق نص جدول الإكسل أو أسطر المواد أولاً');
      return;
    }

    const lines = excelText.trim().split(/\r?\n/);
    const parsedMats = [];

    lines.forEach(line => {
      const parts = line.split(/[\t,;]/);
      if (parts[0] && parts[0].trim() && !parts[0].includes('اسم المادة')) {
        parsedMats.push({
          name: parts[0].trim(),
          category: parts[1] ? parts[1].trim() : 'أجهزة وقطع غيار',
          code: parts[2] ? parts[2].trim() : `EXL-${Math.floor(1000 + Math.random() * 9000)}`
        });
      }
    });

    if (parsedMats.length === 0) {
      Alert.alert('خطأ في التنسيق', 'لم يتم التعرف على أسماء مواد صحيحة. تأكد أن كل سطر يحتوي على اسم مادة.');
      return;
    }

    const count = bulkAddMaterials(parsedMats);
    setExcelText('');
    setImportModalVisible(false);
    Alert.alert('تم الاستيراد بنجاح 📥✔️', `تم استيراد وإضافة (${count}) مادة اتصال عسكرية من الإكسل إلى المكتبة وحفظها محلياً!`);
  };

  const handleDelete = (mat) => {
    Alert.alert(
      'حذف المادة من المكتبة 🗑️',
      `هل أنت متأكد من حذف (${mat.name})؟\nسيبقى معرفها في السجلات السابقة للحفاظ على تكامل البيانات.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف نهائياً', 
          style: 'destructive', 
          onPress: () => deleteMaterial(mat.id) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* شريط البحث وزر الإضافة والاستيراد */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 ابحث في مكتبة المواد (الاسم، التصنيف، الكود)..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.btnsRow}>
          <TouchableOpacity style={styles.importBtn} onPress={() => setImportModalVisible(true)}>
            <Text style={styles.importBtnText}>📥 استيراد Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ مادة جديدة</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionHeader}>📦 قاعدة بيانات مكتبة المواد العامة ({filteredMaterials.length})</Text>

        {filteredMaterials.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>مكتبة المواد جاهزة للعمل الفعلي</Text>
            <Text style={styles.emptySub}>لا توجد مواد مضافة حالياً. اضغط "+ مادة جديدة" لإدخال مادة يدوياً، أو اضغط "📥 استيراد Excel" لإدخال مئات البطاريات والكوابل والتجهيزات من جدول الإكسل فوراً!</Text>
            <View style={styles.emptyBtnsRow}>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
                <Text style={styles.emptyAddBtnText}>+ إضافة مادة يدوية</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.emptyAddBtn, { backgroundColor: COLORS.info }]} onPress={() => setImportModalVisible(true)}>
                <Text style={styles.emptyAddBtnText}>📥 استيراد مواد من Excel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          filteredMaterials.map(mat => (
            <View key={mat.id} style={styles.matCard}>
              <View style={styles.matHeader}>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>{mat.id}</Text>
                </View>
                <Text style={styles.matCode}>الكود الفني: {mat.code}</Text>
              </View>

              <Text style={styles.matName}>{mat.name}</Text>
              <Text style={styles.matCat}>التصنيف: {mat.category}</Text>

              {mat.notes ? (
                <Text style={styles.matNotes}>📝 {mat.notes}</Text>
              ) : null}

              {/* أزرار التعديل والحذف */}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(mat)}>
                  <Text style={styles.editBtnText}>✏️ تعديل البيانات</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(mat)}>
                  <Text style={styles.deleteBtnText}>🗑️ حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* نافذة استيراد المواد من إكسل / CSV */}
      <Modal visible={importModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📥 استيراد أسماء المواد من جداول Excel أو CSV</Text>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>تعليمات الاستيراد السريع لأسماء المواد:</Text>
              <Text style={styles.hintText}>
                1. افتح جدول الإكسل (Excel) المعتمد في وحدتك.{'\n'}
                2. انسخ عمود (اسم المادة/الجهاز) مع عمود (التصنيف إن وجد).{'\n'}
                3. الصق البيانات مباشرة أدناه واضغط زر الاستيراد وحفظ في المكتبة!
              </Text>

              <TextInput
                style={[styles.input, { height: 160, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 }]}
                multiline
                placeholder={`مثال على ما يمكنك لصقه من الإكسل:\nجهاز إرسال Motorola VHF Pro\tأجهزة لاسلكي\nبطارية طاقة شمسية 150 أمبير\tطاقة وبطاريات\nكيبل محوري RG-213 لفة 100م\tكوابل وموصلات`}
                placeholderTextColor="#9CA3AF"
                value={excelText}
                onChangeText={setExcelText}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: COLORS.info }]} onPress={handleImportExcelMaterials}>
                <Text style={styles.saveBtnText}>📥 استيراد وحفظ في المكتبة فوراً</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setImportModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* نافذة إضافة أو تعديل مادة */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? '✏️ تعديل بيانات مادة بالمكتبة' : '📦 إدخال مادة جديدة لمكتبة المواد'}
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.label}>اسم المادة / الجهاز <Text style={{color: COLORS.danger}}>* (إلزامي)</Text>:</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: بطارية طاقة شمسية جل 12V 150Ah"
                placeholderTextColor="#9CA3AF"
                value={matName}
                onChangeText={setMatName}
              />

              <Text style={styles.label}>التصنيف الفني/العسكري:</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: أجهزة لاسلكي، هوائيات، طاقة وبطاريات"
                placeholderTextColor="#9CA3AF"
                value={matCategory}
                onChangeText={setMatCategory}
              />

              <Text style={styles.label}>الكود أو الرقم التسلسلي:</Text>
              <TextInput
                style={styles.input}
                placeholder="VHF-8821"
                placeholderTextColor="#9CA3AF"
                value={matCode}
                onChangeText={setMatCode}
              />

              <Text style={styles.label}>ملاحظات أو مواصفات إضافية:</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                multiline
                placeholder="سعة البطارية، تردد البث، نوع الموصلات..."
                placeholderTextColor="#9CA3AF"
                value={matNotes}
                onChangeText={setMatNotes}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>💾 حفظ في قاعدة البيانات</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
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
  topBar: { flexDirection: 'row-reverse', padding: 12, backgroundColor: COLORS.primaryDark, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#374151', color: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, textAlign: 'right', fontSize: 13 },
  btnsRow: { flexDirection: 'row-reverse', marginLeft: 8, gap: 6 },
  addBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  importBtn: { backgroundColor: COLORS.info, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  importBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  
  scrollArea: { padding: 14 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 14 },
  
  emptyBox: { backgroundColor: COLORS.white, padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, marginTop: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.gray, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  emptyBtnsRow: { flexDirection: 'row-reverse', gap: 10 },
  emptyAddBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  emptyAddBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  
  matCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder, elevation: 2 },
  matHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  idBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  idText: { fontSize: 11, fontWeight: 'bold', color: '#0369A1' },
  matCode: { fontSize: 11, color: COLORS.gray },
  
  matName: { fontSize: 15, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginBottom: 4 },
  matCat: { fontSize: 12, color: COLORS.primaryLight, textAlign: 'right', fontWeight: 'bold', marginBottom: 6 },
  matNotes: { fontSize: 12, color: COLORS.gray, textAlign: 'right', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 6, marginBottom: 10 },
  
  cardActions: { flexDirection: 'row-reverse', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 8 },
  editBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginLeft: 8 },
  editBtnText: { color: '#1E40AF', fontWeight: 'bold', fontSize: 12 },
  deleteBtn: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, maxHeight: '88%' },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.primaryDark, textAlign: 'right', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: 'bold', color: COLORS.dark, textAlign: 'right', marginTop: 10, marginBottom: 4 },
  hintText: { fontSize: 12, color: COLORS.gray, textAlign: 'right', lineHeight: 18, marginBottom: 10 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right', fontSize: 13, color: COLORS.dark },
  
  modalActions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 18 },
  saveBtn: { backgroundColor: COLORS.secondary, flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginLeft: 8 },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  cancelBtn: { backgroundColor: '#E5E7EB', flex: 0.5, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: COLORS.dark, fontWeight: 'bold', fontSize: 14 }
});
