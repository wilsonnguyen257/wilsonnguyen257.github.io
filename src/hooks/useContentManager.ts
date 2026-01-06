import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getJson, saveJson, subscribeJson, type JsonName } from '../lib/storage';
import type { Event, Reflection } from '../types/content';
import toast from 'react-hot-toast';

type ContentType = Event | Reflection;

interface UseContentManagerOptions<T> {
  name: JsonName;
  initialData?: T[];
  validate?: (item: T) => string | null; // Returns error message if invalid
  transform?: (item: T) => T; // Transform item before save
}

export function useContentManager<T extends ContentType>({ 
  name, 
  initialData = [], 
  validate,
  transform 
}: UseContentManagerOptions<T>) {
  const { language } = useLanguage();
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getJson<T[]>(name);
      setData(result || initialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error(`Error loading ${name}:`, err);
    } finally {
      setLoading(false);
    }
  }, [name, initialData]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeJson<T[]>(name, (newData) => {
      setData(newData || initialData);
      setLoading(false);
      setError(null);
    }, (err) => {
      setError(err instanceof Error ? err.message : 'Subscription error');
      setLoading(false);
    });

    return unsubscribe;
  }, [name, initialData]);

  // Save single item
  const saveItem = useCallback(async (item: T) => {
    // Validate item
    if (validate) {
      const validationError = validate(item);
      if (validationError) {
        toast.error(validationError);
        throw new Error(validationError);
      }
    }

    // Transform item if needed
    const itemToSave = transform ? transform(item) : item;

    setSaving(true);
    try {
      const currentData = [...data];
      const existingIndex = currentData.findIndex((i) => i.id === item.id);

      if (existingIndex >= 0) {
        // Update existing item
        currentData[existingIndex] = { 
          ...itemToSave, 
          updatedAt: new Date().toISOString() 
        };
      } else {
        // Add new item
        currentData.push({
          ...itemToSave,
          id: item.id || generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as T);
      }

      await saveJson(name, currentData);
      setData(currentData);
      toast.success(`Item ${existingIndex >= 0 ? 'updated' : 'created'} successfully`);
      return itemToSave;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save item';
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [data, name, validate, transform]);

  // Delete item (soft delete)
  const deleteItem = useCallback(async (id: string) => {
    setSaving(true);
    try {
      const currentData = [...data];
      const item = currentData.find((i) => i.id === id);
      
      if (!item) {
        throw new Error('Item not found');
      }

      // Soft delete by marking as deleted
      const updatedData = currentData.map((i) => 
        i.id === id 
          ? { ...i, status: 'deleted' as const, deletedAt: new Date().toISOString() }
          : i
      );

      await saveJson(name, updatedData);
      setData(updatedData);
      toast.success('Item deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [data, name]);

  // Restore deleted item
  const restoreItem = useCallback(async (id: string) => {
    setSaving(true);
    try {
      const currentData = [...data];
      const updatedData = currentData.map((i) => 
        i.id === id 
          ? { ...i, status: 'published' as const, deletedAt: undefined }
          : i
      );

      await saveJson(name, updatedData);
      setData(updatedData);
      toast.success('Item restored successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore item';
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [data, name]);

  // Batch save multiple items
  const saveBatch = useCallback(async (items: T[]) => {
    setSaving(true);
    try {
      const itemsToSave = items.map(item => {
        // Validate each item
        if (validate) {
          const validationError = validate(item);
          if (validationError) throw new Error(`Item ${item.id}: ${validationError}`);
        }
        return transform ? transform(item) : item;
      });

      await saveJson(name, itemsToSave);
      setData(itemsToSave);
      toast.success(`${items.length} items saved successfully`);
      return itemsToSave;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save items';
      toast.error(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [name, validate, transform]);

  // Get filtered data
  const getFilteredData = useCallback((filterFn: (item: T) => boolean) => {
    return data.filter(filterFn);
  }, [data]);

  // Get published items (not deleted)
  const getPublishedItems = useCallback(() => {
    return data.filter(item => item.status !== 'deleted');
  }, [data]);

  // Get items by language preference
  const getLocalizedContent = useCallback((item: T, field: keyof T) => {
    const value = item[field];
    if (typeof value === 'object' && value !== null && 'vi' in value && 'en' in value) {
      const localized = value as { vi: string; en: string };
      // Symmetric fallback: try current language first, then the other language
      return localized[language] || localized[language === 'vi' ? 'en' : 'vi'] || '';
    }
    return value as string;
  }, [language]);

  return {
    data,
    loading,
    saving,
    error,
    loadData,
    saveItem,
    deleteItem,
    restoreItem,
    saveBatch,
    getFilteredData,
    getPublishedItems,
    getLocalizedContent,
  };
}

// Helper function to generate ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
