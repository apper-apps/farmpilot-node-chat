import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const EquipmentCard = ({ equipment, onEdit, onDelete, index = 0 }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "tractor":
        return "Truck";
      case "harvester":
        return "Scissors";
      case "planter":
        return "Sprout";
      case "sprayer":
        return "Droplet";
      default:
        return "Wrench";
    }
  };

  const handleEdit = () => {
    onEdit(equipment);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this equipment? This action cannot be undone.")) {
      onDelete(equipment.Id);
      toast.success("Equipment deleted successfully!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <ApperIcon name={getTypeIcon(equipment.type)} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-700 group-hover:text-primary-800 transition-colors">
                    {equipment.name}
                  </h3>
                  <p className="text-sm text-gray-500">{equipment.brand} {equipment.model}</p>
                </div>
              </div>
              <Badge className={getStatusColor(equipment.status)}>
                {equipment.status}
              </Badge>
            </div>

            {/* Equipment Details */}
            <div className="bg-gradient-to-r from-surface to-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Calendar" className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Year</p>
                    <p className="font-semibold text-gray-700">{equipment.year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Clock" className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Hours</p>
                    <p className="font-semibold text-gray-700">{equipment.operatingHours}h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Value and Maintenance */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Value</span>
                <span className="font-semibold text-primary-700">
                  ${equipment.currentValue?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next Maintenance</span>
                <span className="text-sm font-medium text-gray-700">
                  {equipment.nextMaintenance 
                    ? new Date(equipment.nextMaintenance).toLocaleDateString()
                    : "Not scheduled"
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex-1"
              >
                <ApperIcon name="Edit2" className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <ApperIcon name="Trash2" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EquipmentCard;