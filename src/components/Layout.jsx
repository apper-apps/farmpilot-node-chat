import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ApperIcon name="Menu" className="h-6 w-6 text-primary-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
<ApperIcon name="Sprout" className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-primary-700">FarmPilot</h1>
              </div>
            </div>
            <button
onClick={() => {
                const authContext = useContext(AuthContext);
                const logout = authContext?.logout;
                logout?.();
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="LogOut" className="h-6 w-6 text-primary-600" />
</button>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;