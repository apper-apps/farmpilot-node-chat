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
import EquipmentCard from "@/components/organisms/EquipmentCard";
import equipmentService from "@/services/api/equipmentService";
import farmService from "@/services/api/farmService";

const EquipmentModal = ({ isOpen, onClose, equipment, onSave, farms = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Tractor",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    status: "Active",
    farmId: "",
    purchasePrice: "",
    currentValue: "",
    maintenanceSchedule: "",
    operatingHours: "",
    fuelType: "Diesel",
    specifications: ""
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
name: equipment.name,
        type: equipment.type,
        brand: equipment.brand,
        model: equipment.model,
        year: equipment.year,
        status: equipment.status,
        farmId: equipment.farmId?.toString() || "",
        purchasePrice: equipment.purchasePrice?.toString() || "",
        currentValue: equipment.currentValue?.toString() || "",
        maintenanceSchedule: equipment.maintenanceSchedule || "",
        operatingHours: equipment.operatingHours?.toString() || "",
        fuelType: equipment.fuelType || "Diesel",
        specifications: equipment.specifications || ""
      });
    } else {
      setFormData({
        name: "",
        type: "Tractor",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        status: "Active",
        farmId: "",
        purchasePrice: "",
        currentValue: "",
        maintenanceSchedule: "",
        operatingHours: "",
        fuelType: "Diesel",
        specifications: ""
      });
    }
  }, [equipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.brand.trim() || !formData.model.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const equipmentData = {
      ...formData,
      year: parseInt(formData.year),
      farmId: formData.farmId ? parseInt(formData.farmId) : null,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
      currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
      operatingHours: formData.operatingHours ? parseInt(formData.operatingHours) : null,
      createdAt: equipment?.createdAt || new Date().toISOString()
    };

    try {
      if (equipment) {
        await equipmentService.update(equipment.Id, equipmentData);
        toast.success("Equipment updated successfully!");
      } else {
        await equipmentService.create(equipmentData);
        toast.success("Equipment created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save equipment");
    }
  };

  if (!isOpen) return null;

  const equipmentTypes = [
    { value: "Tractor", label: "Tractor" },
    { value: "Harvester", label: "Harvester" },
    { value: "Planter", label: "Planter" },
    { value: "Sprayer", label: "Sprayer" },
    { value: "Cultivator", label: "Cultivator" },
    { value: "Other", label: "Other" }
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Maintenance", label: "Under Maintenance" },
    { value: "Inactive", label: "Inactive" }
  ];

  const fuelTypes = [
    { value: "Diesel", label: "Diesel" },
    { value: "Gasoline", label: "Gasoline" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-700">
              {equipment ? "Edit Equipment" : "Add New Equipment"}
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
            label="Equipment Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter equipment name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              options={equipmentTypes}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              options={statusOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="Enter brand"
              required
            />
            <FormField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
              placeholder="Enter model"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
            />
            <FormField
              label="Assigned Farm"
              type="select"
              value={formData.farmId}
              onChange={(e) => setFormData({...formData, farmId: e.target.value})}
              options={[
                { value: "", label: "No assignment" },
                ...farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Purchase Price ($)"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
              placeholder="0.00"
            />
            <FormField
              label="Current Value ($)"
              type="number"
              step="0.01"
              value={formData.currentValue}
              onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Operating Hours"
              type="number"
              min="0"
              value={formData.operatingHours}
              onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
              placeholder="0"
            />
            <FormField
              label="Fuel Type"
              type="select"
              value={formData.fuelType}
              onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
              options={fuelTypes}
            />
          </div>

          <FormField
            label="Maintenance Schedule"
            value={formData.maintenanceSchedule}
            onChange={(e) => setFormData({...formData, maintenanceSchedule: e.target.value})}
            placeholder="e.g., Every 250 hours"
          />

          <FormField
            label="Specifications"
            type="textarea"
            value={formData.specifications}
            onChange={(e) => setFormData({...formData, specifications: e.target.value})}
            placeholder="Enter technical specifications"
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {equipment ? "Update Equipment" : "Create Equipment"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [equipmentData, farmsData] = await Promise.all([
        equipmentService.getAll(),
        farmService.getAll()
      ]);

      setEquipment(equipmentData);
      setFarms(farmsData);
      setFilteredEquipment(equipmentData);
    } catch (err) {
      setError(err.message || "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredEquipment(equipment);
    } else {
      const filtered = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
    }
  };

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setIsModalOpen(true);
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const handleDeleteEquipment = async (equipmentId) => {
    try {
      await equipmentService.delete(equipmentId);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete equipment");
    }
  };

  const handleSaveEquipment = async () => {
    await loadData();
  };

  if (loading) return <Loading />;
  if (error) return <Error title="Failed to load equipment" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Equipment</h1>
          <p className="text-gray-600 mt-1">Manage your farm equipment and machinery</p>
        </div>
        <Button onClick={handleAddEquipment} className="w-full sm:w-auto">
          <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
          Add New Equipment
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search equipment by name, brand, model, or type..."
          className="lg:max-w-md"
        />
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <span>{equipment.length} Total Equipment</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>{equipment.filter(e => e.status === "Active").length} Active</span>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <Empty
          title="No equipment found"
          message={equipment.length === 0 
            ? "Add your first piece of equipment to start tracking your farm machinery."
            : "No equipment matches your search criteria. Try adjusting your search terms."
          }
          actionLabel="Add New Equipment"
          onAction={handleAddEquipment}
          icon="Wrench"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.map((item, index) => (
            <EquipmentCard
              key={item.Id}
              equipment={item}
              onEdit={handleEditEquipment}
              onDelete={handleDeleteEquipment}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipment={selectedEquipment}
        farms={farms}
        onSave={handleSaveEquipment}
      />
    </div>
  );
};

export default Equipment;