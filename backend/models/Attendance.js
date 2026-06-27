const { query } = require('../config/db');

class Attendance {
  static async findByDateAndEmployee(employeeId, date) {
    const rows = await query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, date]
    );
    return rows[0] || null;
  }

  static async checkIn(employeeId, date, checkInTime, status = 'Present') {
    await query(
      `INSERT INTO attendance (employee_id, date, check_in, status) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), status = VALUES(status)`,
      [employeeId, date, checkInTime, status]
    );
    return this.findByDateAndEmployee(employeeId, date);
  }

  static async checkOut(employeeId, date, checkOutTime) {
    // We update check_out and compute status if check_in exists.
    // If check_out is filled, we can also calculate whether they fulfilled normal hours, but a simple check-out update is sufficient here.
    await query(
      `UPDATE attendance 
       SET check_out = ? 
       WHERE employee_id = ? AND date = ?`,
      [checkOutTime, employeeId, date]
    );
    return this.findByDateAndEmployee(employeeId, date);
  }

  static async findHistory(employeeId) {
    return await query(
      `SELECT a.*, s.shift_name, s.start_time, s.end_time
       FROM attendance a
       LEFT JOIN employees e ON a.employee_id = e.employee_id
       LEFT JOIN shifts s ON e.shift_id = s.id
       WHERE a.employee_id = ? 
       ORDER BY a.date DESC`,
      [employeeId]
    );
  }

  static async findAllRecords({ date, department } = {}) {
    let sql = `
      SELECT a.*, e.name, e.department, e.designation, s.shift_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN shifts s ON e.shift_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }

    if (department) {
      sql += ' AND e.department = ?';
      params.push(department);
    }

    sql += ' ORDER BY a.date DESC, e.employee_id ASC';

    return await query(sql, params);
  }

  static async getMonthlyReport(employeeId, year, month) {
    // Return all records for a specific employee in a specific month/year
    const datePattern = `${year}-${String(month).padStart(2, '0')}-%`;
    return await query(
      `SELECT * FROM attendance 
       WHERE employee_id = ? AND date LIKE ? 
       ORDER BY date ASC`,
      [employeeId, datePattern]
    );
  }

  static async getMonthlySummary(year, month) {
    // Return aggregate counts of present/absent/late per employee for a month
    const datePattern = `${year}-${String(month).padStart(2, '0')}-%`;
    return await query(
      `SELECT 
         a.employee_id, 
         e.name, 
         e.department,
         SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
         SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late_count,
         SUM(CASE WHEN a.status = 'Half Day' THEN 1 ELSE 0 END) as half_day_count,
         SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count
       FROM attendance a
       JOIN employees e ON a.employee_id = e.employee_id
       WHERE a.date LIKE ?
       GROUP BY a.employee_id, e.name, e.department`,
      [datePattern]
    );
  }

  static async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const rows = await query(
      `SELECT COUNT(*) as count 
       FROM attendance 
       WHERE date = ? AND status IN ('Present', 'Late', 'Half Day')`,
      [today]
    );
    return rows[0].count;
  }

  static async getAttendanceAnalytics(days = 7) {
    // Returns daily attendance count for the last N days
    return await query(
      `SELECT date, 
              SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) as present,
              SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
              SUM(CASE WHEN status = 'Half Day' THEN 1 ELSE 0 END) as half_day
       FROM attendance 
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY date 
       ORDER BY date ASC`,
      [days]
    );
  }
}

module.exports = Attendance;
