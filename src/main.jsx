import React, { useEffect, useMemo, useState } from "react";
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
  const [activeChatId, setActiveChatId] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [messagesById, setMessagesById] = useState({});
  const [chatCounts, setChatCounts] = useState({});
  const [countedChatIds, setCountedChatIds] = useState(() => new Set());
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newGreeting, setNewGreeting] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newVisibility, setNewVisibility] = useState("private");
  const [characterBusy, setCharacterBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    fetch("/api/chat-counts").then(r => r.json()).then(data => {
      if (Array.isArray(data.counts)) setChatCounts(Object.fromEntries(data.counts.map(item => [item.character_id, Number(item.chat_count) || 0])));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => setAuthUser(data.user || null)).catch(() => {});
  }, []);

  async function submitAuth(event) {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setNotice("");
    try {
      const response = await fetch(authMode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword, displayName: authName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível entrar.");
      setAuthUser(data.user);
      setAuthMode(null); setAuthPassword(""); setAuthEmail(""); setAuthName("");
    } catch (error) { setNotice(error.message); }
    finally { setAuthBusy(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
  }

  useEffect(() => {
    if (!authUser) { setCharacters(starterCharacters); return; }
    fetch("/api/characters").then(r => r.json()).then(data => {
      if (Array.isArray(data.characters)) setCharacters([...data.characters.map(c => ({ ...c, emoji: "✨", color: "violet" })), ...starterCharacters]);
    }).catch(() => {});
  }, [authUser]);

  const filtered = useMemo(() => characters.filter(c =>
    `${c.name} ${c.tagline}`.toLowerCase().includes(search.toLowerCase())
  ), [characters, search]);

  const messages = activeChatId ? (messagesById[activeChatId] || []) : [];

  async function startConversation(character) {
    const chatId = crypto.randomUUID();
    setSelected(character);
    setShowHistory(false);
    setActiveChatId(chatId);
    setMessagesById(prev => ({ ...prev, [chatId]: [{ role: "assistant", content: character.greeting }] }));
    setDraft("");
    setMobileMenu(false);
    setNotice("");
    if (authUser) {
      try {
        const response = await fetch("/api/conversations", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: chatId, characterId: character.id, characterName: character.name, tagline: character.tagline, description: character.description, greeting: character.greeting, avatarUrl: character.avatar_url || character.avatarUrl, emoji: character.emoji, color: character.color })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível salvar a conversa.");
        setHistoryItems(prev => [{ id: chatId, character_id: character.id, character_name: character.name, character_tagline: character.tagline, character_avatar_url: character.avatar_url || character.avatarUrl, character_emoji: character.emoji, character_color: character.color, title: "Nova conversa", updated_at: new Date().toISOString() }, ...prev.filter(item => item.id !== chatId)]);
      } catch (error) { setNotice(error.message); }
    } else {
      setNotice("Entre na sua conta para salvar esta conversa permanentemente.");
    }
  }

  function openCharacter(character) { startConversation(character); }
  function startNewConversation() { if (selected) startConversation(selected); }

  async function loadHistory() {
    if (!authUser) { setAuthMode("login"); setNotice("Entre na sua conta para acessar seu histórico."); return; }
    setHistoryBusy(true); setNotice("");
    try {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o histórico.");
      setHistoryItems(data.conversations || []); setSelected(null); setShowHistory(true); setMobileMenu(false);
    } catch (error) { setNotice(error.message); }
    finally { setHistoryBusy(false); }
  }

  async function resumeConversation(item) {
    setHistoryBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/conversations/${item.id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível abrir a conversa.");
      const character = { id: data.conversation.character_id, name: data.conversation.character_name, tagline: data.conversation.character_tagline, description: data.conversation.character_description, greeting: data.conversation.character_greeting, avatar_url: data.conversation.character_avatar_url, emoji: data.conversation.character_emoji || "✨", color: data.conversation.character_color || "violet" };
      setSelected(character); setActiveChatId(item.id); setMessagesById(prev => ({ ...prev, [item.id]: data.messages || [] }));
      setShowHistory(false); setDraft(""); setMobileMenu(false);
    } catch (error) { setNotice(error.message); }
    finally { setHistoryBusy(false); }
  }

  function updateMessages(id, next) {
    setMessagesById(prev => ({ ...prev, [id]: next }));
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || !selected || busy) return;
    const conversationId = activeChatId;
    const characterForReply = selected;
    const next = [...messages, { role: "user", content }];
    updateMessages(conversationId, next);
    setDraft("");
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: characterForReply, messages: next })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao conversar com a IA.");
      updateMessages(conversationId, [...next, { role: "assistant", content: data.reply }]);
      if (authUser) fetch(`/api/conversations/${conversationId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content }, { role: "assistant", content: data.reply }] }) }).catch(() => {});
      if (!countedChatIds.has(conversationId)) {
        setCountedChatIds(prev => new Set([...prev, conversationId]));
        fetch("/api/chat-counts", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterId: characterForReply.id })
        }).then(r => r.json()).then(result => {
          if (result.chatCount != null) setChatCounts(prev => ({ ...prev, [characterForReply.id]: result.chatCount }));
        }).catch(() => {});
      }
    } catch (error) {
      setNotice(error.message || "Não foi possível enviar a mensagem.");
    } finally {
      setBusy(false);
    }
  }

  async function createCharacter(event) {
    event.preventDefault();
    if (!authUser) { setCreating(false); setAuthMode("login"); setNotice("Entre na sua conta para salvar seus personagens."); return; }
    if (characterBusy) return;
    setCharacterBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/characters", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, tagline: newTagline, description: newDescription, greeting: newGreeting, avatarUrl: newAvatar || null, visibility: newVisibility })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar o personagem.");
      const character = { ...data.character, avatarUrl: data.character.avatar_url, emoji: "✨", color: "violet" };
      setCharacters(prev => [character, ...prev.filter(c => c.id !== character.id)]);
      setCreating(false); setNewName(""); setNewTagline(""); setNewDescription(""); setNewGreeting(""); setNewAvatar(""); setNewVisibility("private");
      openCharacter(character);
    } catch (error) { setNotice(error.message); }
    finally { setCharacterBusy(false); }
  }

  async function chooseAvatar(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setNotice("Escolha uma imagem JPG, PNG ou WebP."); return; }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
      });
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 512 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        if (compressed.length > 700000) { setNotice("Essa imagem ficou muito grande. Escolha outra."); return; }
        setNewAvatar(compressed); setNotice("");
      };
      image.onerror = () => setNotice("Não foi possível abrir essa imagem.");
      image.src = dataUrl;
    } catch { setNotice("Não foi possível carregar a imagem."); }
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
          <button className={`nav-item ${showHistory ? "active" : ""}`} onClick={loadHistory}><MessageCircle size={18} /> Minhas conversas</button>
        </nav>
        <div className="sidebar-label">PERSONAGENS POPULARES</div>
        <div className="side-characters">
          {characters.slice(0, 5).map(character => (
            <button className={`side-character ${selected?.id === character.id ? "chosen" : ""}`} key={character.id} onClick={() => openCharacter(character)}>
              <span className={`avatar small ${character.color}`}>{(character.avatar_url || character.avatarUrl) ? <img src={character.avatar_url || character.avatarUrl} alt="" /> : character.emoji}</span><span>{character.name}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="profile-mini"><div className="profile-avatar">{(authUser?.display_name || "C").slice(0,1).toUpperCase()}</div><div><strong>{authUser?.display_name || "Visitante"}</strong><span>{authUser?.email || "Sem login"}</span></div></div>
          {authUser ? <button className="icon-button" title="Sair" onClick={logout}>Sair</button> : <button className="icon-button" title="Entrar" onClick={() => setAuthMode("login")}>Entrar</button>}
        </div>
      </aside>
      {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="breadcrumb">{selected ? <><button onClick={() => setSelected(null)}>Explorar</button><span>/</span><strong>{selected.name}</strong></> : <strong>Explorar personagens</strong>}</div>
          <div className="top-actions"><span className="beta-pill">BETA</span>{authUser ? <button className="top-avatar" title={authUser.email}>{(authUser.display_name || "C").slice(0,1).toUpperCase()}</button> : <button className="top-login" onClick={() => setAuthMode("login")}>Entrar</button>}</div>
        </header>
        {selected ? (
          <section className="chat-view">
            <div className="chat-heading">
              <button className="back-button" onClick={() => setSelected(null)}><ArrowLeft size={18} /> Voltar</button>
              <div className={`avatar large ${selected.color}`}>{(selected.avatar_url || selected.avatarUrl) ? <img src={selected.avatar_url || selected.avatarUrl} alt="" /> : selected.emoji}</div>
              <h1>{selected.name}</h1><p>{selected.tagline}</p>
              <div className="chat-meta"><span><span className="online-dot" /> Personagem de IA</span><span>·</span><span>Conversa privada nesta sessão</span></div>
              <button className="new-chat-button" onClick={startNewConversation}><Plus size={15} /> Nova conversa</button>
            </div>
            <div className="messages-area">
              {messages.map((message, index) => (
                <div className={`message-row ${message.role}`} key={index}>
                  {message.role === "assistant" && <div className={`avatar message-avatar ${selected.color}`}>{(selected.avatar_url || selected.avatarUrl) ? <img src={selected.avatar_url || selected.avatarUrl} alt="" /> : selected.emoji}</div>}
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
        ) : showHistory ? (
          <section className="explore-view history-view">
            <div className="section-heading history-heading"><div><div className="eyebrow muted">SEU ESPAÇO</div><h2>Minhas conversas</h2></div><button className="cancel-button" onClick={() => setShowHistory(false)}>Voltar para explorar</button></div>
            {historyBusy ? <div className="empty-state">Carregando conversas...</div> : historyItems.length === 0 ? <div className="empty-state">Você ainda não tem conversas salvas. Abra um personagem e comece a conversar!</div> : (
              <div className="history-list">
                {historyItems.map(item => <button className="history-item" key={item.id} onClick={() => resumeConversation(item)}>
                  <span className={`avatar small ${item.character_color || "violet"}`}>{item.character_avatar_url ? <img src={item.character_avatar_url} alt="" /> : item.character_emoji || "✨"}</span>
                  <span className="history-item-copy"><strong>{item.character_name}</strong><span>{item.title || "Nova conversa"}</span><small>{new Date(item.updated_at).toLocaleString("pt-BR")}</small></span><ArrowLeft className="history-open-icon" size={16} />
                </button>)}
              </div>
            )}
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
                  <div className={`card-art ${character.color}`}>{(character.avatar_url || character.avatarUrl) ? <img className="character-photo" src={character.avatar_url || character.avatarUrl} alt="" /> : <><div className="card-orbit"></div><span>{character.emoji}</span></>}<div className="card-heart"><Heart size={16} /></div></div>
                  <div className="card-info"><div className="card-title">{character.name}<MoreHorizontal size={18} /></div><p>{character.tagline}</p><div className="card-footer"><span><MessageCircle size={13} /> Começar conversa</span><span className="chat-count"><MessageCircle size={12} /> {chatCounts[character.id] || 0} chats</span></div></div>
                </button>
              ))}
              {filtered.length === 0 && <div className="empty-state">Nenhum personagem encontrado. Tente outra busca.</div>}
            </div>
            <footer className="page-footer">Costa <span>·</span> Um lugar para imaginar e conversar.</footer>
          </section>
        )}
      </main>
      {authMode && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAuthMode(null); }}>
        <form className="create-modal" onSubmit={submitAuth}>
          <div className="modal-top"><div><div className="eyebrow">SUA CONTA COSTA</div><h2>{authMode === "register" ? "Criar sua conta" : "Bem-vindo de volta"}</h2></div><button type="button" className="icon-button" onClick={() => setAuthMode(null)}><X /></button></div>
          {authMode === "register" && <label>Como podemos te chamar?<input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Seu nome" minLength={2} maxLength={50} required /></label>}
          <label>E-mail<input type="email" autoComplete="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="voce@exemplo.com" maxLength={254} required /></label>
          <label>Senha<input type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder={authMode === "register" ? "Mínimo de 10 caracteres" : "Sua senha"} minLength={authMode === "register" ? 10 : 1} maxLength={128} required /></label>
          {notice && <div className="notice">{notice}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}>{authMode === "register" ? "Já tenho conta" : "Criar conta"}</button><button className="hero-button" type="submit" disabled={authBusy}>{authBusy ? "Aguarde..." : authMode === "register" ? "Cadastrar" : "Entrar"}</button></div>
        </form>
      </div>}
      {creating && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCreating(false); }}>
        <form className="create-modal" onSubmit={createCharacter}>
          <div className="modal-top"><div><div className="eyebrow">PERSONAGEM NOVO</div><h2>Crie alguém especial</h2></div><button type="button" className="icon-button" onClick={() => setCreating(false)}><X /></button></div>
          <label>Nome do personagem<input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex.: Alex" maxLength={40} required /></label>
          <label>Frase curta (opcional)<input value={newTagline} onChange={e => setNewTagline(e.target.value)} placeholder="Ex.: Uma amiga divertida e curiosa" maxLength={100} /></label>
          <label>Saudação inicial (opcional)<textarea value={newGreeting} onChange={e => setNewGreeting(e.target.value)} placeholder="O que o personagem diz ao iniciar uma conversa?" rows={2} maxLength={500} /></label>
          <label>Personalidade e instruções<textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descreva como ele fala, age e quais assuntos gosta..." rows={5} maxLength={1500} required /></label>
          <label>Visibilidade<select value={newVisibility} onChange={e => setNewVisibility(e.target.value)}><option value="public">Public — qualquer pessoa pode encontrar</option><option value="private">Private — só você pode ver</option></select></label>
          <label>Foto de perfil (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => chooseAvatar(e.target.files?.[0])} /></label>
          {newAvatar && <div className="avatar-preview"><img src={newAvatar} alt="Prévia da foto do personagem" /><button type="button" className="cancel-button" onClick={() => setNewAvatar("")}>Remover foto</button></div>}
          {notice && <div className="notice">{notice}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setCreating(false)}>Cancelar</button><button className="hero-button" type="submit" disabled={characterBusy}>{characterBusy ? "Salvando..." : "Criar personagem"} <Sparkles size={16} /></button></div>
        </form>
      </div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
