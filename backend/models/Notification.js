const { query } = require('../config/db');

class Notification {
  static async create(employeeId, title, message, type) {
    const result = await query(
      `INSERT INTO notifications (employee_id, title, message, type, is_read) 
       VALUES (?, ?, ?, ?, FALSE)`,
      [employeeId, title, message, type]
    );
    // Find the newly created notification
    const rows = await query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async findForEmployee(employeeId) {
    return await query(
      'SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC LIMIT 50',
      [employeeId]
    );
  }

  static async markAsRead(id) {
    await query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    const rows = await query('SELECT * FROM notifications WHERE id = ?', [id]);
    return rows[0];
  }

  static async markAllAsRead(employeeId) {
    await query('UPDATE notifications SET is_read = TRUE WHERE employee_id = ?', [employeeId]);
    return this.findForEmployee(employeeId);
  }
}

module.exports = Notification;
