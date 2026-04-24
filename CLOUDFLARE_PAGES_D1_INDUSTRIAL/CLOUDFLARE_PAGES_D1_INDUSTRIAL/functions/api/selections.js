export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const { results } = await DB.prepare(`SELECT row_key, is_checked FROM marcacoes`).all();
    const selections = {};
    for (const row of results || []) selections[row.row_key] = Boolean(row.is_checked);
    return Response.json({ ok: true, selections });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Erro ao carregar marcações." }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const selections = body?.selections || {};
    const stmt = DB.prepare(`
      INSERT INTO marcacoes (row_key, is_checked, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(row_key) DO UPDATE SET
        is_checked = excluded.is_checked,
        updated_at = CURRENT_TIMESTAMP
    `);
    const rows = Object.entries(selections);
    const batch = rows.map(([rowKey, checked]) => stmt.bind(rowKey, checked ? 1 : 0));
    if (batch.length) await DB.batch(batch);
    return Response.json({ ok: true, saved: rows.length });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Erro ao salvar marcações." }, { status: 500 });
  }
}
