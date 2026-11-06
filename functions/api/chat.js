const MODEL = "@cf/ibm-granite/granite-4.0-h-micro";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }

  const { messages, character } = body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Envie pelo menos uma mensagem." }, { status: 400 });
  }

  const safeMessages = messages.slice(-8).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: String(message.content ?? "").slice(0, 1800)
  })).filter(message => message.content.length > 0);

  const systemPrompt = [
    `Você é ${String(character?.name || "um personagem").slice(0, 80)}.`,
    String(character?.description || "Converse de forma natural e amigável.").slice(0, 1200),
    "Responda em português brasileiro, a menos que a pessoa peça outro idioma.",
    "Mantenha a personalidade do personagem e não afirme ser uma pessoa real."
  ].join(" ");

  try {
    const result = await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: systemPrompt },
        ...safeMessages
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    const reply = result?.response || result?.choices?.[0]?.message?.content;
    if (!reply) {
      return Response.json({ error: "O modelo não retornou uma resposta de texto." }, { status: 502 });
    }
    return Response.json({ reply });
  } catch (error) {
    console.error("Workers AI error:", error);
    return Response.json({
      error: "A IA não conseguiu responder. Verifique a cota gratuita do Workers AI e tente novamente."
    }, { status: 502 });
  }
}
