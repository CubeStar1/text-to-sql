import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Parse CSV
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true
  });

  if (records.length === 0) {
    return NextResponse.json({ success: false, error: 'CSV file is empty' }, { status: 400 });
  }

  // Create SQLite database
  const dbPath = path.join(process.cwd(), 'uploaded2.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create table
  const columns = Object.keys(records[0]).map(col => `${col} TEXT`).join(', ');
  await db.exec(`CREATE TABLE IF NOT EXISTS uploaded_data (${columns})`);

  // Insert data
  const placeholders = Object.keys(records[0]).map(() => '?').join(', ');
  const stmt = await db.prepare(`INSERT INTO uploaded_data VALUES (${placeholders})`);
  for (const record of records) {
    await stmt.run(Object.values(record));
  }
  await stmt.finalize();

  await db.close();

  return NextResponse.json({ success: true, message: 'Database created successfully' });
}