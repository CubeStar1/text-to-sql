import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: Request) {
  const { query, useCustomDB } = await req.json();
  let db;

  try {
    let dbPath;
    if (useCustomDB) {
      dbPath = path.join(process.cwd(), 'uploaded2.sqlite');
      // Check if the custom database file exists
      try {
        await fs.access(dbPath);
      } catch {
        // If the file doesn't exist, return an empty result
        return NextResponse.json({ results: [] });
      }
    } else {
      dbPath = path.join(process.cwd(), 'isro.sqlite');
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const results = await db.all(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'An error occurred while querying the database' }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}