import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import exportService from "@/services/api/exportService";

const ExportDialog = ({ isOpen, onClose, transactions, farms }) => {
  const [formData, setFormData] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    format: "csv",
    includeIncome: true,
    includeExpenses: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    if (!formData.includeIncome && !formData.includeExpenses) {
      toast.error("Please select at least one transaction type to export");
      return;
    }

    try {
      setIsExporting(true);

      // Filter transactions by date range and type
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        
        const isInDateRange = transactionDate >= startDate && transactionDate <= endDate;
        const isIncluded = (formData.includeIncome && transaction.type === "income") ||
                          (formData.includeExpenses && transaction.type === "expense");
        
        return isInDateRange && isIncluded;
      });

      if (filteredTransactions.length === 0) {
        toast.error("No transactions found for the selected criteria");
        return;
      }

      if (formData.format === "csv") {
        await exportService.exportToCSV(filteredTransactions, farms, {
          startDate: formData.startDate,
          endDate: formData.endDate
        });
      } else {
        await exportService.exportToPDF(filteredTransactions, farms, {
          startDate: formData.startDate,
          endDate: formData.endDate
        });
      }

      toast.success(`Successfully exported ${filteredTransactions.length} transactions as ${formData.format.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="Download" className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary-700">Export Financial Data</h2>
                <p className="text-sm text-gray-600">Download transactions for accounting software</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
              <FormField
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Transaction Types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Include Transaction Types</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeIncome"
                  checked={formData.includeIncome}
                  onChange={(e) => setFormData({...formData, includeIncome: e.target.checked})}
                  className="w-4 h-4 text-secondary-500 border-gray-300 rounded focus:ring-secondary-500"
                />
                <label htmlFor="includeIncome" className="text-sm font-medium text-gray-700">
                  Income transactions
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeExpenses"
                  checked={formData.includeExpenses}
                  onChange={(e) => setFormData({...formData, includeExpenses: e.target.checked})}
                  className="w-4 h-4 text-secondary-500 border-gray-300 rounded focus:ring-secondary-500"
                />
                <label htmlFor="includeExpenses" className="text-sm font-medium text-gray-700">
                  Expense transactions
                </label>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, format: "csv"})}
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                  formData.format === "csv"
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ApperIcon name="FileText" className="h-5 w-5" />
                  <span className="font-medium">CSV</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Excel compatible</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, format: "pdf"})}
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                  formData.format === "pdf"
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ApperIcon name="FileText" className="h-5 w-5" />
                  <span className="font-medium">PDF</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Print friendly</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <ApperIcon name="Download" className="h-4 w-4 mr-2" />
                  Export {formData.format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportDialog;