import { NextResponse } from 'next/server';
import { branches } from '@/data/branches';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    let result = branches;
    if (city) {
      result = branches.filter((b) => b.city.toLowerCase().includes(city.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      totalBranches: result.length,
      branches: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve branches' },
      { status: 500 }
    );
  }
}

