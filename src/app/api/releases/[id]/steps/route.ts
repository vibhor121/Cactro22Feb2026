import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { STEP_COUNT } from '@/lib/steps';
import { computeStatus } from '@/lib/computeStatus';
import type { ToggleStepsBody } from '@/lib/types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid release ID' }, { status: 400 });
  }

  try {
    const body: ToggleStepsBody = await req.json();

    if (!Array.isArray(body.updates) || body.updates.length === 0) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 });
    }

    // Validate step indices
    for (const u of body.updates) {
      if (u.step_index < 0 || u.step_index > 8) {
        return NextResponse.json({ error: `Invalid step_index: ${u.step_index}` }, { status: 400 });
      }
    }

    // Upsert each step state
    for (const update of body.updates) {
      await sql`
        INSERT INTO step_states (release_id, step_index, is_done, updated_at)
        VALUES (${id}, ${update.step_index}, ${update.is_done}, NOW())
        ON CONFLICT (release_id, step_index)
        DO UPDATE SET is_done = EXCLUDED.is_done, updated_at = NOW()
      `;
    }

    // Return updated step states and new status
    const steps = await sql`
      SELECT * FROM step_states WHERE release_id = ${id} ORDER BY step_index ASC
    `;

    const [counts] = await sql`
      SELECT COUNT(*) FILTER (WHERE is_done = TRUE)::int AS done_count
      FROM step_states WHERE release_id = ${id}
    `;

    const doneCount = Number(counts.done_count);

    return NextResponse.json({
      steps,
      status: computeStatus(doneCount, STEP_COUNT),
      done_count: doneCount,
      total_steps: STEP_COUNT,
    });
  } catch (err) {
    console.error('[PATCH /api/releases/:id/steps]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
