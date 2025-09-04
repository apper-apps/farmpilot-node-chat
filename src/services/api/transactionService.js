import transactionsData from "@/services/mockData/transactions.json";
class TransactionService {
  constructor() {
    this.transactions = [...transactionsData];
    this.delay = 300;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.transactions];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const transaction = this.transactions.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

  async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const newId = Math.max(...this.transactions.map(t => t.Id), 0) + 1;
    const newTransaction = {
      Id: newId,
      ...transactionData
    };
    
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, transactionData) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionData,
      Id: parseInt(id)
    };
    
    return { ...this.transactions[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    
    this.transactions.splice(index, 1);
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