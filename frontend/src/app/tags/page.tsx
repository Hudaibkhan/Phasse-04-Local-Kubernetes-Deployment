'use client';

import { useState, useEffect } from 'react';
import { TagManager } from '../../components/tasks/TagManager';
import { useAuth } from '../../context/AuthContext';
import { Tag } from '../../components/tasks/TaskForm';
import { API_URL } from '@/lib/api';

const TagListPage = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to make authenticated API calls
  const apiCall = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);
    }

    return await response.json();
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await apiCall<Tag[]>('/tags');
      setTags(response);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new tag
  const handleCreateTag = async (tagData: { name: string; color: string }) => {
    try {
      const response = await apiCall<Tag>('/tags', {
        method: 'POST',
        body: JSON.stringify(tagData),
      });
      setTags([...tags, response]);
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  // Update a tag
  const handleUpdateTag = async (tagId: string, tagData: Partial<Tag>) => {
    try {
      const response = await apiCall<Tag>(`/tags/${tagId}`, {
        method: 'PUT',
        body: JSON.stringify(tagData),
      });
      setTags(tags.map(tag => tag.id === tagId ? { ...tag, ...response } : tag));
    } catch (error) {
      console.error('Failed to update tag:', error);
      throw error;
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tagId: string) => {
    try {
      await apiCall(`/tags/${tagId}`, {
        method: 'DELETE',
      });
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Tags</h1>

      <TagManager
        tags={tags}
        onCreateTag={handleCreateTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
};

export default TagListPage;