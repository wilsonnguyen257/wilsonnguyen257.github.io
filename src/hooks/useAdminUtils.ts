/**
 * Custom hooks for admin panel functionality
 */

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
}

export interface DeleteConfirmState {
  show: boolean;
  id: string | null;
}

/**
 * Hook for managing toast notifications
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({ message, type: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ message, type: 'error' });
  }, []);

  return {
    toast,
    setToast,
    showToast,
    hideToast,
    showSuccess,
    showError,
  };
}

/**
 * Hook for managing delete confirmation dialogs
 */
export function useDeleteConfirm() {
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    show: false,
    id: null,
  });

  const showDeleteConfirm = useCallback((id: string) => {
    setDeleteConfirm({ show: true, id });
  }, []);

  const hideDeleteConfirm = useCallback(() => {
    setDeleteConfirm({ show: false, id: null });
  }, []);

  return {
    deleteConfirm,
    setDeleteConfirm,
    showDeleteConfirm,
    hideDeleteConfirm,
  };
}

/**
 * Hook for managing bulk selection
 */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  }, [items, selectedItems.size]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedItems.has(id),
    [selectedItems]
  );

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;
  const hasSelection = selectedItems.size > 0;

  return {
    selectedItems,
    setSelectedItems,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    hasSelection,
    selectedCount: selectedItems.size,
  };
}
