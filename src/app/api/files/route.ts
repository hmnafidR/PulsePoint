import { NextResponse } from 'next/server';
import { DatasetService } from '@/lib/dataset-service';

export async function GET() {
  try {
    const datasetService = new DatasetService();
    const files = await datasetService.getTestFiles();
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get test files' },
      { status: 500 }
    );
  }
} 