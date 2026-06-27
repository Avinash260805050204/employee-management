const { query } = require('../config/db');

class Maintenance {
  static async findById(id) {
    const rows = await query(
      `SELECT mr.*, m.name as machine_name, m.location, 
              reporter.name as reporter_name, tech.name as technician_name
       FROM maintenance_requests mr
       JOIN machines m ON mr.machine_id = m.machine_id
       JOIN employees reporter ON mr.reported_by = reporter.employee_id
       LEFT JOIN employees tech ON mr.assigned_technician_id = tech.employee_id
       WHERE mr.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async createRequest(data) {
    const { machine_id, issue_title, description, priority, image_url, reported_by } = data;
    const result = await query(
      `INSERT INTO maintenance_requests (machine_id, issue_title, description, priority, image_url, reported_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
      [machine_id, issue_title, description, priority, image_url || null, reported_by]
    );
    
    // Auto-update machine status to 'Under Maintenance' or 'Broken' depending on priority
    const machineStatus = (priority === 'Critical' || priority === 'High') ? 'Broken' : 'Under Maintenance';
    await query('UPDATE machines SET status = ? WHERE machine_id = ?', [machineStatus, machine_id]);

    return this.findById(result.insertId);
  }

  static async findAllRequests({ status = '', priority = '', technician_id = '' } = {}) {
    let sql = `
      SELECT mr.*, m.name as machine_name, m.location, 
             reporter.name as reporter_name, tech.name as technician_name
      FROM maintenance_requests mr
      JOIN machines m ON mr.machine_id = m.machine_id
      JOIN employees reporter ON mr.reported_by = reporter.employee_id
      LEFT JOIN employees tech ON mr.assigned_technician_id = tech.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND mr.status = ?';
      params.push(status);
    }

    if (priority) {
      sql += ' AND mr.priority = ?';
      params.push(priority);
    }

    if (technician_id) {
      sql += ' AND mr.assigned_technician_id = ?';
      params.push(technician_id);
    }

    sql += ' ORDER BY mr.created_at DESC';

    return await query(sql, params);
  }

  static async assignTechnician(id, technicianId) {
    await query(
      'UPDATE maintenance_requests SET assigned_technician_id = ?, status = "In Progress" WHERE id = ?',
      [technicianId, id]
    );
    return this.findById(id);
  }

  static async updateStatus(id, status) {
    await query(
      'UPDATE maintenance_requests SET status = ? WHERE id = ?',
      [status, id]
    );
    
    const request = await this.findById(id);
    if (request && (status === 'Resolved' || status === 'Closed')) {
      // Check if there are other open/in-progress maintenance requests for this machine
      const activeRequests = await query(
        `SELECT COUNT(*) as count 
         FROM maintenance_requests 
         WHERE machine_id = ? AND status IN ('Open', 'In Progress')`,
        [request.machine_id]
      );
      if (activeRequests[0].count === 0) {
        // Mark machine as Operational again
        await query('UPDATE machines SET status = "Operational" WHERE machine_id = ?', [request.machine_id]);
      }
    } else if (request && status === 'In Progress') {
      await query('UPDATE machines SET status = "Under Maintenance" WHERE machine_id = ?', [request.machine_id]);
    }
    
    return request;
  }

  static async getOpenCount() {
    const rows = await query(
      `SELECT COUNT(*) as count 
       FROM maintenance_requests 
       WHERE status IN ('Open', 'In Progress')`
    );
    return rows[0].count;
  }

  static async getMaintenanceAnalytics() {
    return await query(
      `SELECT status, COUNT(*) as count 
       FROM maintenance_requests 
       GROUP BY status`
    );
  }

  static async getPriorityStats() {
    return await query(
      `SELECT priority, COUNT(*) as count 
       FROM maintenance_requests 
       GROUP BY priority`
    );
  }
}

module.exports = Maintenance;
