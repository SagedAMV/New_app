import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FieldLogContext = createContext();

// مفاتيح التخزين المحلي في ذاكرة الهاتف
const STORAGE_KEYS = {
  MATERIALS: '@field_log_materials_v3',
  SITES: '@field_log_sites_v3',
  TASKS: '@field_log_tasks_v3',
  MOVEMENTS: '@field_log_movements_v3',
  INVESTIGATIONS: '@field_log_investigations_v3',
  INITIALIZED: '@field_log_is_initialized_v3'
};

export const FieldLogProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [sites, setSites] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==================== 1. تحميل البيانات المخزنة محلياً عند بدء التطبيق ====================
  useEffect(() => {
    loadDataFromStorage();
  }, []);

  const loadDataFromStorage = async () => {
    try {
      setIsLoading(true);
      const isInit = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);

      if (!isInit) {
        // تهيئة قاعدة بيانات فارغة للعمل الميداني الفعلي مباشرة
        await saveAllToStorage([], [], [], [], []);
        await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        setMaterials([]);
        setSites([]);
        setTasks([]);
        setMovements([]);
        setInvestigations([]);
      } else {
        const [matsJson, sitesJson, tasksJson, movsJson, invsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.MATERIALS),
          AsyncStorage.getItem(STORAGE_KEYS.SITES),
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.MOVEMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.INVESTIGATIONS)
        ]);

        setMaterials(matsJson ? JSON.parse(matsJson) : []);
        setSites(sitesJson ? JSON.parse(sitesJson) : []);
        setTasks(tasksJson ? JSON.parse(tasksJson) : []);
        setMovements(movsJson ? JSON.parse(movsJson) : []);
        setInvestigations(invsJson ? JSON.parse(invsJson) : []);
      }
    } catch (error) {
      console.error('خطأ أثناء استرجاع بيانات سجل الميدان من ذاكرة الهاتف:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllToStorage = async (mats, sts, tsks, movs, invs) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(mats)),
        AsyncStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sts)),
        AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tsks)),
        AsyncStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movs)),
        AsyncStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(invs))
      ]);
    } catch (error) {
      console.error('خطأ أثناء حفظ البيانات في AsyncStorage:', error);
    }
  };

  const updateMaterialsState = async (newMats) => {
    setMaterials(newMats);
    await AsyncStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(newMats));
  };

  const updateSitesState = async (newSites) => {
    setSites(newSites);
    await AsyncStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(newSites));
  };

  const updateTasksState = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
  };

  const updateMovementsState = async (newMovs) => {
    setMovements(newMovs);
    await AsyncStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(newMovs));
  };

  const updateInvestigationsState = async (newInvs) => {
    setInvestigations(newInvs);
    await AsyncStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(newInvs));
  };

  // ==================== 2. إدارة مكتبة المواد واستيراد الإكسل ====================
  const addMaterial = (newMat) => {
    const matWithId = {
      ...newMat,
      id: newMat.id || `MAT-${Date.now().toString().slice(-4)}`
    };
    const updated = [matWithId, ...materials];
    updateMaterialsState(updated);
    return matWithId;
  };

  const bulkAddMaterials = (itemsArray) => {
    // استيراد جماعي للمواد من الإكسل / CSV
    const formatted = itemsArray.map((item, idx) => ({
      id: `MAT-${Date.now().toString().slice(-5)}-${idx}`,
      name: item.name.trim(),
      category: item.category ? item.category.trim() : 'أجهزة وقطع غيار',
      code: item.code ? item.code.trim() : `EXL-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: 'تم الاستيراد تلقائياً من جدول Excel'
    }));
    const updated = [...formatted, ...materials];
    updateMaterialsState(updated);
    return formatted.length;
  };

  const updateMaterial = (updatedMat) => {
    const updated = materials.map(m => m.id === updatedMat.id ? updatedMat : m);
    updateMaterialsState(updated);
  };

  const deleteMaterial = (matId) => {
    const updated = materials.filter(m => m.id !== matId);
    updateMaterialsState(updated);
  };

  // ==================== 3. إدارة المواقع وتعديل المواد الفعال في أي وقت واستيراد الإكسل ====================
  const addSite = (newSite) => {
    const siteWithId = {
      ...newSite,
      id: newSite.id || `SITE-${Date.now().toString().slice(-4)}`,
      status: 'يعمل بكفاءة',
      activeMaterials: newSite.activeMaterials || [],
      needsMaintenance: [],
      requiredMaterials: [],
      pulledMaterials: [],
      lastInvestigation: null
    };
    const updated = [siteWithId, ...sites];
    updateSitesState(updated);
  };

  const bulkAddSites = (sitesArray) => {
    // استيراد جماعي للمواقع من الإكسل / CSV
    const formatted = sitesArray.map((item, idx) => ({
      id: `SITE-${Date.now().toString().slice(-5)}-${idx}`,
      name: item.name.trim(),
      code: item.code ? item.code.trim() : `S-${Math.floor(100 + Math.random() * 900)}`,
      location: item.location ? item.location.trim() : 'موقع ميداني عام',
      status: 'يعمل بكفاءة',
      activeMaterials: [],
      needsMaintenance: [],
      requiredMaterials: [],
      pulledMaterials: [],
      lastInvestigation: null
    }));
    const updated = [...formatted, ...sites];
    updateSitesState(updated);
    return formatted.length;
  };

  // تعديل المواد التي يعمل عليها الموقع في أي وقت (وليس فقط وقت الإضافة)
  const updateSiteActiveMaterials = (siteId, newActiveMatIds) => {
    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        return { ...s, activeMaterials: newActiveMatIds };
      }
      return s;
    });
    updateSitesState(updatedSites);
  };

  const updateSiteDetails = (siteId, updatedData) => {
    const targetSite = sites.find(s => s.id === siteId);
    if (!targetSite) return;

    const newNeedsMaintenance = updatedData.needsMaintenance || targetSite.needsMaintenance;
    const newRequiredMaterials = updatedData.requiredMaterials || targetSite.requiredMaterials;

    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        return { ...s, ...updatedData };
      }
      return s;
    });
    updateSitesState(updatedSites);

    let updatedTasks = [...tasks];
    let taskAdded = false;

    newNeedsMaintenance.forEach(matId => {
      const existingTask = updatedTasks.find(t => t.siteId === siteId && t.materialId === matId && t.type === 'صيانة' && t.status !== 'منجزة');
      if (!existingTask) {
        const mat = materials.find(m => m.id === matId);
        updatedTasks.unshift({
          id: `TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          siteId,
          siteName: targetSite.name,
          type: 'صيانة',
          materialId: matId,
          title: mat ? mat.name : 'مادة مجهولة',
          description: 'تم إدراج المادة ضمن قائمة مواد تحتاج صيانة في سجل الموقع',
          status: 'معلقة',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
        taskAdded = true;
      }
    });

    newRequiredMaterials.forEach(matId => {
      const existingTask = updatedTasks.find(t => t.siteId === siteId && t.materialId === matId && t.type === 'مادة مطلوبة' && t.status !== 'منجزة');
      if (!existingTask) {
        const mat = materials.find(m => m.id === matId);
        updatedTasks.unshift({
          id: `TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          siteId,
          siteName: targetSite.name,
          type: 'مادة مطلوبة',
          materialId: matId,
          title: mat ? mat.name : 'مادة مجهولة',
          description: 'طلب توفير مادة جديدة للموقع',
          status: 'معلقة',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
        taskAdded = true;
      }
    });

    if (taskAdded) {
      updateTasksState(updatedTasks);
    }
  };

  // ==================== 4. إنجاز المهام والتكامل ====================
  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completedDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'منجزة', completedAt: completedDate } : t);
    updateTasksState(updatedTasks);

    const updatedSites = sites.map(site => {
      if (site.id === task.siteId) {
        if (task.type === 'صيانة') {
          return {
            ...site,
            needsMaintenance: site.needsMaintenance.filter(id => id !== task.materialId)
          };
        } else if (task.type === 'مادة مطلوبة') {
          return {
            ...site,
            requiredMaterials: site.requiredMaterials.filter(id => id !== task.materialId)
          };
        }
      }
      return site;
    });
    updateSitesState(updatedSites);

    if (task.type === 'صيانة – استكشاف ميداني') {
      const updatedInvs = investigations.map(inv => {
        if (inv.siteId === task.siteId && inv.status !== 'تمت الصيانة') {
          return { ...inv, status: 'تمت الصيانة' };
        }
        return inv;
      });
      updateInvestigationsState(updatedInvs);
    }
  };

  // ==================== 5. حركات السحب والإرجاع (نقل المهمة لقائمة المهام) ====================
  const pullMaterialForRepair = (siteId, materialId, notes = '') => {
    const site = sites.find(s => s.id === siteId);
    const mat = materials.find(m => m.id === materialId);
    if (!site || !mat) return;

    const pullDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const pullItem = {
      id: `PULL-${Date.now().toString().slice(-4)}`,
      materialId,
      materialName: mat.name,
      pullDate,
      notes
    };

    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          activeMaterials: s.activeMaterials.filter(id => id !== materialId),
          pulledMaterials: [pullItem, ...s.pulledMaterials]
        };
      }
      return s;
    });
    updateSitesState(updatedSites);

    const updatedMovs = [
      {
        id: `MOV-${Date.now()}`,
        siteId,
        siteName: site.name,
        materialId: mat.id,
        materialName: mat.name,
        movementType: 'سحب للصيانة',
        date: pullDate,
        notes
      },
      ...movements
    ];
    updateMovementsState(updatedMovs);

    // تحديث أي مهمة صيانة معلقة لهذه المادة إلى (مسحوبة للصيانة)
    const updatedTasks = tasks.map(t => {
      if (t.siteId === siteId && t.materialId === materialId && t.type === 'صيانة' && t.status === 'معلقة') {
        return { ...t, status: 'مسحوبة للصيانة' };
      }
      return t;
    });
    updateTasksState(updatedTasks);
  };

  // إرجاع المادة للموقع عند الضغط على (إنجاز المهمة وإرجاع المادة) في شاشة المهام
  const returnMaterialToSite = (siteId, pullRecordId, keepInMaintenance = false) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const pullRecord = site.pulledMaterials.find(p => p.id === pullRecordId);
    if (!pullRecord) return;

    const returnDate = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        const updatedNeedsMaintenance = keepInMaintenance
          ? (!s.needsMaintenance.includes(pullRecord.materialId) ? [...s.needsMaintenance, pullRecord.materialId] : s.needsMaintenance)
          : s.needsMaintenance.filter(id => id !== pullRecord.materialId);

        return {
          ...s,
          activeMaterials: [...s.activeMaterials, pullRecord.materialId],
          pulledMaterials: s.pulledMaterials.filter(p => p.id !== pullRecordId),
          needsMaintenance: updatedNeedsMaintenance
        };
      }
      return s;
    });
    updateSitesState(updatedSites);

    const updatedMovs = [
      {
        id: `MOV-${Date.now()}`,
        siteId,
        siteName: site.name,
        materialId: pullRecord.materialId,
        materialName: pullRecord.materialName,
        movementType: 'إرجاع للموقع',
        date: returnDate,
        notes: keepInMaintenance ? 'تم الإرجاع مع بقاء الحاجة للصيانة' : 'تم الإرجاع بعد الإصلاح بنجاح'
      },
      ...movements
    ];
    updateMovementsState(updatedMovs);

    if (!keepInMaintenance) {
      const updatedTasks = tasks.map(t => {
        if (t.siteId === siteId && t.materialId === pullRecord.materialId && t.type === 'صيانة') {
          return { ...t, status: 'منجزة', completedAt: returnDate };
        }
        return t;
      });
      updateTasksState(updatedTasks);
    }
  };

  // ==================== 6. استكشاف الأعطال الميداني ====================
  const startInvestigation = (siteId, reason) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const invId = `INV-${Date.now().toString().slice(-4)}`;

    const newInv = {
      id: invId,
      siteId,
      siteName: site.name,
      date: dateStr,
      reason,
      result: 'جاري الاستكشاف ميدانياً...',
      action: 'قيد الاستكشاف',
      status: 'نشط',
      affectedMaterials: []
    };

    const updatedInvs = [newInv, ...investigations];
    updateInvestigationsState(updatedInvs);

    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        return { ...s, status: 'قيد الاستكشاف', lastInvestigation: newInv };
      }
      return s;
    });
    updateSitesState(updatedSites);

    return invId;
  };

  const finishInvestigation = (siteId, invId, result, action, affectedMaterials = [], problemDescription = '', autoFinishTasks = false) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedInv = {
      id: invId || `INV-${Date.now().toString().slice(-4)}`,
      siteId,
      siteName: site.name,
      date: dateStr,
      result: result || 'تم الانتهاء من فحص الموقع',
      action,
      status: action === 'يحتاج صيانة' ? 'نشط (مطلوب صيانة)' : 'مكتمل',
      affectedMaterials
    };

    const updatedInvs = investigations.map(inv => inv.id === invId ? updatedInv : inv);
    updateInvestigationsState(updatedInvs);

    let newSiteStatus = 'يعمل بكفاءة';
    if (action === 'يحتاج صيانة') {
      newSiteStatus = 'به أعطال - يحتاج صيانة';
    }

    const updatedSites = sites.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          status: newSiteStatus,
          lastInvestigation: updatedInv,
          needsMaintenance: action === 'يحتاج صيانة'
            ? Array.from(new Set([...s.needsMaintenance, ...affectedMaterials]))
            : s.needsMaintenance
        };
      }
      return s;
    });
    updateSitesState(updatedSites);

    let updatedTasks = [...tasks];
    if (action === 'يحتاج صيانة') {
      const affectedNames = affectedMaterials
        .map(id => {
          const m = materials.find(mat => mat.id === id);
          return m ? m.name : id;
        })
        .join(' + ');

      const newTask = {
        id: `TASK-INV-${Date.now()}`,
        siteId,
        siteName: site.name,
        type: 'صيانة – استكشاف ميداني',
        materialId: affectedMaterials[0] || 'GENERAL',
        title: affectedNames || 'عطل ميداني عام بالموقع',
        description: problemDescription || 'تم رصد هذا العطل أثناء النزول لاستكشاف الموقع',
        status: 'معلقة',
        createdAt: dateStr
      };

      updatedTasks = [newTask, ...updatedTasks];
      updateTasksState(updatedTasks);
    }

    if (action === 'تم إصلاحه ميدانياً' && autoFinishTasks) {
      updatedTasks = updatedTasks.map(t => {
        if (t.siteId === siteId && t.status === 'معلقة') {
          return { ...t, status: 'منجزة', completedAt: dateStr };
        }
        return t;
      });
      updateTasksState(updatedTasks);

      const cleanedSites = updatedSites.map(s => {
        if (s.id === siteId) {
          return { ...s, needsMaintenance: [], requiredMaterials: [] };
        }
        return s;
      });
      updateSitesState(cleanedSites);
    }
  };

  // ==================== 7. دالة الإحصائيات الشاملة لموقع معين ====================
  const getSiteAnalytics = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return null;

    // المهام المنجزة في هذا الموقع
    const completedTasksList = tasks.filter(t => t.siteId === siteId && t.status === 'منجزة');
    // المهام المعلقة حالياً
    const pendingTasksList = tasks.filter(t => t.siteId === siteId && t.status !== 'منجزة');
    // حركات سحب وإرجاع وصرف المواد الخاصة بهذا الموقع
    const siteMovementsList = movements.filter(m => m.siteId === siteId);
    // الاستكشافات الميدانية التي تمت في هذا الموقع
    const siteInvestigationsList = investigations.filter(i => inv => inv.siteId === siteId || i.siteId === siteId);

    // تجميع خط زمني (Timeline) لكل ما صار بالموقع
    const timeline = [];

    completedTasksList.forEach(t => {
      timeline.push({
        id: `TIME-T-${t.id}`,
        type: 'مهمة منجزة',
        icon: '✔',
        title: `إنجاز: ${t.title} (${t.type})`,
        date: t.completedAt || t.createdAt,
        details: t.description || 'تم الإنجاز بنجاح'
      });
    });

    siteMovementsList.forEach(m => {
      timeline.push({
        id: `TIME-M-${m.id}`,
        type: m.movementType,
        icon: m.movementType.includes('سحب') ? '🔧' : '🔙',
        title: `${m.movementType}: ${m.materialName}`,
        date: m.date,
        details: m.notes || 'حركة مادة بالسجل'
      });
    });

    siteInvestigationsList.forEach(inv => {
      timeline.push({
        id: `TIME-I-${inv.id}`,
        type: `استكشاف: ${inv.action}`,
        icon: '🔍',
        title: `تقرير استكشاف ميداني (${inv.action})`,
        date: inv.date,
        details: `السبب: ${inv.reason} | النتيجة: ${inv.result}`
      });
    });

    // ترتيب الخط الزمني من الأحدث للأقدم
    timeline.sort((a, b) => (b.date > a.date ? 1 : -1));

    return {
      site,
      totalCompletedTasks: completedTasksList.length,
      totalPendingTasks: pendingTasksList.length,
      totalMovements: siteMovementsList.length,
      totalInvestigations: siteInvestigationsList.length,
      timeline
    };
  };

  return (
    <FieldLogContext.Provider
      value={{
        materials,
        sites,
        tasks,
        movements,
        investigations,
        isLoading,
        addMaterial,
        bulkAddMaterials,
        updateMaterial,
        deleteMaterial,
        addSite,
        bulkAddSites,
        updateSiteActiveMaterials,
        updateSiteDetails,
        completeTask,
        pullMaterialForRepair,
        returnMaterialToSite,
        startInvestigation,
        finishInvestigation,
        getSiteAnalytics
      }}
    >
      {children}
    </FieldLogContext.Provider>
  );
};

export const useFieldLog = () => useContext(FieldLogContext);
