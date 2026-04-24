export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const { results } = await DB.prepare(`
      SELECT id, tag_me, tag_re, desc_motor, desc_redutor, hp, kw, source, status, row_key
      FROM equipamentos
      ORDER BY tag_me ASC, tag_re ASC
    `).all();

    return Response.json({ ok: true, items: results || [] });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Erro ao carregar equipamentos." }, { status: 500 });
  }
}
