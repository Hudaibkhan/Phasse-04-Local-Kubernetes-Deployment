import { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import Input from '../forms/Input';
import Button from '../forms/Button';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface TagManagerProps {
  tags: Tag[];
  onCreateTag: (tagData: { name: string; color: string }) => Promise<void>;
  onUpdateTag: (tagId: string, tagData: Partial<Tag>) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
}

export const TagManager = ({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag
}: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editedTagName, setEditedTagName] = useState('');

  const colors = [
    { name: 'Red', value: 'red' },
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Purple', value: 'purple' },
    { name: 'Gray', value: 'gray' },
    { name: 'Pink', value: 'pink' },
    { name: 'Indigo', value: 'indigo' },
  ];

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    await onCreateTag({ name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
  };

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditedTagName(tag.name);
  };

  const saveEdit = async () => {
    if (!editingTagId || !editedTagName.trim()) return;

    await onUpdateTag(editingTagId, { name: editedTagName.trim() });
    setEditingTagId(null);
    setEditedTagName('');
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setEditedTagName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
        <form onSubmit={handleCreateTag} className="flex gap-2">
          <Input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name"
            className="flex-grow"
          />
          <select
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {colors.map(color => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
          <Button type="submit">Create Tag</Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Manage Tags</h3>
        <div className="space-y-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center justify-between p-3 border rounded">
              {editingTagId === tag.id ? (
                <div className="flex items-center gap-2 flex-grow">
                  <Input
                    type="text"
                    value={editedTagName}
                    onChange={(e) => setEditedTagName(e.target.value)}
                    className="flex-grow"
                    autoFocus
                  />
                  <Button type="button" variant="success" onClick={saveEdit}>Save</Button>
                  <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${getTagColorClass(tag.color)} cursor-default`}>
                      {tag.name}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startEditing(tag)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDeleteTag(tag.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-gray-500 italic">No tags created yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getTagColorClass = (color: string) => {
  const colorClasses: Record<string, string> = {
    red: 'border-red-200 text-red-700',
    blue: 'border-blue-200 text-blue-700',
    green: 'border-green-200 text-green-700',
    yellow: 'border-yellow-200 text-yellow-700',
    purple: 'border-purple-200 text-purple-700',
    gray: 'border-gray-200 text-gray-700',
    pink: 'border-pink-200 text-pink-700',
    indigo: 'border-indigo-200 text-indigo-700',
  };

  return colorClasses[color] || colorClasses.gray;
};