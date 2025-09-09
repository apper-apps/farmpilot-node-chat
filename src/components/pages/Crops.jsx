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
import CropTable from "@/components/organisms/CropTable";
import cropService from "@/services/api/cropService";
import farmService from "@/services/api/farmService";

const CropModal = ({ isOpen, onClose, crop, farms, onSave }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    cropType: "",
    field: "",
    plantingDate: "",
    expectedHarvest: "",
    status: "Planned",
    notes: ""
  });

  useEffect(() => {
    if (crop) {
      setFormData({
farmId: crop.farmId.toString(),
        cropType: crop.cropType,
        field: crop.field,
        plantingDate: crop.plantingDate.split("T")[0],
        expectedHarvest: crop.expectedHarvest.split("T")[0],
        status: crop.status,
        notes: crop.notes || ""
      });
    } else {
      setFormData({
        farmId: "",
        cropType: "",
        field: "",
        plantingDate: "",
        expectedHarvest: "",
        status: "Planned",
        notes: ""
      });
    }
  }, [crop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.cropType.trim() || !formData.field.trim() || !formData.plantingDate || !formData.expectedHarvest) {
      toast.error("Please fill in all required fields");
      return;
    }

    const cropData = {
      ...formData,
      farmId: parseInt(formData.farmId),
      plantingDate: new Date(formData.plantingDate).toISOString(),
      expectedHarvest: new Date(formData.expectedHarvest).toISOString()
    };

    try {
      if (crop) {
        await cropService.update(crop.Id, cropData);
        toast.success("Crop updated successfully!");
      } else {
        await cropService.create(cropData);
        toast.success("Crop created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save crop");
    }
  };

  if (!isOpen) return null;

  const cropTypes = [
    "Corn", "Wheat", "Soybeans", "Rice", "Barley", "Oats", 
    "Tomatoes", "Potatoes", "Carrots", "Lettuce", "Spinach",
    "Apples", "Oranges", "Strawberries", "Cotton", "Other"
  ];

  const statusOptions = [
    { value: "Planned", label: "Planned" },
    { value: "Planted", label: "Planted" },
    { value: "Growing", label: "Growing" },
    { value: "Harvested", label: "Harvested" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-700">
              {crop ? "Edit Crop" : "Add New Crop"}
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
            onChange={(e) => setFormData({...formData, farmId: e.target.value})}
            options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
            required
          />

          <FormField
            label="Crop Type"
            type="select"
            value={formData.cropType}
            onChange={(e) => setFormData({...formData, cropType: e.target.value})}
            options={cropTypes.map(type => ({ value: type, label: type }))}
            required
          />

          <FormField
            label="Field/Area"
            value={formData.field}
            onChange={(e) => setFormData({...formData, field: e.target.value})}
            placeholder="e.g., North Field, Section A"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Planting Date"
              type="date"
              value={formData.plantingDate}
              onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
              required
            />
            <FormField
              label="Expected Harvest"
              type="date"
              value={formData.expectedHarvest}
              onChange={(e) => setFormData({...formData, expectedHarvest: e.target.value})}
              required
            />
          </div>

          <FormField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={statusOptions}
          />

          <FormField
            label="Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes about this crop..."
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {crop ? "Update Crop" : "Create Crop"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
      setFilteredCrops(cropsData);
    } catch (err) {
      setError(err.message || "Failed to load crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = crops;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(crop => crop.status.toLowerCase() === filterStatus);
    }

    setFilteredCrops(filtered);
  }, [crops, filterStatus]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredCrops(crops);
    } else {
      const filtered = crops.filter(crop =>
        crop.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.field.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCrops(filtered);
    }
  };

  const handleAddCrop = () => {
    if (farms.length === 0) {
      toast.error("Please create at least one farm before adding crops");
      return;
    }
    setSelectedCrop(null);
    setIsModalOpen(true);
  };

  const handleEditCrop = (crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleDeleteCrop = async (cropId) => {
    try {
      await cropService.delete(cropId);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete crop");
    }
  };

  const handleSaveCrop = async () => {
    await loadData();
  };

  if (loading) return <Loading />;
  if (error) return <Error title="Failed to load crops" message={error} onRetry={loadData} />;

  const statusStats = {
    all: crops.length,
    planned: crops.filter(c => c.status.toLowerCase() === "planned").length,
    growing: crops.filter(c => c.status.toLowerCase() === "growing").length,
    harvested: crops.filter(c => c.status.toLowerCase() === "harvested").length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Crops</h1>
          <p className="text-gray-600 mt-1">Track and manage your crop plantings</p>
        </div>
        <Button onClick={handleAddCrop} className="w-full sm:w-auto">
          <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
          Add New Crop
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search crops by type or field..."
          className="lg:max-w-md"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All", count: statusStats.all },
            { key: "planned", label: "Planned", count: statusStats.planned },
            { key: "growing", label: "Growing", count: statusStats.growing },
            { key: "harvested", label: "Harvested", count: statusStats.harvested }
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterStatus === status.key
                  ? "bg-primary-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.label} ({status.count})
            </button>
          ))}
        </div>
      </div>

      {/* Crops Table */}
      {filteredCrops.length === 0 ? (
        <Empty
          title="No crops found"
          message={crops.length === 0 
            ? "Start by adding your first crop to track its growth and harvest schedule."
            : "No crops match your current filters. Try adjusting your search or filter criteria."
          }
          actionLabel="Add New Crop"
          onAction={handleAddCrop}
          icon="Sprout"
        />
      ) : (
        <CropTable
          crops={filteredCrops}
          farms={farms}
          onEdit={handleEditCrop}
          onDelete={handleDeleteCrop}
        />
      )}

      {/* Crop Modal */}
      <CropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        crop={selectedCrop}
        farms={farms}
        onSave={handleSaveCrop}
      />
    </div>
  );
};

export default Crops;