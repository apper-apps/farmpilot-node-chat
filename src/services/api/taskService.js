class TaskService {
  constructor() {
    this.tableName = 'task_c';
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
        { field: { Name: "title_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "due_date_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "completed_c" } },
        { field: { Name: "completed_date_c" } },
        { field: { Name: "farm_id_c" } },
        { field: { Name: "crop_id_c" } }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(task => ({
      Id: task.Id,
      title: task.title_c || task.Name,
      type: task.type_c || '',
      dueDate: task.due_date_c || new Date().toISOString(),
      priority: task.priority_c || 'Medium',
      completed: task.completed_c || false,
      completedDate: task.completed_date_c || null,
      farmId: task.farm_id_c?.Id || task.farm_id_c || null,
      cropId: task.crop_id_c?.Id || task.crop_id_c || null
    }));
  }

  async getById(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "title_c" } },
        { field: { Name: "type_c" } },
        { field: { Name: "due_date_c" } },
        { field: { Name: "priority_c" } },
        { field: { Name: "completed_c" } },
        { field: { Name: "completed_date_c" } },
        { field: { Name: "farm_id_c" } },
        { field: { Name: "crop_id_c" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, id, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    const task = response.data;
    return {
      Id: task.Id,
      title: task.title_c || task.Name,
      type: task.type_c || '',
      dueDate: task.due_date_c || new Date().toISOString(),
      priority: task.priority_c || 'Medium',
      completed: task.completed_c || false,
      completedDate: task.completed_date_c || null,
      farmId: task.farm_id_c?.Id || task.farm_id_c || null,
      cropId: task.crop_id_c?.Id || task.crop_id_c || null
    };
  }

  async create(taskData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Name: taskData.title,
        title_c: taskData.title,
        type_c: taskData.type,
        due_date_c: taskData.dueDate,
        priority_c: taskData.priority,
        completed_c: taskData.completed || false,
        completed_date_c: taskData.completedDate || null,
        farm_id_c: parseInt(taskData.farmId),
        crop_id_c: taskData.cropId ? parseInt(taskData.cropId) : null
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const task = result.data;
        return {
          Id: task.Id,
          title: task.title_c || task.Name,
          type: task.type_c || '',
          dueDate: task.due_date_c || new Date().toISOString(),
          priority: task.priority_c || 'Medium',
          completed: task.completed_c || false,
          completedDate: task.completed_date_c || null,
          farmId: task.farm_id_c?.Id || task.farm_id_c || null,
          cropId: task.crop_id_c?.Id || task.crop_id_c || null
        };
      }
    }
    
    throw new Error('Failed to create task');
  }

  async update(id, taskData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: taskData.title,
        title_c: taskData.title,
        type_c: taskData.type,
        due_date_c: taskData.dueDate,
        priority_c: taskData.priority,
        completed_c: taskData.completed,
        completed_date_c: taskData.completedDate,
        farm_id_c: parseInt(taskData.farmId),
        crop_id_c: taskData.cropId ? parseInt(taskData.cropId) : null
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const task = result.data;
        return {
          Id: task.Id,
          title: task.title_c || task.Name,
          type: task.type_c || '',
          dueDate: task.due_date_c || new Date().toISOString(),
          priority: task.priority_c || 'Medium',
          completed: task.completed_c || false,
          completedDate: task.completed_date_c || null,
          farmId: task.farm_id_c?.Id || task.farm_id_c || null,
          cropId: task.crop_id_c?.Id || task.crop_id_c || null
        };
      }
    }
    
    throw new Error('Failed to update task');
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

export default new TaskService();