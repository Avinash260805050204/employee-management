const { query } = require('../config/db');

class Employee {
  static async findByEmployeeId(employeeId) {
    const rows = await query(
      `SELECT e.*, s.shift_name, s.start_time, s.end_time 
       FROM employees e 
       LEFT JOIN shifts s ON e.shift_id = s.id 
       WHERE e.employee_id = ?`,
      [employeeId]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const rows = await query('SELECT * FROM employees WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create(data) {
    const { employee_id, name, email, phone, department, designation, joining_date, password, role, shift_id } = data;
    await query(
      `INSERT INTO employees (employee_id, name, email, phone, department, designation, joining_date, password, role, shift_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, name, email, phone, department, designation, joining_date, password, role, shift_id || null]
    );
    return this.findByEmployeeId(employee_id);
  }

  static async update(employeeId, data) {
    const { name, email, phone, department, designation, joining_date, role, shift_id } = data;
    await query(
      `UPDATE employees 
       SET name = ?, email = ?, phone = ?, department = ?, designation = ?, joining_date = ?, role = ?, shift_id = ?
       WHERE employee_id = ?`,
      [name, email, phone, department, designation, joining_date, role, shift_id || null, employeeId]
    );
    return this.findByEmployeeId(employeeId);
  }

  static async updatePassword(employeeId, hashedPassword) {
    await query('UPDATE employees SET password = ? WHERE employee_id = ?', [hashedPassword, employeeId]);
  }

  static async delete(employeeId) {
    const result = await query('DELETE FROM employees WHERE employee_id = ?', [employeeId]);
    return result.affectedRows > 0;
  }

  static async findAll({ search = '', department = '', shift_id = '' } = {}) {
    let sql = `
      SELECT e.id, e.employee_id, e.name, e.email, e.phone, e.department, e.designation, e.joining_date, e.role, e.shift_id, s.shift_name 
      FROM employees e
      LEFT JOIN shifts s ON e.shift_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (e.name LIKE ? OR e.employee_id LIKE ? OR e.email LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (department) {
      sql += ' AND e.department = ?';
      params.push(department);
    }

    if (shift_id) {
      sql += ' AND e.shift_id = ?';
      params.push(shift_id);
    }

    sql += ' ORDER BY e.employee_id ASC';

    return await query(sql, params);
  }

  static async getDashboardStats() {
    const totalEmployees = await query('SELECT COUNT(*) as count FROM employees');
    return {
      total: totalEmployees[0].count
    };
  }
}

module.exports = Employee;
