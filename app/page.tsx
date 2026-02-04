"use client";

import { useMemo, useState } from "react";

function splitSections(text: string) {
  // Divide antes de "TÍTULO" o antes de "1)" "2)" etc.
  const sections = text
    .split(/\n(?=\d\))/g)
    .map((s) => s.trim())
    .filter(Boolean);

  // Fallback si no se detectan secciones
  return sections.length ? sections : [text.trim()];
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [network, setNetwork] = useState("instagram");
  const [format, setFormat] = useState("post");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const sections = useMemo(() => {
  if (!result) return [];
  return splitSections(result).filter((s) => s.trim() !== "TÍTULO");
}, [result]);

  async function handleGenerate() {
    if (!idea.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, network, format }),
      });

      // ✅ Robusto: intenta JSON, si falla lee texto
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        const raw = await res.text().catch(() => "");
        data = { content: raw };
      }

      if (!res.ok) {
        throw new Error(data?.error || "Error al generar contenido");
      }

      setResult(data?.content || "");
    } catch (e: any) {
      setResult("Oops: " + (e?.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(result);
  }

  function copySection(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-semibold">Lil.ia</h1>
        <p className="mt-2 text-gray-600">
          Escribe una idea y te regreso el contenido + guía para diseñarlo en Canva.
        </p>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm border">
          <label className="block text-sm font-medium">Idea</label>
          <textarea
            className="mt-2 w-full rounded-xl border p-3"
            rows={6}
            placeholder="Ej: Muchas personas creen que certificarse es solo para expertos…"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Red</label>
              <select
                className="mt-2 w-full rounded-xl border p-3"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Formato</label>
              <select
                className="mt-2 w-full rounded-xl border p-3"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="post">Post</option>
                <option value="carrusel">Carrusel</option>
                <option value="reel">Reel</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !idea.trim()}
            className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Generando…" : "Generar"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Resultado</h2>
            <button
              onClick={copyAll}
              disabled={!result}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              Copiar todo
            </button>
          </div>

          {!result ? (
            <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              Aquí aparecerá el texto…
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {sections.map((section, i) => (
                <div key={i} className="rounded-xl border bg-gray-50 p-4 text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-700">
                      Sección {i + 1}
                    </span>
                    <button
                      onClick={() => copySection(section)}
                      className="rounded-lg border px-3 py-2 text-xs hover:bg-white"
                    >
                      Copiar
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap">{section}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}