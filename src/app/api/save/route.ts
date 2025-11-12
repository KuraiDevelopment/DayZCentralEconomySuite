import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { buildTypesXML } from '@/utils/xmlParser';
import type { DayZItem } from '@/types/dayz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, filePath } = body as { items: DayZItem[]; filePath: string };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    // Create backup before saving
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = filePath.replace(/\.xml$/, `_backup_${timestamp}.xml`);
    
    try {
      // Read original file and create backup
      const originalContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, originalContent, 'utf-8');
      console.log('Backup created:', backupPath);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError);
      // Continue anyway - user might be working with a new file
    }

    // Build XML and save to original file
    const xmlContent = buildTypesXML(items);
    await fs.writeFile(filePath, xmlContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'File saved successfully',
      filePath,
      backupPath,
    });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save file', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
