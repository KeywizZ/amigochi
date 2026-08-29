import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const pbUrl =
    process.env.POCKETBASE_URL ||
    import.meta.env.POCKETBASE_URL ||
    "http://127.0.0.1:8090";

  try {
    const res = await fetch(`${pbUrl}/api/health`);
    const data = await res.json();

    return new Response(JSON.stringify({ status: "ok", pb: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ status: "error", pb: "unreachable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
};
