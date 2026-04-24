export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const body = await context.request.json();
    const payloadJson = JSON.stringify(body);
    const result = await DB.prepare(`
      INSERT INTO ordens_servico (
        numero_os, data_os, tag_me, tag_re, potencia, status_equipamento,
        responsavel, setor, descricao, servico, observacao, payload_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      body.numero_os || null,
      body.data_os || null,
      body.tag_me || null,
      body.tag_re || null,
      body.potencia || null,
      body.status_equipamento || null,
      body.responsavel || null,
      body.setor || null,
      body.descricao || null,
      body.servico || null,
      body.observacao || null,
      payloadJson
    ).run();
    return Response.json({ ok: true, id: result.meta?.last_row_id || null });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || "Erro ao salvar OS." }, { status: 500 });
  }
}
