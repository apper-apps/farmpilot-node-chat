class EquipmentService {
  constructor() {
    this.tableName = 'equipment_c';
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "name_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "brand_c" } },
        { field: { Name: "model_c" } },
        { field: { Name: "year_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "purchase_price_c" } },
        { field: { Name: "current_value_c" } },
        { field: { Name: "maintenance_schedule_c" } },
        { field: { Name: "last_maintenance_c" } },
        { field: { Name: "next_maintenance_c" } },
        { field: { Name: "operating_hours_c" } },
        { field: { Name: "fuel_type_c" } },
        { field: { Name: "specifications_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "farm_id_c" } }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(equipment => ({
      Id: equipment.Id,
      name: equipment.name_c || equipment.Name,
      type: equipment.type_c || '',
      brand: equipment.brand_c || '',
      model: equipment.model_c || '',
      year: parseInt(equipment.year_c) || new Date().getFullYear(),
      status: equipment.status_c || 'Active',
      farmId: equipment.farm_id_c?.Id || equipment.farm_id_c || null,
      purchasePrice: parseFloat(equipment.purchase_price_c) || null,
      currentValue: parseFloat(equipment.current_value_c) || null,
      maintenanceSchedule: equipment.maintenance_schedule_c || '',
      lastMaintenance: equipment.last_maintenance_c || null,
      nextMaintenance: equipment.next_maintenance_c || null,
      operatingHours: parseInt(equipment.operating_hours_c) || 0,
      fuelType: equipment.fuel_type_c || 'Diesel',
      specifications: equipment.specifications_c || '',
      createdAt: equipment.created_at_c || new Date().toISOString()
    }));
  }

  async getById(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "name_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "brand_c" } },
        { field: { Name: "model_c" } },
        { field: { Name: "year_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "purchase_price_c" } },
        { field: { Name: "current_value_c" } },
        { field: { Name: "maintenance_schedule_c" } },
        { field: { Name: "last_maintenance_c" } },
        { field: { Name: "next_maintenance_c" } },
        { field: { Name: "operating_hours_c" } },
        { field: { Name: "fuel_type_c" } },
        { field: { Name: "specifications_c" } },
        { field: { Name: "created_at_c" } },
        { field: { Name: "farm_id_c" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, id, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    const equipment = response.data;
    return {
      Id: equipment.Id,
      name: equipment.name_c || equipment.Name,
      type: equipment.type_c || '',
      brand: equipment.brand_c || '',
      model: equipment.model_c || '',
      year: parseInt(equipment.year_c) || new Date().getFullYear(),
      status: equipment.status_c || 'Active',
      farmId: equipment.farm_id_c?.Id || equipment.farm_id_c || null,
      purchasePrice: parseFloat(equipment.purchase_price_c) || null,
      currentValue: parseFloat(equipment.current_value_c) || null,
      maintenanceSchedule: equipment.maintenance_schedule_c || '',
      lastMaintenance: equipment.last_maintenance_c || null,
      nextMaintenance: equipment.next_maintenance_c || null,
      operatingHours: parseInt(equipment.operating_hours_c) || 0,
      fuelType: equipment.fuel_type_c || 'Diesel',
      specifications: equipment.specifications_c || '',
      createdAt: equipment.created_at_c || new Date().toISOString()
    };
  }

  async create(equipmentData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Name: equipmentData.name,
        name_c: equipmentData.name,
        type_c: equipmentData.type,
        brand_c: equipmentData.brand,
        model_c: equipmentData.model,
        year_c: parseInt(equipmentData.year),
        status_c: equipmentData.status,
        farm_id_c: equipmentData.farmId ? parseInt(equipmentData.farmId) : null,
        purchase_price_c: equipmentData.purchasePrice ? parseFloat(equipmentData.purchasePrice) : null,
        current_value_c: equipmentData.currentValue ? parseFloat(equipmentData.currentValue) : null,
        maintenance_schedule_c: equipmentData.maintenanceSchedule || '',
        operating_hours_c: equipmentData.operatingHours ? parseInt(equipmentData.operatingHours) : 0,
        fuel_type_c: equipmentData.fuelType || 'Diesel',
        specifications_c: equipmentData.specifications || '',
        created_at_c: equipmentData.createdAt || new Date().toISOString()
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const equipment = result.data;
        return {
          Id: equipment.Id,
          name: equipment.name_c || equipment.Name,
          type: equipment.type_c || '',
          brand: equipment.brand_c || '',
          model: equipment.model_c || '',
          year: parseInt(equipment.year_c) || new Date().getFullYear(),
          status: equipment.status_c || 'Active',
          farmId: equipment.farm_id_c?.Id || equipment.farm_id_c || null,
          purchasePrice: parseFloat(equipment.purchase_price_c) || null,
          currentValue: parseFloat(equipment.current_value_c) || null,
          maintenanceSchedule: equipment.maintenance_schedule_c || '',
          lastMaintenance: equipment.last_maintenance_c || null,
          nextMaintenance: equipment.next_maintenance_c || null,
          operatingHours: parseInt(equipment.operating_hours_c) || 0,
          fuelType: equipment.fuel_type_c || 'Diesel',
          specifications: equipment.specifications_c || '',
          createdAt: equipment.created_at_c || new Date().toISOString()
        };
      }
    }
    
    throw new Error('Failed to create equipment');
  }

  async update(id, equipmentData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: equipmentData.name,
        name_c: equipmentData.name,
        type_c: equipmentData.type,
        brand_c: equipmentData.brand,
        model_c: equipmentData.model,
        year_c: parseInt(equipmentData.year),
        status_c: equipmentData.status,
        farm_id_c: equipmentData.farmId ? parseInt(equipmentData.farmId) : null,
        purchase_price_c: equipmentData.purchasePrice ? parseFloat(equipmentData.purchasePrice) : null,
        current_value_c: equipmentData.currentValue ? parseFloat(equipmentData.currentValue) : null,
        maintenance_schedule_c: equipmentData.maintenanceSchedule || '',
        operating_hours_c: equipmentData.operatingHours ? parseInt(equipmentData.operatingHours) : 0,
        fuel_type_c: equipmentData.fuelType || 'Diesel',
        specifications_c: equipmentData.specifications || ''
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const equipment = result.data;
        return {
          Id: equipment.Id,
          name: equipment.name_c || equipment.Name,
          type: equipment.type_c || '',
          brand: equipment.brand_c || '',
          model: equipment.model_c || '',
          year: parseInt(equipment.year_c) || new Date().getFullYear(),
          status: equipment.status_c || 'Active',
          farmId: equipment.farm_id_c?.Id || equipment.farm_id_c || null,
          purchasePrice: parseFloat(equipment.purchase_price_c) || null,
          currentValue: parseFloat(equipment.current_value_c) || null,
          maintenanceSchedule: equipment.maintenance_schedule_c || '',
          lastMaintenance: equipment.last_maintenance_c || null,
          nextMaintenance: equipment.next_maintenance_c || null,
          operatingHours: parseInt(equipment.operating_hours_c) || 0,
          fuelType: equipment.fuel_type_c || 'Diesel',
          specifications: equipment.specifications_c || '',
          createdAt: equipment.created_at_c || new Date().toISOString()
        };
      }
    }
    
    throw new Error('Failed to update equipment');
  }

  async delete(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await this.apperClient.deleteRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return true;
  }
}

export default new EquipmentService();
export default new EquipmentService();