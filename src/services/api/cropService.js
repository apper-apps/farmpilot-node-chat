class CropService {
  constructor() {
    this.tableName = 'crop_c';
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
        { field: { Name: "crop_type_c" } },
        { field: { Name: "field_c" } },
        { field: { Name: "planting_date_c" } },
        { field: { Name: "expected_harvest_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "farm_id_c" } }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(crop => ({
      Id: crop.Id,
      cropType: crop.crop_type_c || '',
      field: crop.field_c || '',
      plantingDate: crop.planting_date_c || new Date().toISOString(),
      expectedHarvest: crop.expected_harvest_c || new Date().toISOString(),
      status: crop.status_c || 'Planned',
      notes: crop.notes_c || '',
      farmId: crop.farm_id_c?.Id || crop.farm_id_c || null
    }));
  }

  async getById(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "crop_type_c" } },
        { field: { Name: "field_c" } },
        { field: { Name: "planting_date_c" } },
        { field: { Name: "expected_harvest_c" } },
        { field: { Name: "status_c" } },
        { field: { Name: "notes_c" } },
        { field: { Name: "farm_id_c" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, id, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    const crop = response.data;
    return {
      Id: crop.Id,
      cropType: crop.crop_type_c || '',
      field: crop.field_c || '',
      plantingDate: crop.planting_date_c || new Date().toISOString(),
      expectedHarvest: crop.expected_harvest_c || new Date().toISOString(),
      status: crop.status_c || 'Planned',
      notes: crop.notes_c || '',
      farmId: crop.farm_id_c?.Id || crop.farm_id_c || null
    };
  }

  async create(cropData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Name: cropData.cropType,
        crop_type_c: cropData.cropType,
        field_c: cropData.field,
        planting_date_c: cropData.plantingDate,
        expected_harvest_c: cropData.expectedHarvest,
        status_c: cropData.status,
        notes_c: cropData.notes || '',
        farm_id_c: parseInt(cropData.farmId)
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const crop = result.data;
        return {
          Id: crop.Id,
          cropType: crop.crop_type_c || '',
          field: crop.field_c || '',
          plantingDate: crop.planting_date_c || new Date().toISOString(),
          expectedHarvest: crop.expected_harvest_c || new Date().toISOString(),
          status: crop.status_c || 'Planned',
          notes: crop.notes_c || '',
          farmId: crop.farm_id_c?.Id || crop.farm_id_c || null
        };
      }
    }
    
    throw new Error('Failed to create crop');
  }

  async update(id, cropData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: cropData.cropType,
        crop_type_c: cropData.cropType,
        field_c: cropData.field,
        planting_date_c: cropData.plantingDate,
        expected_harvest_c: cropData.expectedHarvest,
        status_c: cropData.status,
        notes_c: cropData.notes || '',
        farm_id_c: parseInt(cropData.farmId)
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const crop = result.data;
        return {
          Id: crop.Id,
          cropType: crop.crop_type_c || '',
          field: crop.field_c || '',
          plantingDate: crop.planting_date_c || new Date().toISOString(),
          expectedHarvest: crop.expected_harvest_c || new Date().toISOString(),
          status: crop.status_c || 'Planned',
          notes: crop.notes_c || '',
          farmId: crop.farm_id_c?.Id || crop.farm_id_c || null
        };
      }
    }
    
    throw new Error('Failed to update crop');
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

export default new CropService();

export default new CropService();