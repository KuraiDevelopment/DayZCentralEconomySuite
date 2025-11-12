import { NextRequest, NextResponse } from 'next/server';
import { parseXMLFile } from '@/utils/xmlParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const xmlContent = await file.text();
    const result = parseXMLFile(xmlContent);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to parse XML', details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      fileType: result.fileType,
      itemCount: result.itemCount,
      data: result.data,
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
