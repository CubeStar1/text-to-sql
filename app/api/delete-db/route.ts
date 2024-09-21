import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  const dbPath = path.join(process.cwd(), 'uploaded2.sqlite');
  
  try {
    await fs.unlink(dbPath);
    return NextResponse.json({ success: true, message: 'Database deleted successfully' });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, which is fine
      return NextResponse.json({ success: true, message: 'Database file does not exist' });
    } else if (error.code === 'EBUSY') {
      console.error('Database file is busy. Will be deleted on next server restart.');
      return NextResponse.json({ success: false, error: 'Database file is busy. It will be deleted later.' });
    } else {
      console.error('Error deleting database:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete database' }, { status: 500 });
    }
  }
}