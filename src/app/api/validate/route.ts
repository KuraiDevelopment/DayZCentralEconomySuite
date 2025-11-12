import { NextRequest, NextResponse } from 'next/server';
import { validateItems } from '@/utils/validation';
import type { DayZItem } from '@/types/dayz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: DayZItem[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    const result = validateItems(items);

    return NextResponse.json({
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      summary: {
        totalItems: items.length,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
