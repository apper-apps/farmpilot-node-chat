import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import TaskList from "@/components/organisms/TaskList";
import taskService from "@/services/api/taskService";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const TaskModal = ({ isOpen, onClose, task, farms, crops, onSave }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    cropId: "",
    title: "",
    type: "",
    dueDate: "",
    priority: "Medium"
  });

  useEffect(() => {
    if (task) {
setFormData({
        farmId: task.farmId.toString(),
        cropId: task.cropId?.toString() || "",
        title: task.title,
        type: task.type,
        dueDate: task.dueDate.split("T")[0],
        priority: task.priority
      });
    } else {
      setFormData({
        farmId: "",
        cropId: "",
        title: "",
        type: "",
        dueDate: "",
        priority: "Medium"
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.title.trim() || !formData.type || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const taskData = {
      ...formData,
      farmId: parseInt(formData.farmId),
      cropId: formData.cropId ? parseInt(formData.cropId) : null,
      dueDate: new Date(formData.dueDate).toISOString(),
      completed: task?.completed || false,
      completedDate: task?.completedDate || null
    };

    try {
      if (task) {
        await taskService.update(task.Id, taskData);
        toast.success("Task updated successfully!");
      } else {
        await taskService.create(taskData);
        toast.success("Task created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save task");
    }
  };

  if (!isOpen) return null;

  const taskTypes = [
    "Watering", "Fertilizing", "Harvesting", "Planting", 
    "Weeding", "Pruning", "Spraying", "Cultivating", "Other"
  ];

  const priorityOptions = [
    { value: "Low", label: "Low Priority" },
    { value: "Medium", label: "Medium Priority" },
    { value: "High", label: "High Priority" }
  ];

  const farmCrops = crops.filter(crop => 
    formData.farmId ? crop.farmId === parseInt(formData.farmId) : false
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-700">
              {task ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Farm"
            type="select"
            value={formData.farmId}
            onChange={(e) => setFormData({...formData, farmId: e.target.value, cropId: ""})}
            options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
            required
          />

          <FormField
            label="Crop (Optional)"
            type="select"
            value={formData.cropId}
            onChange={(e) => setFormData({...formData, cropId: e.target.value})}
            options={farmCrops.map(crop => ({ 
              value: crop.Id.toString(), 
              label: `${crop.cropType} (${crop.field})` 
            }))}
          />

          <FormField
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Water tomato plants"
            required
          />

          <FormField
            label="Task Type"
            type="select"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            options={taskTypes.map(type => ({ value: type, label: type }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
            <FormField
              label="Priority"
              type="select"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              options={priorityOptions}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);

      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
      setFilteredTasks(tasksData);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    
    if (filterStatus === "pending") {
      filtered = filtered.filter(task => !task.completed);
    } else if (filterStatus === "completed") {
      filtered = filtered.filter(task => task.completed);
    } else if (filterStatus === "overdue") {
      const now = new Date();
      filtered = filtered.filter(task => 
        !task.completed && new Date(task.dueDate) < now
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filterStatus]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  };

  const handleAddTask = () => {
    if (farms.length === 0) {
      toast.error("Please create at least one farm before adding tasks");
      return;
    }
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        completed: !task.completed,
        completedDate: !task.completed ? new Date().toISOString() : null
      };

      await taskService.update(taskId, updatedTask);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleSaveTask = async () => {
    await loadData();
  };

  if (loading) return <Loading />;
  if (error) return <Error title="Failed to load tasks" message={error} onRetry={loadData} />;

  const now = new Date();
  const taskStats = {
    all: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < now).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your farm activities and schedules</p>
        </div>
        <Button onClick={handleAddTask} className="w-full sm:w-auto">
          <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search tasks by title or type..."
          className="lg:max-w-md"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All", count: taskStats.all, color: "bg-gray-500" },
            { key: "pending", label: "Pending", count: taskStats.pending, color: "bg-accent-500" },
            { key: "completed", label: "Completed", count: taskStats.completed, color: "bg-secondary-500" },
            { key: "overdue", label: "Overdue", count: taskStats.overdue, color: "bg-red-500" }
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                filterStatus === status.key
                  ? "bg-primary-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${filterStatus === status.key ? "bg-white" : status.color}`} />
              <span>{status.label} ({status.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          title="No tasks found"
          message={tasks.length === 0 
            ? "Create your first task to start organizing your farm activities."
            : "No tasks match your current filters. Try adjusting your search or filter criteria."
          }
          actionLabel="Add New Task"
          onAction={handleAddTask}
          icon="CheckSquare"
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          farms={farms}
          crops={crops}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        farms={farms}
        crops={crops}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Tasks;