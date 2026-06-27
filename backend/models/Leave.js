const { query } = require('../config/db');

class Leave {
  static async findById(id) {
    const rows = await query('SELECT * FROM leaves WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async apply(data) {
    const { employee_id, leave_type, start_date, end_date, reason } = data;
    const result = await query(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) 
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [employee_id, leave_type, start_date, end_date, reason]
    );
    return this.findById(result.insertId);
  }

  static async findHistory(employeeId) {
    return await query(
      `SELECT l.*, e.name as approved_by_name
       FROM leaves l
       LEFT JOIN employees e ON l.approved_by = e.employee_id
       WHERE l.employee_id = ?
       ORDER BY l.created_at DESC`,
      [employeeId]
    );
  }

  static async findPending() {
    return await query(
      `SELECT l.*, e.name, e.department, e.designation
       FROM leaves l
       JOIN employees e ON l.employee_id = e.employee_id
       WHERE l.status = 'Pending'
       ORDER BY l.created_at ASC`
    );
  }

  static async findAll() {
    return await query(
      `SELECT l.*, e.name, e.department, e.designation, admin.name as approved_by_name
       FROM leaves l
       JOIN employees e ON l.employee_id = e.employee_id
       LEFT JOIN employees admin ON l.approved_by = admin.employee_id
       ORDER BY l.created_at DESC`
    );
  }

  static async updateStatus(id, status, approvedBy) {
    await query(
      'UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?',
      [status, approvedBy, id]
    );
    return this.findById(id);
  }

  static async getPendingCount() {
    const rows = await query("SELECT COUNT(*) as count FROM leaves WHERE status = 'Pending'");
    return rows[0].count;
  }

  static async getLeaveAnalytics() {
    // Return count of leaves by status
    return await query(
      `SELECT status, COUNT(*) as count 
       FROM leaves 
       GROUP BY status`
    );
  }

  static async getLeaveTypeStats() {
    // Return count of leaves by leave type
    return await query(
      `SELECT leave_type, COUNT(*) as count 
       FROM leaves 
       GROUP BY leave_type`
    );
  }
}

module.exports = Leave;
