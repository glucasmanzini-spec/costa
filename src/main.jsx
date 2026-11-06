import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, Plus, Compass, MessageCircle, Settings, Sparkles, Send,
  ArrowLeft, Menu, X, SlidersHorizontal, Heart, MoreHorizontal
} from "lucide-react";
import "./style.css";

const starterCharacters = [
  {
    id: "luna",
    name: "Luna",
    tagline: "Uma amiga que adora conversar sobre tudo ✨",
    description: "Você é Luna, uma amiga gentil, curiosa e bem-humorada. Gosta de ouvir, fazer perguntas e conversar de forma natural.",
    emoji: "🌙", color: "violet",
    greeting: "Oii! Que bom te ver por aqui. Como está sendo seu dia?"
  },
  {
    id: "max",
    name: "Max",
    tagline: "Seu parceiro de aventuras e histórias 🎮",
    description: "Você é Max, um parceiro divertido, criativo e empolgado com jogos, tecnologia e aventuras.",
    emoji: "🎮", color: "blue",
    greeting: "E aí! Preparado para inventar alguma aventura hoje?"
  },
  {
    id: "prof",
    name: "Professor Atlas",
    tagline: "Aprenda coisas novas sem complicação 🧠",
    description: "Você é o Professor Atlas, um professor paciente que explica assuntos difíceis com exemplos simples.",
    emoji: "🧠", color: "orange",
    greeting: "Olá! Qual assunto vamos explorar hoje?"
  },
  {
    id: "bia",
    name: "Bia",
    tagline: "Papo leve, ideias e criatividade 🌻",
    description: "Você é Bia, uma personagem alegre, acolhedora e criativa. Converse em português brasileiro.",
    emoji: "🌻", color: "pink",
    greeting: "Oieee! Me conta, o que está acontecendo?"
  }
];

