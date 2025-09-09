import { NextResponse } from 'next/server';

const fs = require('fs').promises;
const path = require('path');

const PLACES_FILE = path.join(process.cwd(), 'data', 'places.json');

export async function GET() {
  try {
    const data = await fs.readFile(PLACES_FILE, 'utf8');
    const places = JSON.parse(data);
    
    return NextResponse.json({
      success: true,
      places: places
    });
  } catch (error) {
    console.error('Erreur lecture places:', error);
    return NextResponse.json({
      success: true,
      places: { total: 500, reserved: 0, available: 500 }
    });
  }
}
