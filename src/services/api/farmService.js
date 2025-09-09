class FarmService {
  constructor() {
    this.tableName = 'farm_c';
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
        { field: { Name: "size_c" } },
        { field: { Name: "size_unit_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "created_at_c" } }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(farm => ({
      Id: farm.Id,
      name: farm.name_c || farm.Name,
      size: parseFloat(farm.size_c) || 0,
      sizeUnit: farm.size_unit_c || 'acres',
      location: farm.location_c || '',
      createdAt: farm.created_at_c || new Date().toISOString()
    }));
  }

  async getById(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "name_c" } },
        { field: { Name: "size_c" } },
        { field: { Name: "size_unit_c" } },
        { field: { Name: "location_c" } },
        { field: { Name: "created_at_c" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, id, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    const farm = response.data;
    return {
      Id: farm.Id,
      name: farm.name_c || farm.Name,
      size: parseFloat(farm.size_c) || 0,
      sizeUnit: farm.size_unit_c || 'acres',
      location: farm.location_c || '',
      createdAt: farm.created_at_c || new Date().toISOString()
    };
  }

  async create(farmData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Name: farmData.name,
        name_c: farmData.name,
        size_c: parseFloat(farmData.size),
        size_unit_c: farmData.sizeUnit,
        location_c: farmData.location,
        created_at_c: farmData.createdAt || new Date().toISOString()
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const farm = result.data;
        return {
          Id: farm.Id,
          name: farm.name_c || farm.Name,
          size: parseFloat(farm.size_c) || 0,
          sizeUnit: farm.size_unit_c || 'acres',
          location: farm.location_c || '',
          createdAt: farm.created_at_c || new Date().toISOString()
        };
      }
    }
    
    throw new Error('Failed to create farm');
  }

  async update(id, farmData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: farmData.name,
        name_c: farmData.name,
        size_c: parseFloat(farmData.size),
        size_unit_c: farmData.sizeUnit,
        location_c: farmData.location
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const farm = result.data;
        return {
          Id: farm.Id,
          name: farm.name_c || farm.Name,
          size: parseFloat(farm.size_c) || 0,
          sizeUnit: farm.size_unit_c || 'acres',
          location: farm.location_c || '',
          createdAt: farm.created_at_c || new Date().toISOString()
        };
      }
    }
    
    throw new Error('Failed to update farm');
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

export default new FarmService();
export default new FarmService();