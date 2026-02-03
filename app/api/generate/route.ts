export async function POST(req: Request) {
  try {
    const { idea, network, format } = await req.json();

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "Falta MAKE_WEBHOOK_URL en Vercel/Local" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, network, format }),
    });

    // ✅ Leer como texto SIEMPRE (porque Make a veces responde texto plano)
    const raw = await r.text();

    // ✅ Intentar parsear JSON, pero si falla, usar el texto tal cual
    let content = raw;
    try {
      const parsed = JSON.parse(raw);
      content =
        parsed?.content ??
        parsed?.text ??
        parsed?.result ??
        // si Make regresó otro shape:
        (typeof parsed === "string" ? parsed : JSON.stringify(parsed));
    } catch {
      // raw ya es texto plano (ej: "¡Claro! ...")
      content = raw;
    }

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}