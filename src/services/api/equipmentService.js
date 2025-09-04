import equipmentData from "@/services/mockData/equipment.json";

class EquipmentService {
  constructor() {
    this.equipment = [...equipmentData];
    this.delay = 300;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.equipment];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const equipment = this.equipment.find(e => e.Id === parseInt(id));
    if (!equipment) {
      throw new Error("Equipment not found");
    }
    return { ...equipment };
  }

  async create(equipmentData) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const newId = Math.max(...this.equipment.map(e => e.Id), 0) + 1;
    const newEquipment = {
      Id: newId,
      ...equipmentData,
      createdAt: equipmentData.createdAt || new Date().toISOString()
    };
    
    this.equipment.push(newEquipment);
    return { ...newEquipment };
  }

  async update(id, equipmentData) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.equipment.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Equipment not found");
    }
    
    this.equipment[index] = {
      ...this.equipment[index],
      ...equipmentData,
      Id: parseInt(id)
    };
    
    return { ...this.equipment[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.equipment.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Equipment not found");
    }
    
    this.equipment.splice(index, 1);
    return true;
  }
}

export default new EquipmentService();