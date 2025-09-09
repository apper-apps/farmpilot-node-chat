import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const FarmCard = ({ farm, onEdit, onDelete, crops = [], index = 0 }) => {
  const activeCropsCount = crops.filter(crop => crop.farmId === farm.Id && crop.status === "Growing").length;
  const handleEdit = () => {
    onEdit(farm);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this farm? This action cannot be undone.")) {
      onDelete(farm.Id);
      toast.success("Farm deleted successfully!");
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
                  <ApperIcon name="MapPin" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-700 group-hover:text-primary-800 transition-colors">
                    {farm.name}
                  </h3>
                  <p className="text-sm text-gray-500">{farm.location}</p>
                </div>
              </div>
              <Badge variant="primary" className="text-xs">
                {activeCropsCount} Active Crops
              </Badge>
            </div>

            {/* Farm Details */}
            <div className="bg-gradient-to-r from-surface to-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Maximize2" className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="font-semibold text-gray-700">{farm.size} {farm.sizeUnit}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Calendar" className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="font-semibold text-gray-700">
                      {new Date(farm.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
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

export default FarmCard;