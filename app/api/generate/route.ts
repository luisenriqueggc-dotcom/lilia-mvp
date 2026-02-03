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
  
      const data = await r.json();
  
      // Esperamos que Make regrese { text: "..." }
      const text = data?.content || data?.text || data?.result || JSON.stringify(data);
        
      return new Response(JSON.stringify({ text }), {
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