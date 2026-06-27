const { query } = require('../config/db');

class Machine {
  static async findAll() {
    return await query('SELECT * FROM machines ORDER BY machine_id ASC');
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM machines WHERE machine_id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { machine_id, name, location, status } = data;
    await query(
      'INSERT INTO machines (machine_id, name, location, status) VALUES (?, ?, ?, ?)',
      [machine_id, name, location, status || 'Operational']
    );
    return this.findById(machine_id);
  }

  static async updateStatus(machineId, status) {
    await query(
      'UPDATE machines SET status = ? WHERE machine_id = ?',
      [status, machineId]
    );
    return this.findById(machineId);
  }

  static async getSummary() {
    // Return counts for different machine statuses
    return await query(
      `SELECT status, COUNT(*) as count 
       FROM machines 
       GROUP BY status`
    );
  }
}

module.exports = Machine;