function App() {
  const [characters, setCharacters] = useState(starterCharacters);
  const [selected, setSelected] = useState(null);
  const [messagesById, setMessagesById] = useState({});
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => characters.filter(c =>
    `${c.name} ${c.tagline}`.toLowerCase().includes(search.toLowerCase())
  ), [characters, search]);

  const messages = selected ? (messagesById[selected.id] || []) : [];

  function openCharacter(character) {
    setSelected(character);
    setMobileMenu(false);
    setNotice("");
    if (!messagesById[character.id]) {
      setMessagesById(prev => ({
        ...prev,
        [character.id]: [{ role: "assistant", content: character.greeting }]
      }));
    }
  }

  function updateMessages(id, next) {
    setMessagesById(prev => ({ ...prev, [id]: next }));
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || !selected || busy) return;
    const next = [...messages, { role: "user", content }];
    updateMessages(selected.id, next);
    setDraft("");
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: selected, messages: next })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao conversar com a IA.");
      updateMessages(selected.id, [...next, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setNotice(error.message || "Não foi possível enviar a mensagem.");
    } finally {
      setBusy(false);
    }
  }

  function createCharacter(event) {
    event.preventDefault();
    if (!newName.trim() || !newDescription.trim()) return;
    const character = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      tagline: "Seu novo personagem",
      description: newDescription.trim(),
      emoji: "✨", color: "violet",
      greeting: `Olá! Eu sou ${newName.trim()}. Sobre o que vamos conversar?`
    };
    setCharacters(prev => [character, ...prev]);
    setCreating(false);
    setNewName("");
    setNewDescription("");
    openCharacter(character);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={19} /></div>
          <span className="brand-name">costa</span>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button>
        </div>
        <button className="create-button" onClick={() => setCreating(true)}><Plus size={18} /> Criar personagem</button>
        <nav className="main-nav">
          <button className={!selected ? "nav-item active" : "nav-item"} onClick={() => { setSelected(null); setMobileMenu(false); }}><Compass size={18} /> Explorar</button>
          <button className="nav-item" onClick={() => setNotice("As conversas ficam nesta sessão. Salvamento permanente será adicionado depois.")}><MessageCircle size={18} /> Minhas conversas</button>
        </nav>
        <div className="sidebar-label">PERSONAGENS POPULARES</div>
        <div className="side-characters">
          {characters.slice(0, 5).map(character => (
            <button className={`side-character ${selected?.id === character.id ? "chosen" : ""}`} key={character.id} onClick={() => openCharacter(character)}>
              <span className={`avatar small ${character.color}`}>{character.emoji}</span><span>{character.name}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="profile-mini"><div className="profile-avatar">C</div><div><strong>Visitante</strong><span>Conta local</span></div></div>
          <button className="icon-button" title="Configurações" onClick={() => setNotice("Configurações de conta serão adicionadas em uma próxima etapa.")}><Settings size={18} /></button>
        </div>
      </aside>
      {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="breadcrumb">{selected ? <><button onClick={() => setSelected(null)}>Explorar</button><span>/</span><strong>{selected.name}</strong></> : <strong>Explorar personagens</strong>}</div>
          <div className="top-actions"><span className="beta-pill">BETA</span><button className="top-avatar">C</button></div>
        </header>
        {selected ? (
          <section className="chat-view">
            <div className="chat-heading">
              <button className="back-button" onClick={() => setSelected(null)}><ArrowLeft size={18} /> Voltar</button>
              <div className={`avatar large ${selected.color}`}>{selected.emoji}</div>
              <h1>{selected.name}</h1><p>{selected.tagline}</p>
              <div className="chat-meta"><span><span className="online-dot" /> Personagem de IA</span><span>·</span><span>Conversa privada nesta sessão</span></div>
            </div>
            <div className="messages-area">
              {messages.map((message, index) => (
                <div className={`message-row ${message.role}`} key={index}>
                  {message.role === "assistant" && <div className={`avatar message-avatar ${selected.color}`}>{selected.emoji}</div>}
                  <div className="message-bubble">{message.content}</div>
                </div>
              ))}
              {busy && <div className="message-row assistant"><div className={`avatar message-avatar ${selected.color}`}>{selected.emoji}</div><div className="message-bubble typing"><i></i><i></i><i></i></div></div>}
              <div className="message-end" />
            </div>
            {notice && <div className="notice">{notice}</div>}
            <form className="composer" onSubmit={sendMessage}>
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Converse com ${selected.name}...`} aria-label="Sua mensagem" />
              <button className="send-button" type="submit" disabled={!draft.trim() || busy} aria-label="Enviar mensagem"><Send size={18} /></button>
            </form>
            <p className="disclaimer">A IA pode cometer erros. Não compartilhe informações pessoais ou segredos.</p>
          </section>
        ) : (
          <section className="explore-view">
            <div className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={14} /> SEU UNIVERSO DE CONVERSAS</div>
                <h1>Histórias incríveis<br />começam com um <span>olá.</span></h1>
                <p>Conheça personagens, crie novas personalidades e deixe a conversa fluir.</p>
                <button className="hero-button" onClick={() => setCreating(true)}>Criar meu personagem <Plus size={17} /></button>
              </div>
              <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-glow"></div><div className="hero-spark">✦</div><div className="hero-emoji">💬</div><div className="floating-chip chip-one">✨ imaginação</div><div className="floating-chip chip-two">♡ amizade</div></div>
            </div>
            <div className="section-heading">
              <div><div className="eyebrow muted">DESCUBRA</div><h2>Personagens para conhecer</h2></div>
              <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar personagens..." /><SlidersHorizontal size={16} /></div>
            </div>
            <div className="character-grid">
              {filtered.map(character => (
                <button className="character-card" key={character.id} onClick={() => openCharacter(character)}>
                  <div className={`card-art ${character.color}`}><div className="card-orbit"></div><span>{character.emoji}</span><div className="card-heart"><Heart size={16} /></div></div>
                  <div className="card-info"><div className="card-title">{character.name}<MoreHorizontal size={18} /></div><p>{character.tagline}</p><div className="card-footer"><span><MessageCircle size={13} /> Começar conversa</span><span className="sparkle-mini">✦</span></div></div>
                </button>
              ))}
              {filtered.length === 0 && <div className="empty-state">Nenhum personagem encontrado. Tente outra busca.</div>}
            </div>
            <footer className="page-footer">Costa <span>·</span> Um lugar para imaginar e conversar.</footer>
          </section>
        )}
      </main>
      {creating && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCreating(false); }}>
        <form className="create-modal" onSubmit={createCharacter}>
          <div className="modal-top"><div><div className="eyebrow">PERSONAGEM NOVO</div><h2>Crie alguém especial</h2></div><button type="button" className="icon-button" onClick={() => setCreating(false)}><X /></button></div>
          <label>Nome do personagem<input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex.: Alex" maxLength={40} required /></label>
          <label>Personalidade e instruções<textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descreva como ele fala, age e quais assuntos gosta..." rows={5} maxLength={1500} required /></label>
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setCreating(false)}>Cancelar</button><button className="hero-button" type="submit">Criar personagem <Sparkles size={16} /></button></div>
        </form>
      </div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
