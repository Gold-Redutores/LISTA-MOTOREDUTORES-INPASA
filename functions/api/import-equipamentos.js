function getRowKey(item) {
  return [item.tag_me || '-', item.tag_re || '-', item.desc || item.desc_motor || '-', item.desc_ocr || item.desc_redutor || '-', item.source || '-'].join('|');
}

export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const stmt = DB.prepare(`
      INSERT INTO equipamentos (
        tag_me, tag_re, desc_motor, desc_redutor, hp, kw, source, status, row_key, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(row_key) DO UPDATE SET
        tag_me = excluded.tag_me,
        tag_re = excluded.tag_re,
        desc_motor = excluded.desc_motor,
        desc_redutor = excluded.desc_redutor,
        hp = excluded.hp,
        kw = excluded.kw,
        source = excluded.source,
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `);
    const batch = items.map((item) => stmt.bind(
      item.tag_me || '-',
      item.tag_re || '-',
      item.desc || item.desc_motor || '-',
      item.desc_ocr || item.desc_redutor || '-',
      item.hp || '-',
      item.kw || '-',
      item.source || '-',
      item.status || '-',
      getRowKey(item)
    ));
    if (batch.length) await DB.batch(batch);
    return Response.json({ ok: true, imported: items.length });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Erro ao importar equipamentos." }, { status: 500 });
  }
}
