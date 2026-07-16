import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import initialData from '../data/initialData';

const STORAGE_KEY = '@fieldlog_data_v1';

export const FieldLogContext = createContext();

export const FieldLogProvider = ({ children }) => {
  const [data, setData] = useState({
    sites: [],
    tasks: [],
    materials: [],
    movements: [],
    investigations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading) save();
  }, [data]);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        setData(initialData);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (e) {
      console.warn('FieldLog load error', e);
      setData(initialData);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('FieldLog save error', e);
    }
  };

  // CRUD helpers (simple examples)
  const addSite = (site) => {
    setData(prev => ({ ...prev, sites: [...prev.sites, site] }));
  };

  const updateSite = (id, patch) => {
    setData(prev => ({ ...prev, sites: prev.sites.map(s => s.id === id ? { ...s, ...patch } : s) }));
  };

  const removeSite = (id) => {
    setData(prev => ({ ...prev, sites: prev.sites.filter(s => s.id !== id) }));
  };

  // Expose context API
  return (
    <FieldLogContext.Provider value={{
      data,
      loading,
      addSite,
      updateSite,
      removeSite,
      setData
    }}>
      {children}
    </FieldLogContext.Provider>
  );
};
