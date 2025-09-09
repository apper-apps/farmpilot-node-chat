class TransactionService {
  constructor() {
    this.tableName = 'transaction_c';
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
        { field: { Name: "category_c" } },
        { field: { Name: "amount_c" } },
        { field: { Name: "date_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "farm_id_c" } }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(transaction => ({
      Id: transaction.Id,
      type: transaction.type_c || 'expense',
      category: transaction.category_c || '',
      amount: parseFloat(transaction.amount_c) || 0,
      date: transaction.date_c || new Date().toISOString(),
      description: transaction.description_c || '',
      farmId: transaction.farm_id_c?.Id || transaction.farm_id_c || null
    }));
  }

  async getById(id) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "type_c" } },
        { field: { Name: "category_c" } },
        { field: { Name: "amount_c" } },
        { field: { Name: "date_c" } },
        { field: { Name: "description_c" } },
        { field: { Name: "farm_id_c" } }
      ]
    };

    const response = await this.apperClient.getRecordById(this.tableName, id, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    const transaction = response.data;
    return {
      Id: transaction.Id,
      type: transaction.type_c || 'expense',
      category: transaction.category_c || '',
      amount: parseFloat(transaction.amount_c) || 0,
      date: transaction.date_c || new Date().toISOString(),
      description: transaction.description_c || '',
      farmId: transaction.farm_id_c?.Id || transaction.farm_id_c || null
    };
  }

  async create(transactionData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Name: `${transactionData.type} - ${transactionData.category}`,
        type_c: transactionData.type,
        category_c: transactionData.category,
        amount_c: parseFloat(transactionData.amount),
        date_c: transactionData.date,
        description_c: transactionData.description || '',
        farm_id_c: parseInt(transactionData.farmId)
      }]
    };

    const response = await this.apperClient.createRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const transaction = result.data;
        return {
          Id: transaction.Id,
          type: transaction.type_c || 'expense',
          category: transaction.category_c || '',
          amount: parseFloat(transaction.amount_c) || 0,
          date: transaction.date_c || new Date().toISOString(),
          description: transaction.description_c || '',
          farmId: transaction.farm_id_c?.Id || transaction.farm_id_c || null
        };
      }
    }
    
    throw new Error('Failed to create transaction');
  }

  async update(id, transactionData) {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      records: [{
        Id: parseInt(id),
        Name: `${transactionData.type} - ${transactionData.category}`,
        type_c: transactionData.type,
        category_c: transactionData.category,
        amount_c: parseFloat(transactionData.amount),
        date_c: transactionData.date,
        description_c: transactionData.description || '',
        farm_id_c: parseInt(transactionData.farmId)
      }]
    };

    const response = await this.apperClient.updateRecord(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    if (response.results && response.results.length > 0) {
      const result = response.results[0];
      if (result.success) {
        const transaction = result.data;
        return {
          Id: transaction.Id,
          type: transaction.type_c || 'expense',
          category: transaction.category_c || '',
          amount: parseFloat(transaction.amount_c) || 0,
          date: transaction.date_c || new Date().toISOString(),
          description: transaction.description_c || '',
          farmId: transaction.farm_id_c?.Id || transaction.farm_id_c || null
        };
      }
    }
    
    throw new Error('Failed to update transaction');
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

  async exportData(startDate, endDate) {
    const allTransactions = await this.getAll();
    
    if (!startDate && !endDate) {
      return allTransactions;
    }
    
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && transactionDate < start) return false;
      if (end && transactionDate > end) return false;
      
      return true;
    });
  }
}

export default new TransactionService();