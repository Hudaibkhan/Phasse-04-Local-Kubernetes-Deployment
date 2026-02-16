import React, { useState } from 'react'
import Input from '../forms/Input'
import Textarea from '../forms/Textarea'
import Button from '../forms/Button'
import { TagSelector } from './TagSelector'

export interface Tag {
  id: string
  name: string
  color: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface TaskFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  tags?: string[]
  is_recurring?: boolean
  recurrence_pattern?: string
}

interface TaskFormProps {
  initialData?: TaskFormData
  onSubmit: (data: TaskFormData) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  availableTags: Tag[]
  onAddTag?: (tagName: string) => Promise<Tag>
  isLoading?: boolean
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tags: [],
    is_recurring: false,
    recurrence_pattern: 'daily',
  },
  onSubmit,
  onCancel,
  submitLabel = 'Save Task',
  availableTags,
  onAddTag,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!!initialData);
  const [formData, setFormData] = useState<TaskFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        is_recurring: initialData.is_recurring || false,
        recurrence_pattern: initialData.recurrence_pattern || 'daily'
      };
    }
    return {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      tags: [],
      is_recurring: false,
      recurrence_pattern: 'daily',
    };
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [isRecurring, setIsRecurring] = useState<boolean>(initialData?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState<string>(initialData?.recurrence_pattern || 'daily');

  const prevInitialDataRef = React.useRef(initialData);

  React.useEffect(() => {
    if (JSON.stringify(prevInitialDataRef.current) !== JSON.stringify(initialData)) {
      if (initialData) {
        setFormData({
          ...initialData,
          is_recurring: initialData.is_recurring || false,
          recurrence_pattern: initialData.recurrence_pattern || 'daily'
        });
        setSelectedTags(initialData.tags || []);
        setIsRecurring(initialData.is_recurring || false);
        setRecurrencePattern(initialData.recurrence_pattern || 'daily');
        setIsEditing(true);
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          tags: [],
          is_recurring: false,
          recurrence_pattern: 'daily',
        });
        setSelectedTags([]);
        setIsRecurring(false);
        setRecurrencePattern('daily');
        setIsEditing(false);
      }
    }
    prevInitialDataRef.current = initialData;
  }, [initialData]);
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRecurringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsRecurring(checked)
    setFormData((prev) => ({
      ...prev,
      is_recurring: checked,
    }))
  }

  const handleRecurrencePatternChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value
    setRecurrencePattern(value)
    setFormData((prev) => ({
      ...prev,
      recurrence_pattern: value,
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'low' | 'medium' | 'high'
    setFormData((prev) => ({
      ...prev,
      priority: value,
    }))

    if (errors.priority) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.priority
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      const submitData = {
        ...formData,
        tags: selectedTags,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      }

      try {
        setSubmitting(true);
        await onSubmit(submitData)

        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          tags: [],
          is_recurring: false,
          recurrence_pattern: 'daily',
        })
        setSelectedTags([])
        setIsRecurring(false)
        setRecurrencePattern('daily')
        setErrors({})
      } catch (error) {
        // Error is handled in the parent component
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Input
          label="Title *"
          id="title"
          name="title"
          value={formData.title ?? ''}
          onChange={handleChange}
          error={errors.title}
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <Textarea
          label="Description"
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          error={errors.description}
          placeholder="Enter task description (optional)"
          rows={3}
          required
        />
      </div>

      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
        >
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority ?? 'medium'}
          onChange={handlePriorityChange}
          className={`
            w-full px-4 py-2.5 
            rounded-xl 
            border-2 
            bg-white dark:bg-slate-900
            text-slate-900 dark:text-slate-100
            transition-all duration-200
            focus:outline-none focus:ring-4
            cursor-pointer
            ${
              errors.priority 
                ? 'border-red-400 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30' 
                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-slate-300 dark:hover:border-slate-600'
            }
          `}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {errors.priority && (
          <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.priority}
          </p>
        )}
      </div>

      <div>
        <Input
          label="Due Date (Optional)"
          id="due_date"
          name="due_date"
          type="datetime-local"
          value={formData.due_date || ''}
          onChange={handleDateChange}
          error={errors.due_date}
          placeholder="Select due date"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Tags
        </label>
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={availableTags}
          onAddTag={onAddTag}
        />
      </div>

      {/* Recurring Task Controls */}
      <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-5">
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={handleRecurringChange}
            className="
              h-5 w-5 
              rounded-lg
              border-2 border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-900
              text-indigo-600 dark:text-indigo-500
              transition-all duration-200
              cursor-pointer
              focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30
              hover:border-indigo-400 dark:hover:border-indigo-500
              checked:border-indigo-600 dark:checked:border-indigo-500
              checked:bg-gradient-to-br checked:from-indigo-600 checked:to-purple-600
              dark:checked:from-indigo-500 dark:checked:to-purple-500
            "
          />
          <label
            htmlFor="isRecurring"
            className="ml-3 text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none"
          >
            Recurring Task
          </label>
        </div>

        {isRecurring && (
          <div className="ml-8 space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
            <div>
              <label
                htmlFor="recurrencePattern"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
              >
                Recurrence Pattern
              </label>
              <select
                id="recurrencePattern"
                value={recurrencePattern}
                onChange={handleRecurrencePatternChange}
                className="
                  w-full px-4 py-2.5 
                  rounded-xl 
                  border-2 border-slate-200 dark:border-slate-700
                  bg-white dark:bg-slate-900
                  text-slate-900 dark:text-slate-100
                  transition-all duration-200
                  focus:outline-none focus:ring-4
                  focus:border-indigo-500 dark:focus:border-indigo-400 
                  focus:ring-indigo-100 dark:focus:ring-indigo-900/30
                  hover:border-slate-300 dark:hover:border-slate-600
                  cursor-pointer
                "
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="every_other_day">Every Other Day</option>
                <option value="every_other_week">Every Other Week</option>
                <option value="every_3_days">Every 3 Days</option>
                <option value="every_3_weeks">Every 3 Weeks</option>
                <option value="every_2_months">Every 2 Months</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isLoading || submitting} 
          loading={submitting}
          className="flex-1 sm:flex-initial"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default TaskForm