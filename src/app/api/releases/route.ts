import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { STEP_COUNT } from '@/lib/steps';
import { computeStatus } from '@/lib/computeStatus';
import type { CreateReleaseBody } from '@/lib/types';

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        r.id,
        r.name,
        r.release_date,
        r.additional_info,
        r.created_at,
        r.updated_at,
        COUNT(s.id) FILTER (WHERE s.is_done = TRUE)::int AS done_count,
        ${STEP_COUNT}::int AS total_steps
      FROM releases r
      LEFT JOIN step_states s ON s.release_id = r.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `;

    const releases = rows.map((r) => ({
      ...r,
      status: computeStatus(Number(r.done_count), STEP_COUNT),
    }));

    return NextResponse.json(releases);
  } catch (err) {
    console.error('[GET /api/releases]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateReleaseBody = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!body.release_date) {
      return NextResponse.json({ error: 'release_date is required' }, { status: 400 });
    }

    // Insert release
    const [release] = await sql`
      INSERT INTO releases (name, release_date, additional_info)
      VALUES (${body.name.trim()}, ${body.release_date}, ${body.additional_info ?? null})
      RETURNING *
    `;

    // Seed 9 step_state rows
    const stepValues = Array.from({ length: STEP_COUNT }, (_, i) => i);
    await sql`
      INSERT INTO step_states (release_id, step_index, is_done)
      SELECT ${release.id}, unnest(${stepValues}::smallint[]), FALSE
    `;

    return NextResponse.json({
      ...release,
      status: 'planned',
      done_count: 0,
      total_steps: STEP_COUNT,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/releases]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
