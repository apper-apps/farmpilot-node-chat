import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = () => {
const navigationItems = [
{ name: "Dashboard", href: "/", icon: "LayoutDashboard" },
{ name: "Farms", href: "/farms", icon: "MapPin" },
{ name: "Crops", href: "/crops", icon: "Sprout" },
{ name: "Tasks", href: "/tasks", icon: "CheckSquare" },
{ name: "Equipment", href: "/equipment", icon: "Wrench" },
{ name: "Finance", href: "/finance", icon: "DollarSign" },
{ name: "Weather", href: "/weather", icon: "Cloud" },
];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
            <ApperIcon name="Sprout" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-700">FarmPilot</h1>
            <p className="text-sm text-gray-500">Agriculture Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-600 hover:bg-surface hover:text-primary-600 hover:transform hover:scale-[1.02]"
              }`
            }
          >
            <ApperIcon name={item.icon} className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gradient-to-br from-surface to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="User" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-primary-700">Farm Manager</p>
              <p className="text-sm text-gray-500">Active Session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;