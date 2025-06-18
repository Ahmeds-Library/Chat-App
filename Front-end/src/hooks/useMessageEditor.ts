
import { useState, useCallback } from 'react';

export const useMessageEditor = () => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const startEdit = useCallback((messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingText(content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingText('');
  }, []);

  const updateEditingText = useCallback((text: string) => {
    setEditingText(text);
  }, []);

  return {
    editingMessageId,
    editingText,
    startEdit,
    cancelEdit,
    updateEditingText,
    setEditingText: updateEditingText
  };
};
