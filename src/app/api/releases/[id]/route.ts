import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { STEP_COUNT } from '@/lib/steps';
import { computeStatus } from '@/lib/computeStatus';
import type { UpdateReleaseBody } from '@/lib/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string) {
  return UUID_RE.test(id);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid release ID' }, { status: 400 });
  }

  try {
    const [release] = await sql`
      SELECT
        r.id, r.name, r.release_date, r.additional_info, r.created_at, r.updated_at,
        COUNT(s.id) FILTER (WHERE s.is_done = TRUE)::int AS done_count,
        ${STEP_COUNT}::int AS total_steps
      FROM releases r
      LEFT JOIN step_states s ON s.release_id = r.id
      WHERE r.id = ${id}
      GROUP BY r.id
    `;

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    const steps = await sql`
      SELECT * FROM step_states WHERE release_id = ${id} ORDER BY step_index ASC
    `;

    return NextResponse.json({
      ...release,
      status: computeStatus(Number(release.done_count), STEP_COUNT),
      steps,
    });
  } catch (err) {
    console.error('[GET /api/releases/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid release ID' }, { status: 400 });
  }

  try {
    const body: UpdateReleaseBody = await req.json();

    // Build update using COALESCE to only update provided fields
    // additional_info is special: null means "clear it", undefined means "leave it"
    const newName = body.name ?? null;
    const newDate = body.release_date ?? null;
    const updateAdditionalInfo = 'additional_info' in body;
    const newAdditionalInfo = body.additional_info ?? null;

    let updated;
    if (updateAdditionalInfo) {
      [updated] = await sql`
        UPDATE releases SET
          name = COALESCE(${newName}, name),
          release_date = COALESCE(${newDate}::timestamptz, release_date),
          additional_info = ${newAdditionalInfo},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      [updated] = await sql`
        UPDATE releases SET
          name = COALESCE(${newName}, name),
          release_date = COALESCE(${newDate}::timestamptz, release_date),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (!updated) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    const [counts] = await sql`
      SELECT COUNT(*) FILTER (WHERE is_done = TRUE)::int AS done_count
      FROM step_states WHERE release_id = ${id}
    `;

    return NextResponse.json({
      ...updated,
      status: computeStatus(Number(counts.done_count), STEP_COUNT),
      done_count: counts.done_count,
      total_steps: STEP_COUNT,
    });
  } catch (err) {
    console.error('[PATCH /api/releases/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid release ID' }, { status: 400 });
  }

  try {
    const [deleted] = await sql`
      DELETE FROM releases WHERE id = ${id} RETURNING id
    `;

    if (!deleted) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/releases/:id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
