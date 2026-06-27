const { query } = require('../config/db');

class Shift {
  static async findAll() {
    return await query('SELECT * FROM shifts ORDER BY id ASC');
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM shifts WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { shift_name, start_time, end_time } = data;
    const result = await query(
      'INSERT INTO shifts (shift_name, start_time, end_time) VALUES (?, ?, ?)',
      [shift_name, start_time, end_time]
    );
    return this.findById(result.insertId);
  }

  static async assignShift(employeeId, shiftId) {
    await query(
      'UPDATE employees SET shift_id = ? WHERE employee_id = ?',
      [shiftId || null, employeeId]
    );
    // Return employee with shift details
    const rows = await query(
      `SELECT e.employee_id, e.name, e.shift_id, s.shift_name, s.start_time, s.end_time 
       FROM employees e 
       LEFT JOIN shifts s ON e.shift_id = s.id 
       WHERE e.employee_id = ?`,
      [employeeId]
    );
    return rows[0];
  }
}

module.exports = Shift;
