export async function onRequestGet() {
  return Response.json({
    ok: true,
    app: "Costa",
    provider: "Cloudflare Workers AI",
    model: "@cf/ibm-granite/granite-4.0-h-micro"
  });
}
