class ActivityService {
  constructor() {
    this.tableName = 'activity_c';
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
        { field: { Name: "type_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "date_c" } },
        { field: { Name: "user_id_c" } },
        { field: { Name: "farm_id_c" } },
        { field: { Name: "crop_id_c" } },
        { field: { Name: "equipment_id_c" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } }
      ],
      orderBy: [
        {
          fieldName: "date_c",
          sorttype: "DESC"
        }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(activity => ({
      Id: activity.Id,
      name: activity.Name || '',
      type: activity.type_c || '',
      description: activity.description_c || '',
      date: activity.date_c || new Date().toISOString(),
      userId: activity.user_id_c?.Id || activity.user_id_c || null,
      farmId: activity.farm_id_c?.Id || activity.farm_id_c || null,
      farmName: activity.farm_id_c?.Name || '',
      cropId: activity.crop_id_c?.Id || activity.crop_id_c || null,
      cropName: activity.crop_id_c?.Name || '',
      equipmentId: activity.equipment_id_c?.Id || activity.equipment_id_c || null,
      equipmentName: activity.equipment_id_c?.Name || '',
      createdOn: activity.CreatedOn || new Date().toISOString(),
      createdBy: activity.CreatedBy?.Name || ''
    }));
  }

  async getById(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "type_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "date_c" } },
        { field: { Name: "user_id_c" } },
        { field: { Name: "farm_id_c" } },
        { field: { Name: "crop_id_c" } },
        { field: { Name: "equipment_id_c" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, id, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error('Activity not found');
    }

    const activity = response.data;
    return {
      Id: activity.Id,
      name: activity.Name || '',
      type: activity.type_c || '',
      description: activity.description_c || '',
      date: activity.date_c || new Date().toISOString(),
      userId: activity.user_id_c?.Id || activity.user_id_c || null,
      farmId: activity.farm_id_c?.Id || activity.farm_id_c || null,
      cropId: activity.crop_id_c?.Id || activity.crop_id_c || null,
      equipmentId: activity.equipment_id_c?.Id || activity.equipment_id_c || null
    };
  }

  async create(activityData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Name: activityData.name,
        type_c: activityData.type,
        description_c: activityData.description,
        date_c: activityData.date,
        user_id_c: activityData.userId ? parseInt(activityData.userId) : null,
        farm_id_c: activityData.farmId ? parseInt(activityData.farmId) : null,
        crop_id_c: activityData.cropId ? parseInt(activityData.cropId) : null,
        equipment_id_c: activityData.equipmentId ? parseInt(activityData.equipmentId) : null
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const activity = result.data;
        return {
          Id: activity.Id,
          name: activity.Name || '',
          type: activity.type_c || '',
          description: activity.description_c || '',
          date: activity.date_c || new Date().toISOString(),
          userId: activity.user_id_c?.Id || activity.user_id_c || null,
          farmId: activity.farm_id_c?.Id || activity.farm_id_c || null,
          cropId: activity.crop_id_c?.Id || activity.crop_id_c || null,
          equipmentId: activity.equipment_id_c?.Id || activity.equipment_id_c || null
        };
      } else {
        throw new Error(result.message || 'Failed to create activity');
      }
    }
    
    throw new Error('Failed to create activity');
  }

  async update(id, activityData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: activityData.name,
        type_c: activityData.type,
        description_c: activityData.description,
        date_c: activityData.date,
        user_id_c: activityData.userId ? parseInt(activityData.userId) : null,
        farm_id_c: activityData.farmId ? parseInt(activityData.farmId) : null,
        crop_id_c: activityData.cropId ? parseInt(activityData.cropId) : null,
        equipment_id_c: activityData.equipmentId ? parseInt(activityData.equipmentId) : null
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update activity');
      }
    }
    
    throw new Error('Failed to update activity');
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

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete activity');
      }
    }

    return true;
  }
}

export default new ActivityService();