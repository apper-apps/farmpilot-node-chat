import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import WeatherCard from "@/components/molecules/WeatherCard";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import taskService from "@/services/api/taskService";
import transactionService from "@/services/api/transactionService";
import weatherService from "@/services/api/weatherService";

const Dashboard = () => {
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    transactions: [],
    weather: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [farmsData, cropsData, tasksData, transactionsData, weatherData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getAll(),
        weatherService.getCurrentWeather()
      ]);

      setData({
        farms: farmsData,
        crops: cropsData,
        tasks: tasksData,
        transactions: transactionsData,
        weather: weatherData
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error title="Dashboard Error" message={error} onRetry={loadData} />;

const activeCrops = data.crops.filter(crop => crop.status === "Growing");
  const upcomingTasks = data.tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);
  
  const recentTransactions = data.transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const totalIncome = data.transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = data.transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpenses;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const getTaskIcon = (type) => {
    switch (type.toLowerCase()) {
      case "watering":
        return "Droplets";
      case "fertilizing":
        return "Zap";
      case "harvesting":
        return "Scissors";
      case "planting":
        return "Sprout";
      default:
        return "CheckSquare";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Farm Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening on your farm today.
          </p>
        </div>
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="text-sm opacity-90">Today</div>
          <div className="text-lg font-bold">{format(new Date(), "MMM dd, yyyy")}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Farms</p>
                  <p className="text-3xl font-bold text-primary-700">{data.farms.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <ApperIcon name="MapPin" className="h-6 w-6 text-white" />
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
                  <p className="text-sm font-medium text-gray-600">Active Crops</p>
                  <p className="text-3xl font-bold text-secondary-600">{activeCrops.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center">
                  <ApperIcon name="Sprout" className="h-6 w-6 text-white" />
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
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-3xl font-bold text-accent-600">{upcomingTasks.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                  <ApperIcon name="CheckSquare" className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Profit</p>
                  <p className={`text-3xl font-bold ${profit >= 0 ? "text-secondary-600" : "text-red-600"}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  profit >= 0 
                    ? "bg-gradient-to-br from-secondary-500 to-secondary-600" 
                    : "bg-gradient-to-br from-red-500 to-red-600"
                }`}>
                  <ApperIcon name={profit >= 0 ? "TrendingUp" : "TrendingDown"} className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weather Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Cloud" className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-700">Weather Forecast</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.weather.slice(0, 5).map((weather, index) => (
                <WeatherCard key={index} weather={weather} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="CheckSquare" className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-primary-700">Upcoming Tasks</h2>
                </div>
                <Badge variant="primary">{upcomingTasks.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="CheckCircle" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending tasks! Great work!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <motion.div
                      key={task.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                          <ApperIcon name={getTaskIcon(task.type)} className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">Due: {format(new Date(task.dueDate), "MMM dd")}</p>
                        </div>
                      </div>
                      <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="DollarSign" className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-primary-700">Recent Transactions</h2>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="success">+{formatCurrency(totalIncome)}</Badge>
                  <Badge variant="error">-{formatCurrency(totalExpenses)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="PiggyBank" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-gradient-to-br from-secondary-500 to-secondary-600"
                            : "bg-gradient-to-br from-accent-500 to-accent-600"
                        }`}>
                          <ApperIcon name="DollarSign" className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description || transaction.category}</p>
                          <p className="text-sm text-gray-500">{format(new Date(transaction.date), "MMM dd")}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === "income" ? "text-secondary-600" : "text-accent-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;