const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'password';
const dbName = process.env.DB_NAME || 'steel_plant_db';

async function init() {
  console.log('Initializing Database...');
  let connection;
  try {
    // 1. Connect without database name first
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true
    });

    console.log(`Connected to MySQL server at ${dbHost}`);

    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database "${dbName}" checked/created.`);

    // 3. Close and reconnect with database selected
    await connection.end();
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      multipleStatements: true
    });

    // 4. Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('Schema tables created successfully.');

    // 5. Seed initial shifts if empty
    const [shifts] = await connection.query('SELECT COUNT(*) as count FROM shifts');
    if (shifts[0].count === 0) {
      console.log('Seeding shifts...');
      await connection.query(`
        INSERT INTO shifts (shift_name, start_time, end_time) VALUES
        ('Morning Shift', '06:00:00', '14:00:00'),
        ('Afternoon Shift', '14:00:00', '22:00:00'),
        ('Night Shift', '22:00:00', '06:00:00')
      `);
    }

    // 6. Seed initial employees if empty
    const [employees] = await connection.query('SELECT COUNT(*) as count FROM employees');
    if (employees[0].count === 0) {
      console.log('Seeding employees...');
      const adminPass = await bcrypt.hash('admin123', 10);
      const techPass = await bcrypt.hash('tech123', 10);
      const empPass = await bcrypt.hash('emp123', 10);

      await connection.query(`
        INSERT INTO employees (employee_id, name, email, phone, department, designation, joining_date, password, role, shift_id) VALUES
        ('EMP001', 'System Admin', 'admin@steelplant.com', '9876543210', 'Management', 'System Administrator', '2026-01-01', '${adminPass}', 'Admin', 1),
        ('EMP002', 'John Mechanic', 'john@steelplant.com', '9876543211', 'Maintenance', 'Technician', '2026-01-01', '${techPass}', 'Technician', 1),
        ('EMP003', 'Alice Operator', 'alice@steelplant.com', '9876543212', 'Production', 'Control Room Operator', '2026-01-01', '${empPass}', 'Employee', 1)
      `);
    }

    // 7. Seed initial machines if empty
    const [machines] = await connection.query('SELECT COUNT(*) as count FROM machines');
    if (machines[0].count === 0) {
      console.log('Seeding machines...');
      await connection.query(`
        INSERT INTO machines (machine_id, name, location, status) VALUES
        ('BLAST-FURNACE-01', 'Blast Furnace #1', 'Shop Floor A', 'Operational'),
        ('ROLLING-MILL-02', 'Hot Rolling Mill #2', 'Shop Floor B', 'Operational'),
        ('CASTING-03', 'Continuous Casting Machine #3', 'Shop Floor C', 'Operational'),
        ('OXYGEN-CONV-04', 'Basic Oxygen Converter #4', 'Shop Floor A', 'Operational')
      `);
    }

    console.log('MySQL Database initialization completed successfully!');
  } catch (error) {
    console.log('\n[WARNING] MySQL Connection failed. Seeding local JSON data files instead...');
    
    // Seed JSON files in data/ directory
    const DATA_DIR = path.join(__dirname, '../data');
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const shiftsFile = path.join(DATA_DIR, 'shifts.json');
    if (!fs.existsSync(shiftsFile)) {
      fs.writeFileSync(shiftsFile, JSON.stringify([
        { id: 1, shift_name: 'Morning Shift', start_time: '06:00:00', end_time: '14:00:00' },
        { id: 2, shift_name: 'Afternoon Shift', start_time: '14:00:00', end_time: '22:00:00' },
        { id: 3, shift_name: 'Night Shift', start_time: '22:00:00', end_time: '06:00:00' }
      ], null, 2), 'utf8');
      console.log('Shifts seed JSON generated.');
    }

    const employeesFile = path.join(DATA_DIR, 'employees.json');
    if (!fs.existsSync(employeesFile)) {
      const adminPass = bcrypt.hashSync('admin123', 10);
      const techPass = bcrypt.hashSync('tech123', 10);
      const empPass = bcrypt.hashSync('emp123', 10);
      fs.writeFileSync(employeesFile, JSON.stringify([
        { id: 1, employee_id: 'EMP001', name: 'System Admin', email: 'admin@steelplant.com', phone: '9876543210', department: 'Management', designation: 'System Administrator', joining_date: '2026-01-01', password: adminPass, role: 'Admin', shift_id: 1, created_at: new Date().toISOString() },
        { id: 2, employee_id: 'EMP002', name: 'John Mechanic', email: 'john@steelplant.com', phone: '9876543211', department: 'Maintenance', designation: 'Technician', joining_date: '2026-01-01', password: techPass, role: 'Technician', shift_id: 1, created_at: new Date().toISOString() },
        { id: 3, employee_id: 'EMP003', name: 'Alice Operator', email: 'alice@steelplant.com', phone: '9876543212', department: 'Production', designation: 'Control Room Operator', joining_date: '2026-01-01', password: empPass, role: 'Employee', shift_id: 1, created_at: new Date().toISOString() }
      ], null, 2), 'utf8');
      console.log('Employees seed JSON generated.');
    }

    const machinesFile = path.join(DATA_DIR, 'machines.json');
    if (!fs.existsSync(machinesFile)) {
      fs.writeFileSync(machinesFile, JSON.stringify([
        { machine_id: 'BLAST-FURNACE-01', name: 'Blast Furnace #1', location: 'Shop Floor A', status: 'Operational' },
        { machine_id: 'ROLLING-MILL-02', name: 'Hot Rolling Mill #2', location: 'Shop Floor B', status: 'Operational' },
        { machine_id: 'CASTING-03', name: 'Continuous Casting Machine #3', location: 'Shop Floor C', status: 'Operational' },
        { machine_id: 'OXYGEN-CONV-04', name: 'Basic Oxygen Converter #4', location: 'Shop Floor A', status: 'Operational' }
      ], null, 2), 'utf8');
      console.log('Machines seed JSON generated.');
    }

    console.log('Local JSON File Database seeded successfully! (Ready for offline mode)');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

init();
