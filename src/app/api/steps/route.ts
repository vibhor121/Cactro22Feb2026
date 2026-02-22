import { NextResponse } from 'next/server';
import { PREDEFINED_STEPS } from '@/lib/steps';

export async function GET() {
  return NextResponse.json(PREDEFINED_STEPS);
}
