import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { PlannerTask, TaskCategory, TaskStatus } from '../types';
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Filter,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const EventPlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CHECKLIST' | 'SCHEDULE'>('CHECKLIST');

  // New task modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('LOGISTICS');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  // Template applicator
  const [selectedTemplate, setSelectedTemplate] = useState('Wedding Planner');
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/planner/tasks');
      setTasks(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch planner tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleApplyTemplate = async () => {
    setApplyingTemplate(true);
    try {
      const response = await apiClient.post('/planner/template', null, {
        params: { templateName: selectedTemplate },
      });
      setTasks(response.data || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to apply template.');
    } finally {
      setApplyingTemplate(false);
    }
  };

  const handleToggleStatus = async (task: PlannerTask) => {
    const nextStatus: TaskStatus =
      task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'TODO';

    try {
      const response = await apiClient.put(`/planner/tasks/${task.id}`, {
        ...task,
        status: nextStatus,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? response.data : t)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiClient.delete(`/planner/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await apiClient.post('/planner/tasks', {
        title: newTitle,
        description: newDescription,
        category: newCategory,
        deadlineDate: newDeadline || null,
        eventTimeSlot: newTimeSlot || null,
        status: 'TODO',
        displayOrder: tasks.length + 1,
      });
      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewDeadline('');
      setNewTimeSlot('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    const matchCat = filterCategory === 'ALL' || t.category === filterCategory;
    const matchStat = filterStatus === 'ALL' || t.status === filterStatus;
    return matchCat && matchStat;
  });

  const scheduledTasks = [...tasks]
    .filter((t) => t.eventTimeSlot || t.deadlineDate)
    .sort((a, b) => (a.eventTimeSlot || '').localeCompare(b.eventTimeSlot || ''));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-emerald-600" />
            Event Planner & Execution Timeline
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize milestone checklists, track vendor deliverables, and orchestrate the minute-by-minute event schedule.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={() => setViewMode('CHECKLIST')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === 'CHECKLIST'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Checklist View
          </button>
          <button
            onClick={() => setViewMode('SCHEDULE')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === 'SCHEDULE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Event-Day Timeline
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Progress & Template Applicator Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Bar Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Milestone Progress</span>
              <span className="text-sm font-extrabold text-emerald-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {completedCount} of {tasks.length} items completed.
          </p>
        </div>

        {/* Template Selector Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Standardized Event Checklist Templates
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Instantly bootstrap your event with industry-tested vendor, catering, and day-of execution checklists.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-gray-700"
            >
              <option value="Wedding Planner">Wedding Planner Template</option>
              <option value="Corporate Conference">Corporate Conference</option>
              <option value="Birthday Gala">Birthday Gala</option>
              <option value="Music Festival">Live Performance / Concert</option>
            </select>
            <button
              onClick={handleApplyTemplate}
              disabled={applyingTemplate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow whitespace-nowrap"
            >
              {applyingTemplate ? 'Populating...' : 'Apply Template'}
            </button>
          </div>
        </div>
      </div>

      {/* Checklist View */}
      {viewMode === 'CHECKLIST' && (
        <div>
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-600 uppercase">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5"
              >
                <option value="ALL">All Categories</option>
                <option value="VENUE">Venue</option>
                <option value="CATERING">Catering</option>
                <option value="DECOR">Decor</option>
                <option value="LOGISTICS">Logistics</option>
                <option value="GUESTS">Guests</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchTasks} />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks match your criteria"
              description="Apply a template above or add custom milestones to begin managing your timeline."
            />
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                    task.status === 'COMPLETED'
                      ? 'border-gray-200 bg-gray-50 opacity-80'
                      : 'border-gray-200 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-grow">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="mt-0.5 text-gray-400 hover:text-emerald-600 transition"
                      title="Click to advance status"
                    >
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {task.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      )}

                      <div className="flex gap-4 text-[11px] text-gray-400 mt-1.5">
                        {task.deadlineDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Target Date: {task.deadlineDate}
                          </span>
                        )}
                        {task.eventTimeSlot && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Time: {task.eventTimeSlot}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Cycle Status
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event-Day Timeline View */}
      {viewMode === 'SCHEDULE' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Day-of Event Schedule Run-Sheet
          </h3>

          {scheduledTasks.length === 0 ? (
            <EmptyState
              title="No scheduled timeline slots"
              description="Add time slots (e.g., '09:00 AM - Vendor Arrival') to your tasks to see them in this chronological run-sheet."
            />
          ) : (
            <div className="relative pl-6 border-l-2 border-emerald-400 space-y-6">
              {scheduledTasks.map((t) => (
                <div key={t.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm" />
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-emerald-700">
                      {t.eventTimeSlot || t.deadlineDate || 'Schedule Slot'}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-0.5">{t.title}</h4>
                    {t.description && <p className="text-xs text-gray-600 mt-1">{t.description}</p>}
                    <span className="inline-block mt-2 px-2 py-0.5 bg-white text-[10px] font-semibold text-gray-500 rounded border border-gray-200">
                      {t.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Custom Planning Milestone</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Finalize floral centerpieces"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="VENUE">Venue</option>
                  <option value="CATERING">Catering</option>
                  <option value="DECOR">Decor</option>
                  <option value="LOGISTICS">Logistics</option>
                  <option value="GUESTS">Guests</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Additional task requirements or vendor contacts..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Day-of Time Slot</label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    placeholder="E.g., 10:00 AM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
