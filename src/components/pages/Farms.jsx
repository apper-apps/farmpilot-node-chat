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
import FarmCard from "@/components/organisms/FarmCard";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const FarmModal = ({ isOpen, onClose, farm, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    sizeUnit: "acres",
    location: ""
  });

  useEffect(() => {
    if (farm) {
      setFormData({
name: farm.name,
        size: farm.size.toString(),
        sizeUnit: farm.sizeUnit,
        location: farm.location
      });
    } else {
      setFormData({
        name: "",
        size: "",
        sizeUnit: "acres",
        location: ""
      });
    }
  }, [farm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.size || !formData.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const farmData = {
      ...formData,
      size: parseFloat(formData.size),
      createdAt: farm?.createdAt || new Date().toISOString()
    };

    try {
      if (farm) {
        await farmService.update(farm.Id, farmData);
        toast.success("Farm updated successfully!");
      } else {
        await farmService.create(farmData);
        toast.success("Farm created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save farm");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-700">
              {farm ? "Edit Farm" : "Add New Farm"}
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
            label="Farm Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter farm name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Size"
              type="number"
              step="0.1"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
              placeholder="0.0"
              required
            />
            <FormField
              label="Unit"
              type="select"
              value={formData.sizeUnit}
              onChange={(e) => setFormData({...formData, sizeUnit: e.target.value})}
              options={[
                { value: "acres", label: "Acres" },
                { value: "hectares", label: "Hectares" },
                { value: "sq ft", label: "Square Feet" }
              ]}
            />
          </div>

          <FormField
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Enter farm location"
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {farm ? "Update Farm" : "Create Farm"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);

      setFarms(farmsData);
      setCrops(cropsData);
      setFilteredFarms(farmsData);
    } catch (err) {
      setError(err.message || "Failed to load farms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredFarms(farms);
    } else {
      const filtered = farms.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFarms(filtered);
    }
  };

  const handleAddFarm = () => {
    setSelectedFarm(null);
    setIsModalOpen(true);
  };

  const handleEditFarm = (farm) => {
    setSelectedFarm(farm);
    setIsModalOpen(true);
  };

  const handleDeleteFarm = async (farmId) => {
    try {
      await farmService.delete(farmId);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete farm");
    }
  };

  const handleSaveFarm = async () => {
    await loadData();
  };

  if (loading) return <Loading />;
  if (error) return <Error title="Failed to load farms" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Farms</h1>
          <p className="text-gray-600 mt-1">Manage your farm properties and locations</p>
        </div>
        <Button onClick={handleAddFarm} className="w-full sm:w-auto">
          <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
          Add New Farm
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search farms by name or location..."
          className="lg:max-w-md"
        />
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span>{farms.length} Total Farms</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
            <span>{crops.filter(c => c.status === "Growing").length} Active Crops</span>
          </div>
        </div>
      </div>

      {/* Farms Grid */}
      {filteredFarms.length === 0 ? (
        <Empty
          title="No farms found"
          message={farms.length === 0 
            ? "Create your first farm to start managing your agricultural operations."
            : "No farms match your search criteria. Try adjusting your search terms."
          }
          actionLabel="Add New Farm"
          onAction={handleAddFarm}
          icon="MapPin"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFarms.map((farm, index) => (
            <FarmCard
              key={farm.Id}
              farm={farm}
              crops={crops}
              onEdit={handleEditFarm}
              onDelete={handleDeleteFarm}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Farm Modal */}
      <FarmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farm={selectedFarm}
        onSave={handleSaveFarm}
      />
    </div>
  );
};

export default Farms;