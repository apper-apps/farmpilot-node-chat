import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import ExportDialog from "@/components/organisms/ExportDialog";
import TransactionList from "@/components/organisms/TransactionList";
import farmService from "@/services/api/farmService";
import transactionService from "@/services/api/transactionService";

const TransactionModal = ({ isOpen, onClose, transaction, farms, onSave }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    type: "expense",
    category: "",
    amount: "",
    date: "",
    description: ""
  });

useEffect(() => {
    if (transaction) {
      setFormData({
        farmId: transaction.farmId.toString(),
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        date: transaction.date.split("T")[0],
        description: transaction.description || ""
      });
    } else {
      setFormData({
        farmId: "",
        type: "expense",
        category: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        description: ""
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.category || !formData.amount || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const transactionData = {
      ...formData,
      farmId: parseInt(formData.farmId),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString()
    };

    try {
      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save transaction");
    }
  };

  if (!isOpen) return null;

  const expenseCategories = [
    "Seeds", "Fertilizer", "Equipment", "Labor", 
    "Utilities", "Maintenance", "Other Expense"
  ];

  const incomeCategories = [
    "Crop Sales", "Livestock Sales", "Equipment Sales", "Other Income"
  ];

  const categories = formData.type === "expense" ? expenseCategories : incomeCategories;

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
              {transaction ? "Edit Transaction" : "Add New Transaction"}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value, category: ""})}
              options={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" }
              ]}
            />
            <FormField
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              options={categories.map(cat => ({ value: cat, label: cat }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
            <FormField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Additional details about this transaction..."
          />

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {transaction ? "Update Transaction" : "Create Transaction"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Finance = () => {
const [transactions, setTransactions] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactionsData, farmsData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll()
      ]);

      setTransactions(transactionsData);
      setFarms(farmsData);
      setFilteredTransactions(transactionsData);
    } catch (err) {
      setError(err.message || "Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = transactions;
    
    if (filterType !== "all") {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction =>
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  };

  const handleAddTransaction = () => {
    if (farms.length === 0) {
      toast.error("Please create at least one farm before adding transactions");
      return;
    }
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await transactionService.delete(transactionId);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete transaction");
    }
  };

  const handleSaveTransaction = async () => {
    await loadData();
  };

if (loading) return <Loading />;
  if (error) return <Error title="Failed to load financial data" message={error} onRetry={loadData} />;

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpenses;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const transactionStats = {
    all: transactions.length,
    income: transactions.filter(t => t.type === "income").length,
    expense: transactions.filter(t => t.type === "expense").length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Finance</h1>
          <p className="text-gray-600 mt-1">Track your farm income and expenses</p>
        </div>
<div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleAddTransaction} className="w-full sm:w-auto">
            <ApperIcon name="Plus" className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
          <Button variant="secondary" onClick={() => setIsExportDialogOpen(true)} className="w-full sm:w-auto">
            <ApperIcon name="Download" className="h-5 w-5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-3xl font-bold text-secondary-600">{formatCurrency(totalIncome)}</p>
                  <p className="text-sm text-gray-500 mt-1">{transactionStats.income} transactions</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                  <ApperIcon name="TrendingUp" className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-3xl font-bold text-accent-600">{formatCurrency(totalExpenses)}</p>
                  <p className="text-sm text-gray-500 mt-1">{transactionStats.expense} transactions</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                  <ApperIcon name="TrendingDown" className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-3xl font-bold ${profit >= 0 ? "text-secondary-600" : "text-red-600"}`}>
                    {formatCurrency(profit)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {profit >= 0 ? "Profitable" : "Loss"} this period
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  profit >= 0 
                    ? "bg-gradient-to-br from-secondary-500 to-secondary-600" 
                    : "bg-gradient-to-br from-red-500 to-red-600"
                }`}>
                  <ApperIcon name={profit >= 0 ? "DollarSign" : "AlertTriangle"} className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search transactions by category or description..."
          className="lg:max-w-md"
        />
        
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All", count: transactionStats.all },
            { key: "income", label: "Income", count: transactionStats.income },
            { key: "expense", label: "Expenses", count: transactionStats.expense }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setFilterType(type.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === type.key
                  ? "bg-primary-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type.label} ({type.count})
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Empty
          title="No transactions found"
          message={transactions.length === 0 
            ? "Start tracking your farm finances by adding your first income or expense record."
            : "No transactions match your current filters. Try adjusting your search or filter criteria."
          }
          actionLabel="Add Transaction"
          onAction={handleAddTransaction}
          icon="DollarSign"
        />
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          farms={farms}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        farms={farms}
onSave={handleSaveTransaction}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        transactions={transactions}
        farms={farms}
      />
    </div>
  );
};

export default Finance;