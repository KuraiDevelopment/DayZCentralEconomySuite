import { NextRequest, NextResponse } from 'next/server';
import { buildTypesXML } from '@/utils/xmlParser';
import type { DayZItem } from '@/types/dayz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, format = 'xml' } = body as { items: DayZItem[]; format?: 'xml' | 'json' };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    if (format === 'json') {
      const jsonContent = JSON.stringify(items, null, 2);
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="types.json"',
        },
      });
    }

    // Default to XML export
    const xmlContent = buildTypesXML(items);
    return new NextResponse(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="types.xml"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
