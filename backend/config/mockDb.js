const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (table) => path.join(DATA_DIR, `${table}.json`);

const loadTable = (table) => {
  const filePath = getFilePath(table);
  if (!fs.existsSync(filePath)) {
    // Return seed defaults
    if (table === 'shifts') {
      return [
        { id: 1, shift_name: 'Morning Shift', start_time: '06:00:00', end_time: '14:00:00' },
        { id: 2, shift_name: 'Afternoon Shift', start_time: '14:00:00', end_time: '22:00:00' },
        { id: 3, shift_name: 'Night Shift', start_time: '22:00:00', end_time: '06:00:00' }
      ];
    }
    if (table === 'machines') {
      return [
        { machine_id: 'BLAST-FURNACE-01', name: 'Blast Furnace #1', location: 'Shop Floor A', status: 'Operational' },
        { machine_id: 'ROLLING-MILL-02', name: 'Hot Rolling Mill #2', location: 'Shop Floor B', status: 'Operational' },
        { machine_id: 'CASTING-03', name: 'Continuous Casting Machine #3', location: 'Shop Floor C', status: 'Operational' },
        { machine_id: 'OXYGEN-CONV-04', name: 'Basic Oxygen Converter #4', location: 'Shop Floor A', status: 'Operational' }
      ];
    }
    if (table === 'employees') {
      const adminPass = bcrypt.hashSync('admin123', 10);
      const techPass = bcrypt.hashSync('tech123', 10);
      const empPass = bcrypt.hashSync('emp123', 10);
      return [
        { id: 1, employee_id: 'EMP001', name: 'System Admin', email: 'admin@steelplant.com', phone: '9876543210', department: 'Management', designation: 'System Administrator', joining_date: '2026-01-01', password: adminPass, role: 'Admin', shift_id: 1, created_at: new Date().toISOString() },
        { id: 2, employee_id: 'EMP002', name: 'John Mechanic', email: 'john@steelplant.com', phone: '9876543211', department: 'Maintenance', designation: 'Technician', joining_date: '2026-01-01', password: techPass, role: 'Technician', shift_id: 1, created_at: new Date().toISOString() },
        { id: 3, employee_id: 'EMP003', name: 'Alice Operator', email: 'alice@steelplant.com', phone: '9876543212', department: 'Production', designation: 'Control Room Operator', joining_date: '2026-01-01', password: empPass, role: 'Employee', shift_id: 1, created_at: new Date().toISOString() }
      ];
    }
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const saveTable = (table, data) => {
  fs.writeFileSync(getFilePath(table), JSON.stringify(data, null, 2), 'utf8');
};

const executeMockQuery = async (sql, params = []) => {
  const normalized = sql.replace(/\s+/g, ' ').trim();
  
  // -------------------------------------------------------------
  // SHIFTS QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('SELECT * FROM shifts ORDER BY id ASC') || normalized.startsWith('SELECT * FROM shifts')) {
    return loadTable('shifts');
  }
  
  if (normalized.startsWith('SELECT * FROM shifts WHERE id = ?')) {
    const shifts = loadTable('shifts');
    return [shifts.find(s => s.id == params[0]) || null];
  }
  
  if (normalized.startsWith('INSERT INTO shifts')) {
    const shifts = loadTable('shifts');
    const newId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) + 1 : 1;
    const newShift = { id: newId, shift_name: params[0], start_time: params[1], end_time: params[2] };
    shifts.push(newShift);
    saveTable('shifts', shifts);
    return { insertId: newId };
  }

  // -------------------------------------------------------------
  // EMPLOYEES QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('SELECT e.*, s.shift_name, s.start_time, s.end_time FROM employees e LEFT JOIN shifts s ON e.shift_id = s.id WHERE e.employee_id = ?')) {
    const employees = loadTable('employees');
    const shifts = loadTable('shifts');
    const emp = employees.find(e => e.employee_id === params[0]);
    if (!emp) return [];
    const shift = shifts.find(s => s.id == emp.shift_id);
    return [{
      ...emp,
      shift_name: shift ? shift.shift_name : null,
      start_time: shift ? shift.start_time : null,
      end_time: shift ? shift.end_time : null
    }];
  }

  if (normalized.startsWith('SELECT * FROM employees WHERE email = ?')) {
    const employees = loadTable('employees');
    return [employees.find(e => e.email === params[0]) || null];
  }

  if (normalized.startsWith('INSERT INTO employees')) {
    const employees = loadTable('employees');
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmp = {
      id: newId,
      employee_id: params[0],
      name: params[1],
      email: params[2],
      phone: params[3],
      department: params[4],
      designation: params[5],
      joining_date: params[6],
      password: params[7],
      role: params[8],
      shift_id: params[9] ? Number(params[9]) : null,
      created_at: new Date().toISOString()
    };
    employees.push(newEmp);
    saveTable('employees', employees);
    return { insertId: newId };
  }

  if (normalized.startsWith('UPDATE employees SET name = ?')) {
    const employees = loadTable('employees');
    const empIdx = employees.findIndex(e => e.employee_id === params[8]);
    if (empIdx !== -1) {
      employees[empIdx] = {
        ...employees[empIdx],
        name: params[0],
        email: params[1],
        phone: params[2],
        department: params[3],
        designation: params[4],
        joining_date: params[5],
        role: params[6],
        shift_id: params[7] ? Number(params[7]) : null
      };
      saveTable('employees', employees);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('UPDATE employees SET password = ? WHERE employee_id = ?')) {
    const employees = loadTable('employees');
    const empIdx = employees.findIndex(e => e.employee_id === params[1]);
    if (empIdx !== -1) {
      employees[empIdx].password = params[0];
      saveTable('employees', employees);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('UPDATE employees SET shift_id = ? WHERE employee_id = ?')) {
    const employees = loadTable('employees');
    const empIdx = employees.findIndex(e => e.employee_id === params[1]);
    if (empIdx !== -1) {
      employees[empIdx].shift_id = params[0] ? Number(params[0]) : null;
      saveTable('employees', employees);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('DELETE FROM employees WHERE employee_id = ?')) {
    let employees = loadTable('employees');
    const originalLen = employees.length;
    employees = employees.filter(e => e.employee_id !== params[0]);
    saveTable('employees', employees);
    return { affectedRows: originalLen - employees.length };
  }

  if (normalized.includes('FROM employees e LEFT JOIN shifts s ON e.shift_id = s.id WHERE 1=1')) {
    const employees = loadTable('employees');
    const shifts = loadTable('shifts');
    // Map with shift details
    let list = employees.map(e => {
      const shift = shifts.find(s => s.id == e.shift_id);
      return {
        ...e,
        shift_name: shift ? shift.shift_name : null,
        start_time: shift ? shift.start_time : null,
        end_time: shift ? shift.end_time : null
      };
    });

    // Check filters
    // search
    let searchVal = '';
    let deptVal = '';
    let shiftVal = '';

    // Simple heuristic parser for query parameters
    let paramIdx = 0;
    if (normalized.includes('AND (e.name LIKE ?')) {
      const searchWild = params[paramIdx]; // e.g. %alice%
      searchVal = searchWild ? searchWild.replace(/%/g, '').toLowerCase() : '';
      paramIdx += 3;
    }
    if (normalized.includes('AND e.department = ?')) {
      deptVal = params[paramIdx++];
    }
    if (normalized.includes('AND e.shift_id = ?')) {
      shiftVal = params[paramIdx++];
    }

    if (searchVal) {
      list = list.filter(e => e.name.toLowerCase().includes(searchVal) || e.employee_id.toLowerCase().includes(searchVal) || e.email.toLowerCase().includes(searchVal));
    }
    if (deptVal) {
      list = list.filter(e => e.department === deptVal);
    }
    if (shiftVal) {
      list = list.filter(e => e.shift_id == shiftVal);
    }

    return list;
  }

  if (normalized.startsWith('SELECT COUNT(*) as count FROM employees')) {
    const employees = loadTable('employees');
    return [{ count: employees.length }];
  }

  // -------------------------------------------------------------
  // ATTENDANCE QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('SELECT * FROM attendance WHERE employee_id = ? AND date = ?')) {
    const attendance = loadTable('attendance');
    const record = attendance.find(a => a.employee_id === params[0] && a.date === params[1]);
    return record ? [record] : [];
  }

  if (normalized.startsWith('INSERT INTO attendance')) {
    const attendance = loadTable('attendance');
    const recordIdx = attendance.findIndex(a => a.employee_id === params[0] && a.date === params[1]);
    if (recordIdx !== -1) {
      // ON DUPLICATE KEY UPDATE
      attendance[recordIdx].check_in = params[2];
      attendance[recordIdx].status = params[3];
    } else {
      const newId = attendance.length > 0 ? Math.max(...attendance.map(a => a.id)) + 1 : 1;
      attendance.push({
        id: newId,
        employee_id: params[0],
        date: params[1],
        check_in: params[2],
        check_out: null,
        status: params[3]
      });
    }
    saveTable('attendance', attendance);
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?')) {
    const attendance = loadTable('attendance');
    const recordIdx = attendance.findIndex(a => a.employee_id === params[1] && a.date === params[2]);
    if (recordIdx !== -1) {
      attendance[recordIdx].check_out = params[0];
      saveTable('attendance', attendance);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('SELECT a.*, s.shift_name, s.start_time, s.end_time FROM attendance a')) {
    const attendance = loadTable('attendance');
    const employees = loadTable('employees');
    const shifts = loadTable('shifts');
    
    let list = attendance.filter(a => a.employee_id === params[0]);
    list = list.map(a => {
      const emp = employees.find(e => e.employee_id === a.employee_id);
      const shift = emp ? shifts.find(s => s.id == emp.shift_id) : null;
      return {
        ...a,
        shift_name: shift ? shift.shift_name : null,
        start_time: shift ? shift.start_time : null,
        end_time: shift ? shift.end_time : null
      };
    });
    // Sort descending by date
    list.sort((a,b) => b.date.localeCompare(a.date));
    return list;
  }

  if (normalized.includes('FROM attendance a JOIN employees e ON a.employee_id = e.employee_id')) {
    const attendance = loadTable('attendance');
    const employees = loadTable('employees');
    const shifts = loadTable('shifts');
    
    let list = attendance.map(a => {
      const emp = employees.find(e => e.employee_id === a.employee_id);
      const shift = emp ? shifts.find(s => s.id == emp.shift_id) : null;
      return {
        ...a,
        name: emp ? emp.name : 'Unknown',
        department: emp ? emp.department : 'N/A',
        designation: emp ? emp.designation : 'N/A',
        shift_name: shift ? shift.shift_name : null
      };
    });

    let paramIdx = 0;
    let dateFilter = '';
    let deptFilter = '';

    if (normalized.includes('AND a.date = ?')) {
      dateFilter = params[paramIdx++];
    }
    if (normalized.includes('AND e.department = ?')) {
      deptFilter = params[paramIdx++];
    }

    if (dateFilter) {
      list = list.filter(a => a.date === dateFilter);
    }
    if (deptFilter) {
      list = list.filter(a => a.department === deptFilter);
    }

    list.sort((a,b) => b.date.localeCompare(a.date));
    return list;
  }

  if (normalized.startsWith('SELECT * FROM attendance WHERE employee_id = ? AND date LIKE ?')) {
    const attendance = loadTable('attendance');
    const empId = params[0];
    const pattern = params[1].replace(/%/g, ''); // e.g. '2026-06-'
    return attendance
      .filter(a => a.employee_id === empId && a.date.startsWith(pattern))
      .sort((a,b) => a.date.localeCompare(b.date));
  }

  if (normalized.startsWith('SELECT a.employee_id, e.name, e.department, SUM')) {
    const attendance = loadTable('attendance');
    const employees = loadTable('employees');
    const pattern = params[0].replace(/%/g, ''); // e.g. '2026-06-'

    const grouped = {};
    attendance.forEach(a => {
      if (a.date.startsWith(pattern)) {
        const emp = employees.find(e => e.employee_id === a.employee_id);
        if (emp) {
          if (!grouped[a.employee_id]) {
            grouped[a.employee_id] = {
              employee_id: a.employee_id,
              name: emp.name,
              department: emp.department,
              present_count: 0,
              late_count: 0,
              half_day_count: 0,
              absent_count: 0
            };
          }
          if (a.status === 'Present') grouped[a.employee_id].present_count++;
          if (a.status === 'Late') grouped[a.employee_id].late_count++;
          if (a.status === 'Half Day') grouped[a.employee_id].half_day_count++;
          if (a.status === 'Absent') grouped[a.employee_id].absent_count++;
        }
      }
    });

    return Object.values(grouped);
  }

  if (normalized.startsWith('SELECT COUNT(*) as count FROM attendance WHERE date = ?')) {
    const attendance = loadTable('attendance');
    const count = attendance.filter(a => a.date === params[0] && ['Present', 'Late', 'Half Day'].includes(a.status)).length;
    return [{ count }];
  }

  if (normalized.startsWith('SELECT date, SUM(CASE WHEN status IN')) {
    const attendance = loadTable('attendance');
    // Group attendance for past N days.
    // Return mock values or aggregate from actual logs
    const days = params[0] || 7;
    const dateMap = {};
    // Seed past days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = { date: dateStr, present: 0, absent: 0, half_day: 0 };
    }

    attendance.forEach(a => {
      if (dateMap[a.date]) {
        if (['Present', 'Late'].includes(a.status)) dateMap[a.date].present++;
        if (a.status === 'Absent') dateMap[a.date].absent++;
        if (a.status === 'Half Day') dateMap[a.date].half_day++;
      }
    });

    // Fallback: If no records, populate dummy data for chart visual
    if (Object.values(dateMap).every(val => val.present === 0 && val.absent === 0)) {
      Object.keys(dateMap).forEach(k => {
        dateMap[k].present = Math.floor(Math.random() * 5) + 3;
        dateMap[k].absent = Math.floor(Math.random() * 2);
      });
    }

    return Object.values(dateMap).sort((a,b) => a.date.localeCompare(b.date));
  }

  // -------------------------------------------------------------
  // LEAVES QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('SELECT * FROM leaves WHERE id = ?')) {
    const leaves = loadTable('leaves');
    return [leaves.find(l => l.id == params[0]) || null];
  }

  if (normalized.startsWith('INSERT INTO leaves')) {
    const leaves = loadTable('leaves');
    const newId = leaves.length > 0 ? Math.max(...leaves.map(l => l.id)) + 1 : 1;
    const newLeave = {
      id: newId,
      employee_id: params[0],
      leave_type: params[1],
      start_date: params[2],
      end_date: params[3],
      reason: params[4],
      status: 'Pending',
      approved_by: null,
      created_at: new Date().toISOString()
    };
    leaves.push(newLeave);
    saveTable('leaves', leaves);
    return { insertId: newId };
  }

  if (normalized.startsWith('SELECT l.*, e.name as approved_by_name FROM leaves l')) {
    const leaves = loadTable('leaves');
    const employees = loadTable('employees');
    return leaves
      .filter(l => l.employee_id === params[0])
      .map(l => {
        const admin = employees.find(e => e.employee_id === l.approved_by);
        return {
          ...l,
          approved_by_name: admin ? admin.name : null
        };
      })
      .sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  if (normalized.includes('FROM leaves l JOIN employees e ON l.employee_id = e.employee_id WHERE l.status = \'Pending\'')) {
    const leaves = loadTable('leaves');
    const employees = loadTable('employees');
    return leaves
      .filter(l => l.status === 'Pending')
      .map(l => {
        const emp = employees.find(e => e.employee_id === l.employee_id);
        return {
          ...l,
          name: emp ? emp.name : 'Unknown',
          department: emp ? emp.department : 'N/A',
          designation: emp ? emp.designation : 'N/A'
        };
      })
      .sort((a,b) => a.created_at.localeCompare(b.created_at));
  }

  if (normalized.includes('FROM leaves l JOIN employees e ON l.employee_id = e.employee_id LEFT JOIN employees admin ON l.approved_by = admin.employee_id')) {
    const leaves = loadTable('leaves');
    const employees = loadTable('employees');
    return leaves
      .map(l => {
        const emp = employees.find(e => e.employee_id === l.employee_id);
        const admin = employees.find(e => e.employee_id === l.approved_by);
        return {
          ...l,
          name: emp ? emp.name : 'Unknown',
          department: emp ? emp.department : 'N/A',
          designation: emp ? emp.designation : 'N/A',
          approved_by_name: admin ? admin.name : null
        };
      })
      .sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  if (normalized.startsWith('UPDATE leaves SET status = ?')) {
    const leaves = loadTable('leaves');
    const idx = leaves.findIndex(l => l.id == params[2]);
    if (idx !== -1) {
      leaves[idx].status = params[0];
      leaves[idx].approved_by = params[1];
      saveTable('leaves', leaves);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('SELECT COUNT(*) as count FROM leaves WHERE status = \'Pending\'')) {
    const leaves = loadTable('leaves');
    const count = leaves.filter(l => l.status === 'Pending').length;
    return [{ count }];
  }

  if (normalized.startsWith('SELECT status, COUNT(*) as count FROM leaves GROUP BY status')) {
    const leaves = loadTable('leaves');
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach(l => counts[l.status]++);
    // Map to list
    return Object.keys(counts).map(status => ({ status, count: counts[status] }));
  }

  if (normalized.startsWith('SELECT leave_type, COUNT(*) as count FROM leaves GROUP BY leave_type')) {
    const leaves = loadTable('leaves');
    const counts = {};
    leaves.forEach(l => {
      counts[l.leave_type] = (counts[l.leave_type] || 0) + 1;
    });
    return Object.keys(counts).map(leave_type => ({ leave_type, count: counts[leave_type] }));
  }

  // -------------------------------------------------------------
  // MACHINES QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('SELECT * FROM machines ORDER BY machine_id ASC') || normalized.startsWith('SELECT * FROM machines')) {
    return loadTable('machines');
  }

  if (normalized.startsWith('SELECT * FROM machines WHERE machine_id = ?')) {
    const machines = loadTable('machines');
    return [machines.find(m => m.machine_id === params[0]) || null];
  }

  if (normalized.startsWith('INSERT INTO machines')) {
    const machines = loadTable('machines');
    const newMachine = {
      machine_id: params[0],
      name: params[1],
      location: params[2],
      status: params[3] || 'Operational'
    };
    machines.push(newMachine);
    saveTable('machines', machines);
    return newMachine;
  }

  if (normalized.startsWith('UPDATE machines SET status = ? WHERE machine_id = ?')) {
    const machines = loadTable('machines');
    const idx = machines.findIndex(m => m.machine_id === params[1]);
    if (idx !== -1) {
      machines[idx].status = params[0];
      saveTable('machines', machines);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('SELECT status, COUNT(*) as count FROM machines GROUP BY status')) {
    const machines = loadTable('machines');
    const counts = { Operational: 0, 'Under Maintenance': 0, Broken: 0 };
    machines.forEach(m => counts[m.status]++);
    return Object.keys(counts).map(status => ({ status, count: counts[status] }));
  }

  // -------------------------------------------------------------
  // MAINTENANCE REQUESTS QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('SELECT mr.*, m.name as machine_name, m.location, reporter.name as reporter_name, tech.name as technician_name FROM maintenance_requests mr')) {
    const mr = loadTable('maintenance_requests');
    const machines = loadTable('machines');
    const employees = loadTable('employees');

    let list = mr.map(r => {
      const mac = machines.find(m => m.machine_id === r.machine_id);
      const rep = employees.find(e => e.employee_id === r.reported_by);
      const tech = employees.find(e => e.employee_id === r.assigned_technician_id);
      return {
        ...r,
        machine_name: mac ? mac.name : 'Unknown',
        location: mac ? mac.location : 'N/A',
        reporter_name: rep ? rep.name : 'Unknown',
        technician_name: tech ? tech.name : 'Unassigned'
      };
    });

    if (normalized.includes('WHERE mr.id = ?')) {
      return [list.find(r => r.id == params[0]) || null];
    }

    let statusVal = '';
    let priorityVal = '';
    let techVal = '';
    let paramIdx = 0;

    // Filter processing
    if (normalized.includes('AND mr.status = ?')) {
      statusVal = params[paramIdx++];
    }
    if (normalized.includes('AND mr.priority = ?')) {
      priorityVal = params[paramIdx++];
    }
    if (normalized.includes('AND mr.assigned_technician_id = ?')) {
      techVal = params[paramIdx++];
    }

    if (statusVal) list = list.filter(r => r.status === statusVal);
    if (priorityVal) list = list.filter(r => r.priority === priorityVal);
    if (techVal) list = list.filter(r => r.assigned_technician_id === techVal);

    list.sort((a,b) => b.created_at.localeCompare(a.created_at));
    return list;
  }

  if (normalized.startsWith('INSERT INTO maintenance_requests')) {
    const mr = loadTable('maintenance_requests');
    const newId = mr.length > 0 ? Math.max(...mr.map(r => r.id)) + 1 : 1;
    const newRequest = {
      id: newId,
      machine_id: params[0],
      issue_title: params[1],
      description: params[2],
      priority: params[3],
      image_url: params[4],
      assigned_technician_id: null,
      status: 'Open',
      reported_by: params[5],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mr.push(newRequest);
    saveTable('maintenance_requests', mr);
    return { insertId: newId };
  }

  if (normalized.startsWith('UPDATE maintenance_requests SET assigned_technician_id = ?, status = "In Progress"')) {
    const mr = loadTable('maintenance_requests');
    const idx = mr.findIndex(r => r.id == params[1]);
    if (idx !== -1) {
      mr[idx].assigned_technician_id = params[0];
      mr[idx].status = 'In Progress';
      mr[idx].updated_at = new Date().toISOString();
      saveTable('maintenance_requests', mr);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('UPDATE maintenance_requests SET status = ? WHERE id = ?')) {
    const mr = loadTable('maintenance_requests');
    const idx = mr.findIndex(r => r.id == params[1]);
    if (idx !== -1) {
      mr[idx].status = params[0];
      mr[idx].updated_at = new Date().toISOString();
      saveTable('maintenance_requests', mr);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('SELECT COUNT(*) as count FROM maintenance_requests WHERE status IN')) {
    const mr = loadTable('maintenance_requests');
    const count = mr.filter(r => ['Open', 'In Progress'].includes(r.status)).length;
    return [{ count }];
  }

  if (normalized.startsWith('SELECT status, COUNT(*) as count FROM maintenance_requests GROUP BY status')) {
    const mr = loadTable('maintenance_requests');
    const counts = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    mr.forEach(r => counts[r.status]++);
    return Object.keys(counts).map(status => ({ status, count: counts[status] }));
  }

  if (normalized.startsWith('SELECT priority, COUNT(*) as count FROM maintenance_requests GROUP BY priority')) {
    const mr = loadTable('maintenance_requests');
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    mr.forEach(r => counts[r.priority]++);
    return Object.keys(counts).map(priority => ({ priority, count: counts[priority] }));
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS QUERIES
  // -------------------------------------------------------------
  if (normalized.startsWith('INSERT INTO notifications')) {
    const notifs = loadTable('notifications');
    const newId = notifs.length > 0 ? Math.max(...notifs.map(n => n.id)) + 1 : 1;
    const newNotif = {
      id: newId,
      employee_id: params[0],
      title: params[1],
      message: params[2],
      type: params[3],
      is_read: false,
      created_at: new Date().toISOString()
    };
    notifs.push(newNotif);
    saveTable('notifications', notifs);
    return { insertId: newId };
  }

  if (normalized.startsWith('SELECT * FROM notifications WHERE id = ?')) {
    const notifs = loadTable('notifications');
    return [notifs.find(n => n.id == params[0]) || null];
  }

  if (normalized.startsWith('SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC LIMIT 50')) {
    const notifs = loadTable('notifications');
    return notifs
      .filter(n => n.employee_id === params[0])
      .sort((a,b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 50);
  }

  if (normalized.startsWith('UPDATE notifications SET is_read = TRUE WHERE id = ?')) {
    const notifs = loadTable('notifications');
    const idx = notifs.findIndex(n => n.id == params[0]);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      saveTable('notifications', notifs);
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('UPDATE notifications SET is_read = TRUE WHERE employee_id = ?')) {
    const notifs = loadTable('notifications');
    notifs.forEach(n => {
      if (n.employee_id === params[0]) n.is_read = true;
    });
    saveTable('notifications', notifs);
    return { affectedRows: 1 };
  }

  // Generic fallback if not matched
  console.log(`[mockDb] Executed generic SQL: "${normalized}"`);
  return [];
};

module.exports = {
  executeMockQuery
};
