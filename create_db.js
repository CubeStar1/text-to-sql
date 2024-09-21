const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function setupDatabase() {
  const db = await open({
    filename: './isro.sqlite',
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      launch_date DATE,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS satellites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      launch_date DATE,
      orbit TEXT,
      mission_id INTEGER,
      FOREIGN KEY (mission_id) REFERENCES missions(id)
    );

    CREATE TABLE IF NOT EXISTS launch_vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      payload_capacity REAL
    );
  `);

  // Insert sample data
  await db.exec(`
    INSERT INTO missions (name, launch_date, status) VALUES
    ('Chandrayaan-1', '2008-10-22', 'Completed'),
    ('Mars Orbiter Mission', '2013-11-05', 'Operational'),
    ('Chandrayaan-2', '2019-07-22', 'Partially Successful');

    INSERT INTO satellites (name, launch_date, orbit, mission_id) VALUES
    ('INSAT-3DR', '2016-09-08', 'Geostationary', NULL),
    ('GSAT-29', '2018-11-14', 'Geostationary', NULL),
    ('Mangalyaan', '2013-11-05', 'Mars orbit', 2);

    INSERT INTO launch_vehicles (name, type, payload_capacity) VALUES
    ('PSLV', 'Polar Satellite Launch Vehicle', 1750),
    ('GSLV', 'Geosynchronous Satellite Launch Vehicle', 5000),
    ('GSLV Mk III', 'Geosynchronous Satellite Launch Vehicle Mark III', 8000);
  `);

  console.log('Database setup completed.');
  await db.close();
}

setupDatabase().catch(console.error);