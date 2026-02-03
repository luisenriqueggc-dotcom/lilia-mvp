"use client";

import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [network, setNetwork] = useState("instagram");
  const [format, setFormat] = useState("post");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error al generar contenido");
      }

      // ✅ AQUÍ ESTÁ LA CLAVE
      setResult(data?.content || "");

    } catch (e: any) {
      setResult("Oops: " + (e?.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result);
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
              onClick={copyToClipboard}
              disabled={!result}
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
            >
              Copiar
            </button>
          </div>

          <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm">
            {result || "Aquí aparecerá el texto…"}
          </pre>
        </div>
      </div>
    </main>
  );
}