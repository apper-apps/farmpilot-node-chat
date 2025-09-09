import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import activityService from "@/services/api/activityService";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import equipmentService from "@/services/api/equipmentService";

const ActivityModal = ({ isOpen, onClose, activity, farms, crops, equipment, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    farmId: "",
    cropId: "",
    equipmentId: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || "",
        type: activity.type || "",
        description: activity.description || "",
        date: activity.date ? activity.date.split('T')[0] : new Date().toISOString().split('T')[0],
        farmId: activity.farmId?.toString() || "",
        cropId: activity.cropId?.toString() || "",
        equipmentId: activity.equipmentId?.toString() || ""
      });
    } else {
      setFormData({
        name: "",
        type: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        farmId: "",
        cropId: "",
        equipmentId: ""
      });
    }
  }, [activity, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const activityData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        farmId: formData.farmId || null,
        cropId: formData.cropId || null,
        equipmentId: formData.equipmentId || null
      };

      if (activity) {
        await activityService.update(activity.Id, activityData);
        toast.success("Activity updated successfully!");
      } else {
        await activityService.create(activityData);
        toast.success("Activity created successfully!");
      }
      
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save activity");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-700">
              {activity ? "Edit Activity" : "Add New Activity"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Activity Name"
              required
              error=""
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter activity name"
                required
                disabled={loading}
              />
            </FormField>

            <FormField
              label="Activity Type"
              required
              error=""
            >
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Select activity type</option>
                <option value="Planting">Planting</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Fertilizing">Fertilizing</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inspection">Inspection</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>

          <FormField
            label="Date"
            required
            error=""
          >
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Description"
            error=""
          >
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
              placeholder="Enter activity description"
              disabled={loading}
              rows={4}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Farm"
              error=""
            >
              <select
                value={formData.farmId}
                onChange={(e) => setFormData(prev => ({ ...prev, farmId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select farm (optional)</option>
                {farms.map((farm) => (
                  <option key={farm.Id} value={farm.Id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Crop"
              error=""
            >
              <select
                value={formData.cropId}
                onChange={(e) => setFormData(prev => ({ ...prev, cropId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select crop (optional)</option>
                {crops.map((crop) => (
                  <option key={crop.Id} value={crop.Id}>
                    {crop.cropType}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Equipment"
              error=""
            >
              <select
                value={formData.equipmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, equipmentId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select equipment (optional)</option>
                {equipment.map((item) => (
                  <option key={item.Id} value={item.Id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {activity ? "Update Activity" : "Create Activity"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [activitiesData, farmsData, cropsData, equipmentData] = await Promise.all([
        activityService.getAll(),
        farmService.getAll(),
        cropService.getAll(),
        equipmentService.getAll()
      ]);

      setActivities(activitiesData);
      setFarms(farmsData);
      setCrops(cropsData);
      setEquipment(equipmentData);
      setFilteredActivities(activitiesData);
    } catch (err) {
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = activities;
    
    if (filterType !== "all") {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    setFilteredActivities(filtered);
  }, [activities, filterType]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  };

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    try {
      await activityService.delete(activityId);
      toast.success("Activity deleted successfully!");
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete activity");
    }
  };

  const handleSaveActivity = () => {
    loadData();
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      "Planting": "Sprout",
      "Irrigation": "Droplets",
      "Fertilizing": "Zap",
      "Pest Control": "Shield",
      "Harvesting": "Package",
      "Maintenance": "Wrench",
      "Inspection": "Eye",
      "Other": "Activity"
    };
    return iconMap[type] || "Activity";
  };

  const getActivityTypeColor = (type) => {
    const colorMap = {
      "Planting": "bg-secondary-500",
      "Irrigation": "bg-blue-500",
      "Fertilizing": "bg-accent-500",
      "Pest Control": "bg-red-500",
      "Harvesting": "bg-purple-500",
      "Maintenance": "bg-gray-500",
      "Inspection": "bg-primary-500",
      "Other": "bg-gray-400"
    };
    return colorMap[type] || "bg-gray-400";
  };

  const activityTypes = [...new Set(activities.map(activity => activity.type))].filter(Boolean);

  if (loading) return <Loading />;
  if (error) return <Error title="Failed to load activities" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Activities</h1>
          <p className="text-gray-600 mt-1">Track and manage your farm activities</p>
        </div>
        <Button onClick={handleAddActivity} className="w-full sm:w-auto">
          <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
          Add New Activity
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search activities by name, type, or description..."
          className="lg:max-w-md"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filterType === "all"
                ? "bg-primary-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({activities.length})
          </button>
          {activityTypes.map((type) => {
            const count = activities.filter(activity => activity.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  filterType === type
                    ? "bg-primary-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  filterType === type ? "bg-white" : getActivityTypeColor(type)
                }`} />
                <span>{type} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <Empty
          title="No activities found"
          message={activities.length === 0 
            ? "Create your first activity to start tracking your farm operations."
            : "No activities match your current filters. Try adjusting your search or filter criteria."
          }
          actionLabel="Add New Activity"
          onAction={handleAddActivity}
          icon="Activity"
        />
      ) : (
        <div className="grid gap-6">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getActivityTypeColor(activity.type)}`}>
                        <ApperIcon 
                          name={getActivityIcon(activity.type)} 
                          className="h-6 w-6 text-white" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {activity.name}
                          </h3>
                          <Badge variant="default">
                            {activity.type}
                          </Badge>
                        </div>
                        
                        {activity.description && (
                          <p className="text-gray-600 mb-3">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Calendar" className="h-4 w-4" />
                            <span>{format(new Date(activity.date), "MMM dd, yyyy")}</span>
                          </div>
                          
                          {activity.farmName && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center space-x-1">
                                <ApperIcon name="MapPin" className="h-4 w-4" />
                                <span>{activity.farmName}</span>
                              </div>
                            </>
                          )}
                          
                          {activity.cropName && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center space-x-1">
                                <ApperIcon name="Sprout" className="h-4 w-4" />
                                <span>{activity.cropName}</span>
                              </div>
                            </>
                          )}
                          
                          {activity.equipmentName && (
                            <>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center space-x-1">
                                <ApperIcon name="Wrench" className="h-4 w-4" />
                                <span>{activity.equipmentName}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditActivity(activity)}
                      >
                        <ApperIcon name="Edit2" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity.Id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
        farms={farms}
        crops={crops}
        equipment={equipment}
        onSave={handleSaveActivity}
      />
    </div>
  );
};

export default Activity;