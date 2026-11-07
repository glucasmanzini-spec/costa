import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, Plus, Compass, MessageCircle, Settings, Sparkles, Send, Users,
  ArrowLeft, Menu, X, SlidersHorizontal, Heart, MoreHorizontal, Image
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

function renderMessageContent(content) {
  const text = String(content ?? "");
  const tokenPattern = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(<React.Fragment key={key++}>{text.slice(lastIndex, match.index)}</React.Fragment>);
    const token = match[0];
    if (token.startsWith("**")) nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    else nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(<React.Fragment key={key++}>{text.slice(lastIndex)}</React.Fragment>);
  return nodes;
}

function App() {
  const [characters, setCharacters] = useState(starterCharacters);
  const [selected, setSelected] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSquad, setShowSquad] = useState(false);
  const [squadSetup, setSquadSetup] = useState(true);
  const [squadMembers, setSquadMembers] = useState([]);
  const [squadSelection, setSquadSelection] = useState([]);
  const [squadSearch, setSquadSearch] = useState("");
  const [squadMessages, setSquadMessages] = useState([]);
  const [squadBusy, setSquadBusy] = useState(false);
  const [squadAuto, setSquadAuto] = useState(false);
  const [squadSpeaker, setSquadSpeaker] = useState(0);
  const [squadDraft, setSquadDraft] = useState("");
  const [squadTopic, setSquadTopic] = useState("");
  const squadAutoRef = useRef(false);
  const squadMessagesRef = useRef([]);
  const squadSpeakerRef = useRef(0);
  const [favorites, setFavorites] = useState([]);
  const [characterComments, setCharacterComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentsBusy, setCommentsBusy] = useState(false);
  const [commentSending, setCommentSending] = useState(false);
  const [commentImage, setCommentImage] = useState("");
  const [replyToComment, setReplyToComment] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyImage, setReplyImage] = useState("");
  const [historyBusy, setHistoryBusy] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [activePersonaId, setActivePersonaId] = useState("");
  const [showPersonas, setShowPersonas] = useState(false);
  const [creatingPersona, setCreatingPersona] = useState(false);
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [personaAvatar, setPersonaAvatar] = useState("");
  const [personaBusy, setPersonaBusy] = useState(false);
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
  const [editingCharacterId, setEditingCharacterId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileCover, setProfileCover] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [profileResults, setProfileResults] = useState([]);
  const [profileBusy, setProfileBusy] = useState(false);

  useEffect(() => {
    if (!selected?.id) { setCharacterComments([]); setCommentDraft(""); return; }
    let cancelled = false;
    setCommentsBusy(true);
    fetch("/api/character-comments/" + encodeURIComponent(selected.id))
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Falha ao carregar comentários."); return data; })
      .then(data => { if (!cancelled) setCharacterComments(Array.isArray(data.comments) ? data.comments : []); })
      .catch(() => { if (!cancelled) setCharacterComments([]); })
      .finally(() => { if (!cancelled) setCommentsBusy(false); });
    return () => { cancelled = true; };
  }, [selected?.id]);

  useEffect(() => {
    if (!authUser) { setPersonas([]); setActivePersonaId(""); return; }
    fetch("/api/personas").then(r => r.json()).then(data => {
      if (Array.isArray(data.personas)) setPersonas(data.personas);
    }).catch(() => {});
  }, [authUser]);

  useEffect(() => {
    fetch("/api/chat-counts").then(r => r.json()).then(data => {
      if (Array.isArray(data.counts)) setChatCounts(Object.fromEntries(data.counts.map(item => [item.character_id, Number(item.chat_count) || 0])));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => setAuthUser(data.user || null)).catch(() => {});
  }, []);

  async function createPersona(event) {
    event.preventDefault();
    if (!authUser) { setCreatingPersona(false); setAuthMode("login"); setNotice("Entre na sua conta para criar personas."); return; }
    if (personaBusy) return;
    setPersonaBusy(true); setNotice("");
    try {
      const response = await fetch("/api/personas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: personaName, description: personaDescription, avatarUrl: personaAvatar || null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a persona.");
      setPersonas(prev => [data.persona, ...prev]); setActivePersonaId(data.persona.id);
      setPersonaName(""); setPersonaDescription(""); setPersonaAvatar(""); setCreatingPersona(false); setShowPersonas(true);
    } catch (error) { setNotice(error.message); }
    finally { setPersonaBusy(false); }
  }

  function openPersonas() {
    if (!authUser) { setAuthMode("login"); setNotice("Entre na sua conta para criar e gerenciar personas."); return; }
    setShowHistory(false); setShowFavorites(false); setShowPersonas(true); setSelected(null); setMobileMenu(false);
  }

  async function openOwnProfile() {
    if (!authUser) { setAuthMode("login"); return; }
    setProfileBusy(true); setNotice("");
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar seu perfil.");
      setProfileData(data.profile); setViewedProfile(null);
      setShowFavorites(false); setShowProfile(true); setShowHistory(false); setShowPersonas(false); setSelected(null); setMobileMenu(false);
    } catch (error) { setNotice(error.message); }
    finally { setProfileBusy(false); }
  }

  async function openUserProfile(username) {
    setProfileBusy(true); setNotice("");
    try {
      const response = await fetch("/api/users?username=" + encodeURIComponent(username));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Perfil não encontrado.");
      setViewedProfile(data.profile); setShowFavorites(false); setShowProfile(true); setShowHistory(false); setShowPersonas(false); setSelected(null); setMobileMenu(false);
    } catch (error) { setNotice(error.message); }
    finally { setProfileBusy(false); }
  }

  async function searchProfiles(value) {
    setProfileSearch(value);
    if (value.trim().length < 2) { setProfileResults([]); return; }
    try {
      const response = await fetch("/api/users?search=" + encodeURIComponent(value.trim()));
      const data = await response.json();
      if (response.ok) setProfileResults(data.users || []);
    } catch {}
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (profileBusy) return;
    setProfileBusy(true); setNotice("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: profileName, username: profileUsername, bio: profileBio, avatarUrl: profileAvatar || null, coverUrl: profileCover || null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar o perfil.");
      setProfileData(prev => ({ ...prev, ...data.profile, characters: prev?.characters || [], characters_count: prev?.characters_count || 0 }));
      setAuthUser(prev => ({ ...prev, display_name: data.profile.display_name, username: data.profile.username, bio: data.profile.bio, avatar_url: data.profile.avatar_url }));
      setEditingProfile(false);
    } catch (error) { setNotice(error.message); }
    finally { setProfileBusy(false); }
  }

  async function chooseProfileImage(file, setter, maxDimension, label) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setNotice("A imagem deve ter no máximo 20 MB."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setNotice("Escolha uma imagem JPG, PNG ou WebP."); return; }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
      });
      const image = new window.Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        if (compressed.length > 700000) { setNotice(`A ${label.toLowerCase()} ficou muito grande. Escolha outra imagem.`); return; }
        setter(compressed); setNotice("");
      };
      image.onerror = () => setNotice("Não foi possível abrir essa imagem.");
      image.src = dataUrl;
    } catch { setNotice("Não foi possível carregar essa imagem."); }
  }
  function chooseProfileAvatar(file) { chooseProfileImage(file, setProfileAvatar, 512, "Foto de perfil"); }
  function choosePersonaAvatar(file) { chooseProfileImage(file, setPersonaAvatar, 512, "Foto da persona"); }
  function chooseProfileCover(file) { chooseProfileImage(file, setProfileCover, 1200, "Capa"); }

  function beginProfileEdit() {
    const p = profileData || authUser || {};
    setProfileName(p.display_name || "");
    setProfileUsername(p.username || "");
    setProfileBio(p.bio || "");
    setProfileAvatar(p.avatar_url || "");
    setProfileCover(p.cover_url || "");
    setEditingProfile(true); setNotice("");
  }

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
    setShowProfile(false); setViewedProfile(null); setProfileData(null); setFavorites([]); setShowFavorites(false);
  }

  useEffect(() => {
    if (!authUser) { setCharacters(starterCharacters); setFavorites([]); return; }
    fetch("/api/favorites").then(r => r.json()).then(data => setFavorites(Array.isArray(data.favorites) ? data.favorites : [])).catch(() => setFavorites([]));
    fetch("/api/characters").then(r => r.json()).then(data => {
      if (Array.isArray(data.characters)) setCharacters([...data.characters.map(c => ({ ...c, emoji: "✨", color: "violet" })), ...starterCharacters]);
    }).catch(() => {});
  }, [authUser]);

  const filtered = useMemo(() => characters.filter(c =>
    `${c.name} ${c.tagline}`.toLowerCase().includes(search.toLowerCase())
  ), [characters, search]);

  async function toggleFavorite(character) {
    if (!authUser) { setAuthMode("login"); setNotice("Entre na sua conta para favoritar personagens."); return; }
    const isFavorite = favorites.some(item => item.id === character.id);
    const response = await fetch("/api/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: character.id })
    });
    const data = await response.json();
    if (!response.ok) { setNotice(data.error || "Não foi possível atualizar os favoritos."); return; }
    setFavorites(prev => isFavorite ? prev.filter(item => item.id !== character.id) : [character, ...prev]);
  }


  function openSquadSetup() {
    setSelected(null); setShowHistory(false); setShowFavorites(false); setShowProfile(false); setShowPersonas(false);
    setShowSquad(true); setSquadSetup(true); setSquadAuto(false); squadAutoRef.current = false; setSquadSelection([]); setSquadSearch(""); setSquadMessages([]); setMobileMenu(false);
  }

  const filteredSquadCharacters = useMemo(() => characters.filter(character =>
    `${character.name} ${character.tagline || ""} ${character.creator_username || ""}`.toLowerCase().includes(squadSearch.trim().toLowerCase())
  ), [characters, squadSearch]);

  function toggleSquadSelection(character) {
    setSquadSelection(prev => prev.some(item => item.id === character.id)
      ? prev.filter(item => item.id !== character.id)
      : prev.length < 4 ? [...prev, character] : prev);
  }

  function beginSquad() {
    if (squadSelection.length < 2 || squadSelection.length > 4) return;
    setSquadMembers(squadSelection); setSquadMessages(squadTopic.trim()
      ? [{ role: "user", speaker: "Você", content: "Contexto inicial da sala: " + squadTopic.trim() }]
      : []);
    squadMessagesRef.current = squadTopic.trim() ? [{ role: "user", speaker: "Você", content: "Contexto inicial da sala: " + squadTopic.trim() }] : [];
    squadSpeakerRef.current = 0;
    setSquadSpeaker(0); setSquadSetup(false); setSquadAuto(false);
  }

  async function squadNextTurn(userText = "") {
    if (squadBusy || squadMembers.length < 2) return;
    setSquadBusy(true);
    const currentMessages = userText
      ? [...squadMessagesRef.current, { role: "user", speaker: "Você", content: userText }]
      : squadMessagesRef.current;
    if (userText) { squadMessagesRef.current = currentMessages; setSquadMessages(currentMessages); }
    const speakerIndex = squadSpeakerRef.current % squadMembers.length;
    try {
      const response = await fetch("/api/squad-turn", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: squadMembers, speakerIndex, messages: currentMessages.map(m => ({ role: m.role === "user" ? "user" : "assistant", content: (m.speaker ? m.speaker + ": " : "") + m.content })) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar a fala.");
      const nextMessages = [...currentMessages, { role: "assistant", speaker: squadMembers[speakerIndex].name, character: squadMembers[speakerIndex], content: data.reply }];
      squadMessagesRef.current = nextMessages; setSquadMessages(nextMessages);
      squadSpeakerRef.current = (speakerIndex + 1) % squadMembers.length; setSquadSpeaker(squadSpeakerRef.current);
    } catch (error) { setNotice(error.message); squadAutoRef.current = false; setSquadAuto(false); }
    finally { setSquadBusy(false); }
  }

  async function runSquadAuto() {
    if (squadBusy) return;
    squadAutoRef.current = true; setSquadAuto(true);
    for (let turn = 0; turn < 20 && squadAutoRef.current; turn++) {
      if (turn > 0) await new Promise(resolve => setTimeout(resolve, 1100));
      if (!squadAutoRef.current) break;
      await squadNextTurn();
    }
    squadAutoRef.current = false; setSquadAuto(false);
  }

  function sendSquadMessage(event) {
    event?.preventDefault();
    const content = squadDraft.trim();
    if (!content || squadBusy) return;
    setSquadDraft("");
    squadNextTurn(content);
  }

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
    if (authUser) setBusy(true);
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
      finally { setBusy(false); }
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
      setHistoryItems(data.conversations || []); setSelected(null); setShowFavorites(false); setShowHistory(true); setMobileMenu(false);
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

  function readCommentImage(file, setter) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setNotice("Escolha um arquivo de imagem."); return; }
    if (file.size > 20 * 1024 * 1024) { setNotice("A imagem deve ter no máximo 20 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) { setNotice("Não foi possível processar essa imagem."); return; }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.78);
        if (compressed.length > 1400000) { setNotice("A imagem ficou muito grande após a compressão. Escolha outra."); return; }
        setter(compressed); setNotice("");
      };
      image.onerror = () => setNotice("Não foi possível abrir a imagem.");
      image.src = String(reader.result || "");
    };
    reader.onerror = () => setNotice("Não foi possível ler a imagem.");
    reader.readAsDataURL(file);
  }

  async function publishComment(content, imageUrl, parentId = null) {
    if ((!content.trim() && !imageUrl) || commentSending || !selected?.id) return;
    if (!authUser) { setAuthMode("login"); setNotice("Entre na sua conta para comentar."); return; }
    setCommentSending(true);
    try {
      const response = await fetch("/api/character-comments/" + encodeURIComponent(selected.id), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: content.trim(), image_url: imageUrl || "", parent_id: parentId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível publicar.");
      setCharacterComments(prev => [...prev, data.comment]);
      if (parentId) { setReplyDraft(""); setReplyImage(""); setReplyToComment(null); }
      else { setCommentDraft(""); setCommentImage(""); }
    } catch (error) { setNotice(error.message); }
    finally { setCommentSending(false); }
  }

  async function sendCharacterComment(event) {
    event.preventDefault();
    await publishComment(commentDraft, commentImage);
  }

  async function sendCommentReply(event) {
    event.preventDefault();
    if (!replyToComment) return;
    await publishComment(replyDraft, replyImage, replyToComment.id);
  }

  async function deleteCharacterComment(comment) {
    if (!window.confirm("Excluir este comentário?")) return;
    try {
      const response = await fetch("/api/character-comments/" + encodeURIComponent(selected.id) + "/" + encodeURIComponent(comment.id), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir o comentário.");
      setCharacterComments(prev => prev.filter(item => item.id !== comment.id));
    } catch (error) { setNotice(error.message); }
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
        body: JSON.stringify({ character: characterForReply, persona: personas.find(p => p.id === activePersonaId) || null, messages: next })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao conversar com a IA.");
      updateMessages(conversationId, [...next, { role: "assistant", content: data.reply }]);
      if (authUser) {
        const saved = await fetch(`/api/conversations/${conversationId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content }, { role: "assistant", content: data.reply }] }) });
        if (!saved.ok) setNotice("A resposta chegou, mas não foi possível salvá-la no histórico. Tente novamente.");
      }
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

  function beginCharacterEdit(character) {
    setEditingCharacterId(character.id); setNewName(character.name || ""); setNewTagline(character.tagline || "");
    setNewDescription(character.description || ""); setNewGreeting(character.greeting || "");
    setNewAvatar(character.avatar_url || character.avatarUrl || ""); setNewVisibility(character.visibility || "private");
    setNotice(""); setCreating(true);
  }

  async function deleteCharacter(character) {
    if (!window.confirm('Tem certeza que deseja excluir o personagem "' + character.name + '"? Essa ação não pode ser desfeita.')) return;
    try {
      const response = await fetch("/api/characters/" + encodeURIComponent(character.id), { method: "DELETE" });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Não foi possível excluir o personagem.");
      setCharacters(prev => prev.filter(item => item.id !== character.id)); setFavorites(prev => prev.filter(item => item.id !== character.id));
      setNotice("Personagem excluído.");
    } catch (error) { setNotice(error.message); }
  }

  async function createCharacter(event) {
    event.preventDefault();
    if (!authUser) { setCreating(false); setAuthMode("login"); setNotice("Entre na sua conta para salvar seus personagens."); return; }
    if (characterBusy) return;
    setCharacterBusy(true); setNotice("");
    const editing = Boolean(editingCharacterId);
    try {
      const response = await fetch(editing ? "/api/characters/" + encodeURIComponent(editingCharacterId) : "/api/characters", {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, tagline: newTagline, description: newDescription, greeting: newGreeting, avatarUrl: newAvatar || null, visibility: newVisibility })
      });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Não foi possível salvar o personagem.");
      const character = { ...data.character, avatarUrl: data.character.avatar_url, emoji: "✨", color: "violet" };
      if (editing) setCharacters(prev => prev.map(item => item.id === character.id ? { ...item, ...character } : item));
      else setCharacters(prev => [character, ...prev.filter(item => item.id !== character.id)]);
      setCreating(false); setEditingCharacterId(null); setNewName(""); setNewTagline(""); setNewDescription(""); setNewGreeting(""); setNewAvatar(""); setNewVisibility("private");
      if (!editing) openCharacter(character); else setNotice("Personagem atualizado com sucesso!");
    } catch (error) { setNotice(error.message); } finally { setCharacterBusy(false); }
  }

  async function chooseAvatar(file) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setNotice("A imagem deve ter no máximo 20 MB."); return; }
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
          <button className={!selected && !showProfile && !showHistory && !showPersonas && !showSquad ? "nav-item active" : "nav-item"} onClick={() => { setSelected(null); setShowProfile(false); setShowFavorites(false); setShowHistory(false); setShowPersonas(false); setMobileMenu(false); }}><Compass size={18} /> Explorar</button>
          <button className={`nav-item ${showSquad ? "active" : ""}`} onClick={openSquadSetup}><Users size={18} /> Costa Squad</button>
          <button className={`nav-item ${showHistory ? "active" : ""}`} onClick={loadHistory}><MessageCircle size={18} /> Minhas conversas</button>
          <button className={`nav-item ${showPersonas ? "active" : ""}`} onClick={openPersonas}><Sparkles size={18} /> Minhas personas</button>
          <button className={`nav-item ${showFavorites ? "active" : ""}`} onClick={() => { if (!authUser) { setAuthMode("login"); return; } setShowFavorites(true); setShowProfile(false); setShowHistory(false); setShowPersonas(false); setSelected(null); setMobileMenu(false); }}><Heart size={18} /> Meus favoritos <span className="favorite-nav-count">{favorites.length}</span></button>
          <button className={`nav-item ${showProfile ? "active" : ""}`} onClick={openOwnProfile}><Heart size={18} /> Meu perfil</button>
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
          <button className="profile-mini profile-mini-button" onClick={openOwnProfile}><div className="profile-avatar">{authUser?.avatar_url ? <img src={authUser.avatar_url} alt="" /> : (authUser?.display_name || "C").slice(0,1).toUpperCase()}</div><div><strong>{authUser?.display_name || "Visitante"}</strong><span>{authUser?.username ? "@" + authUser.username : authUser?.email || "Sem login"}</span></div></button>
          {authUser ? <button className="icon-button" title="Sair" onClick={logout}>Sair</button> : <button className="icon-button" title="Entrar" onClick={() => setAuthMode("login")}>Entrar</button>}
        </div>
      </aside>
      {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="breadcrumb">{selected ? <><button onClick={() => setSelected(null)}>Explorar</button><span>/</span><strong>{selected.name}</strong></> : <strong>Explorar personagens</strong>}</div>
          <div className="top-actions"><span className="beta-pill">BETA</span>{authUser ? <button className="top-avatar" title="Meu perfil" onClick={openOwnProfile}>{authUser.avatar_url ? <img src={authUser.avatar_url} alt="" /> : (authUser.display_name || "C").slice(0,1).toUpperCase()}</button> : <button className="top-login" onClick={() => setAuthMode("login")}>Entrar</button>}</div>
        </header>
        {showSquad ? (
          <section className="explore-view squad-view">
            {squadSetup ? <>
              <div className="section-heading"><div><div className="eyebrow muted">CONVERSAS EM GRUPO</div><h2>Monte sua Costa Squad</h2></div></div>
              <p className="persona-help">Escolha de 2 a 4 personagens. Eles vão conversar entre si — e você pode entrar na conversa quando quiser.</p>
              <label className="squad-topic-label">Tema ou situação inicial (opcional)<input value={squadTopic} onChange={e => setSquadTopic(e.target.value)} placeholder="Ex.: quatro amigos presos em uma estação espacial..." maxLength={500} /></label>
              <div className="section-heading"><div><div className="eyebrow muted">PERSONAGENS</div><h2>Escolha até 4 bots ({squadSelection.length}/4)</h2></div></div>
              <div className="search-box squad-search"><Search size={17} /><input value={squadSearch} onChange={e => setSquadSearch(e.target.value)} placeholder="Pesquisar bot pelo nome ou criador..." aria-label="Pesquisar bots para a Squad" /><span className="squad-search-count">{filteredSquadCharacters.length}</span></div>
              <div className="character-grid squad-picker">
                {filteredSquadCharacters.map(character => <button type="button" className={`character-card squad-pick ${squadSelection.some(item => item.id === character.id) ? "squad-picked" : ""}`} key={character.id} onClick={() => toggleSquadSelection(character)}>
                  <div className={`card-art ${character.color}`}>{(character.avatar_url || character.avatarUrl) ? <img className="character-photo" src={character.avatar_url || character.avatarUrl} alt="" /> : <span>{character.emoji || "✨"}</span>}</div>
                  <div className="card-info"><div className="card-title">{character.name}{squadSelection.some(item => item.id === character.id) ? " ✓" : ""}</div><p>{character.tagline}</p></div>
                </button>)}
                {filteredSquadCharacters.length === 0 && <div className="empty-state">Nenhum bot encontrado com esse nome. Tente outra pesquisa.</div>}
              </div>
              {squadSelection.length < 2 && <p className="field-help">Selecione pelo menos 2 personagens para começar.</p>}
              <button className="hero-button" onClick={beginSquad} disabled={squadSelection.length < 2}>Criar Squad com {squadSelection.length} personagens <Users size={17} /></button>
            </> : <>
              <div className="section-heading squad-room-heading"><div><div className="eyebrow muted">COSTA SQUAD · SALA AO VIVO</div><h2>{squadMembers.map(m => m.name).join(" · ")}</h2></div><button className="cancel-button" onClick={openSquadSetup}>Trocar personagens</button></div>
              <div className="squad-roster">{squadMembers.map((member, index) => <div className="squad-roster-item" key={member.id}><span className={`avatar small ${member.color}`}>{member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.emoji || "✨"}</span><strong>{member.name}</strong><small>{index === squadSpeaker ? "Próximo a falar" : "Na sala"}</small></div>)}</div>
              <div className="squad-messages">
                {squadMessages.map((message, index) => <div className={`squad-message ${message.role === "user" ? "squad-user" : ""}`} key={index}>
                  {message.role !== "user" && <strong>{message.speaker}</strong>}
                  {message.role === "user" && <strong>Você</strong>}
                  <p>{message.content}</p>
                </div>)}
                {squadBusy && <div className="squad-message"><strong>{squadMembers[squadSpeaker]?.name || "Personagem"}</strong><p className="typing"><i></i><i></i><i></i></p></div>}
                {squadMessages.length === 0 && <div className="empty-state">A sala está pronta! Clique em “Próxima fala” ou inicie a conversa automática.</div>}
              </div>
              {notice && <div className="notice">{notice}</div>}
              <div className="squad-controls">
                <button className="cancel-button" disabled={squadBusy} onClick={() => squadNextTurn()}>Próxima fala</button>
                <button className="hero-button" disabled={squadBusy} onClick={() => { if (squadAuto) { squadAutoRef.current = false; setSquadAuto(false); } else runSquadAuto(); }}>{squadAuto ? "Pausar conversa" : "▶ Conversar automaticamente"}</button>
              </div>
              <form className="composer" onSubmit={sendSquadMessage}><input value={squadDraft} onChange={e => setSquadDraft(e.target.value)} placeholder="Entre na conversa..." /><button className="send-button" type="submit" disabled={!squadDraft.trim() || squadBusy}><Send size={18} /></button></form>
              <p className="disclaimer">Os personagens falam em rodízio. Você pode assistir ou participar a qualquer momento.</p>
            </>}
          </section>
        ) : selected ? (
          <section className="chat-view">
            <div className="chat-heading">
              <button className="back-button" onClick={() => setSelected(null)}><ArrowLeft size={18} /> Voltar</button>
              <div className={`avatar large ${selected.color}`}>{(selected.avatar_url || selected.avatarUrl) ? <img src={selected.avatar_url || selected.avatarUrl} alt="" /> : selected.emoji}</div>
              <h1>{selected.name}</h1><p>{selected.tagline}</p>
              <div className="chat-meta"><span><span className="online-dot" /> Personagem de IA</span><span>·</span><span>{authUser ? "Histórico salvo na sua conta" : "Conversa não salva"}</span></div>
              <button className="new-chat-button" onClick={startNewConversation} disabled={busy}><Plus size={15} /> Nova conversa</button>
              <div className="persona-selector-wrap">
                <label className="persona-selector">Conversar como
                  <select value={activePersonaId} onChange={e => setActivePersonaId(e.target.value)}>
                    <option value="">Eu mesmo (sem persona)</option>
                    {personas.map(persona => <option key={persona.id} value={persona.id}>{persona.name}</option>)}
                  </select>
                </label>
                {(() => { const persona = personas.find(persona => persona.id === activePersonaId); const avatar = persona?.avatar_url || authUser?.avatar_url; return <div className="chat-identity-preview"><span className="chat-identity-avatar">{avatar ? <img src={avatar} alt="" /> : (persona?.name || authUser?.display_name || "Você").slice(0,1).toUpperCase()}</span><span>{persona ? persona.name : authUser?.display_name || "Você"}</span></div>; })()}
              </div>
            </div>
            <div className="chat-content-layout">
              <div className="chat-main-column">
            <div className="messages-area">
              {messages.map((message, index) => (
                <div className={`message-row ${message.role}`} key={index}>
                  {message.role === "assistant" && <div className={`avatar message-avatar ${selected.color}`}>{(selected.avatar_url || selected.avatarUrl) ? <img src={selected.avatar_url || selected.avatarUrl} alt="" /> : selected.emoji}</div>}
                  <div className="message-bubble">{renderMessageContent(message.content)}</div>
                  {message.role === "user" && <div className="chat-user-avatar">{(personas.find(persona => persona.id === activePersonaId)?.avatar_url || authUser?.avatar_url) ? <img src={personas.find(persona => persona.id === activePersonaId)?.avatar_url || authUser?.avatar_url} alt="" /> : (personas.find(persona => persona.id === activePersonaId)?.name || authUser?.display_name || "Você").slice(0,1).toUpperCase()}</div>}
                </div>
              ))}
              {busy && <div className="message-row assistant"><div className={`avatar message-avatar ${selected.color}`}>{(selected.avatar_url || selected.avatarUrl) ? <img src={selected.avatar_url || selected.avatarUrl} alt="" /> : selected.emoji}</div><div className="message-bubble typing"><i></i><i></i><i></i></div></div>}
              <div className="message-end" />
            </div>
            {notice && <div className="notice">{notice}</div>}
            <form className="composer" onSubmit={sendMessage}>
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Converse com ${selected.name}...`} aria-label="Sua mensagem" />
              <button className="send-button" type="submit" disabled={!draft.trim() || busy} aria-label="Enviar mensagem"><Send size={18} /></button>
            </form>
            <p className="disclaimer">A IA pode cometer erros. Não compartilhe informações pessoais ou segredos.</p>
              </div>
            <section className="character-comments">
              <div className="comments-heading"><div><h2>Comentários</h2><span>{characterComments.length} {characterComments.length === 1 ? "comentário" : "comentários"}</span></div></div>
              <form className="comment-composer" onSubmit={sendCharacterComment}>
                <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)} maxLength={500} placeholder={authUser ? "Escreva um comentário..." : "Entre para comentar..."} aria-label="Escreva um comentário" />
                <label className="comment-image-button" title="Anexar imagem"> <Image size={15} /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => readCommentImage(e.target.files?.[0], setCommentImage)} /></label>
                <button type="submit" disabled={(!commentDraft.trim() && !commentImage) || commentSending}>{commentSending ? "..." : "Enviar"}</button>
              </form>
              {commentImage && <div className="comment-image-preview"><img src={commentImage} alt="Prévia do anexo" /><button type="button" onClick={() => setCommentImage("")}>Remover</button></div>}
              <div className="comment-list">
                {commentsBusy ? <div className="comments-empty">Carregando comentários...</div> : characterComments.filter(comment => !comment.parent_id).length === 0 ? <div className="comments-empty">Ainda não há comentários. Seja a primeira pessoa a comentar!</div> : characterComments.filter(comment => !comment.parent_id).map(comment => (
                  <article className="comment-thread" key={comment.id}>
                    <div className="comment-item">
                      <div className="comment-avatar">{comment.avatar_url ? <img src={comment.avatar_url} alt="" /> : (comment.display_name || "?").slice(0, 1).toUpperCase()}</div>
                      <div className="comment-content"><div className="comment-meta"><strong>{comment.display_name || "Usuário"}</strong><span>@{comment.username || "usuario"}</span><time>{new Date(comment.created_at).toLocaleDateString("pt-BR")}</time></div>{comment.content && <p>{comment.content}</p>}{comment.image_url && <img className="comment-attached-image" src={comment.image_url} alt="Imagem anexada ao comentário" />}</div>
                      <div className="comment-item-actions">{comment.can_delete && <button className="comment-delete" type="button" onClick={() => deleteCharacterComment(comment)} title="Excluir comentário"><X size={14} /></button>}<button className="comment-reply-button" type="button" onClick={() => { setReplyToComment(comment); setReplyDraft(""); setReplyImage(""); }}>Responder</button></div>
                    </div>
                    {characterComments.filter(reply => reply.parent_id === comment.id).map(reply => <div className="comment-item comment-reply" key={reply.id}>
                      <div className="comment-avatar">{reply.avatar_url ? <img src={reply.avatar_url} alt="" /> : (reply.display_name || "?").slice(0, 1).toUpperCase()}</div>
                      <div className="comment-content"><div className="comment-meta"><strong>{reply.display_name || "Usuário"}</strong><span>@{reply.username || "usuario"}</span><time>{new Date(reply.created_at).toLocaleDateString("pt-BR")}</time></div>{reply.content && <p>{reply.content}</p>}{reply.image_url && <img className="comment-attached-image" src={reply.image_url} alt="Imagem anexada à resposta" />}</div>
                      {reply.can_delete && <button className="comment-delete" type="button" onClick={() => deleteCharacterComment(reply)} title="Excluir resposta"><X size={14} /></button>}
                    </div>)}
                    {replyToComment?.id === comment.id && <form className="comment-composer reply-composer" onSubmit={sendCommentReply}>
                      <input value={replyDraft} onChange={e => setReplyDraft(e.target.value)} maxLength={500} placeholder="Escreva sua resposta..." autoFocus />
                      <label className="comment-image-button" title="Anexar imagem"><Image size={14} /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => readCommentImage(e.target.files?.[0], setReplyImage)} /></label>
                      <button type="submit" disabled={(!replyDraft.trim() && !replyImage) || commentSending}>Responder</button><button type="button" className="reply-cancel" onClick={() => setReplyToComment(null)}>×</button>
                    </form>}
                    {replyToComment?.id === comment.id && replyImage && <div className="comment-image-preview"><img src={replyImage} alt="Prévia da resposta" /><button type="button" onClick={() => setReplyImage("")}>Remover</button></div>}
                  </article>
                ))}
              </div>
            </section>
            </div>
          </section>
        ) : showFavorites ? (
          <section className="explore-view history-view">
            <div className="section-heading"><div><div className="eyebrow muted">SUA COLEÇÃO</div><h2>Meus favoritos</h2></div></div>
            <p className="persona-help">Personagens que você salvou com ❤️. Só você pode ver esta lista.</p>
            <div className="character-grid">
              {favorites.map(character => <div className="character-card" key={character.id}>
                <div className={`card-art violet favorite-card-art`} onClick={() => openCharacter({ ...character, emoji: "✨", color: "violet" })}>{character.avatar_url ? <img className="character-photo" src={character.avatar_url} alt="" /> : <><div className="card-orbit"></div><span>✨</span></>}</div>
                <button className="favorite-toggle favorited" aria-label="Remover dos favoritos" title="Remover dos favoritos" onClick={() => toggleFavorite(character)}><Heart size={18} fill="currentColor" /></button>
                <div className="card-info" onClick={() => openCharacter({ ...character, emoji: "✨", color: "violet" })}><div className="card-title">{character.name}</div><small className="character-creator">Criado por @{character.creator_username || "costa"}</small><p>{character.tagline}</p><div className="card-footer">Começar conversa</div></div>
              </div>)}
              {favorites.length === 0 && <div className="empty-state">Você ainda não favoritou nenhum personagem. Explore e toque no coração de um bot!</div>}
            </div>
          </section>
        ) : showProfile ? (
          <section className="explore-view profile-view">
            <div className="section-heading history-heading"><div><div className="eyebrow muted">COMUNIDADE COSTA</div><h2>{viewedProfile ? "Perfil de usuário" : "Meu perfil"}</h2></div>{!viewedProfile && <button className="hero-button" onClick={beginProfileEdit}>Editar perfil</button>}</div>
            {!viewedProfile && <div className="profile-discover"><div className="search-box"><Search size={17} /><input value={profileSearch} onChange={e => searchProfiles(e.target.value)} placeholder="Buscar pessoas por nome ou @usuário..." /></div>
              {profileResults.length > 0 && <div className="profile-results">{profileResults.map(person => <button className="profile-result" key={person.username} onClick={() => { setProfileSearch(""); setProfileResults([]); openUserProfile(person.username); }}><span className="profile-avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" /> : person.display_name.slice(0,1).toUpperCase()}</span><span><strong>{person.display_name}</strong><small>@{person.username}</small></span></button>)}</div>}
            </div>}
            {profileBusy && <div className="empty-state">Carregando perfil...</div>}
            {(viewedProfile || profileData) && <div className="user-profile-card">
              <div className="user-profile-cover" style={(viewedProfile || profileData).cover_url ? { backgroundImage: `url("${(viewedProfile || profileData).cover_url}")` } : undefined}></div>
              <div className="user-profile-main">
                <div className="user-profile-avatar">{(viewedProfile || profileData).avatar_url ? <img src={(viewedProfile || profileData).avatar_url} alt="" /> : (viewedProfile || profileData).display_name.slice(0,1).toUpperCase()}</div>
                <h1>{(viewedProfile || profileData).display_name}</h1>
                <div className="user-profile-handle">@{(viewedProfile || profileData).username}</div>
                <p>{(viewedProfile || profileData).bio || "Este usuário ainda não adicionou uma biografia."}</p>
                <div className="profile-stats"><div><strong>{(viewedProfile || profileData).characters_count ?? "—"}</strong><span>Personagens públicos</span></div><div><strong>{new Date((viewedProfile || profileData).created_at || Date.now()).toLocaleDateString("pt-BR")}</strong><span>No Costa desde</span></div></div>
                {viewedProfile && <button className="cancel-button" onClick={() => { setViewedProfile(null); setProfileResults([]); }}>Voltar ao meu perfil</button>}
              </div>
            </div>}
            {(viewedProfile || profileData)?.characters?.length > 0 && <div className="profile-character-section"><div className="section-heading"><div><div className="eyebrow muted">CRIAÇÕES</div><h2>Personagens públicos</h2></div></div><div className="character-grid">{(viewedProfile || profileData).characters.map(character => <button className="character-card" key={character.id} onClick={() => openCharacter({ ...character, description: "", greeting: "Olá! Sobre o que vamos conversar?", emoji: "✨", color: "violet" })}><div className="card-art violet">{character.avatar_url ? <img className="character-photo" src={character.avatar_url} alt="" /> : <span>✨</span>}</div><div className="card-info"><div className="card-title">{character.name}</div><small className="character-creator">Criado por @{character.creator_username || (viewedProfile || profileData).username}</small><p>{character.tagline}</p><div className="card-footer">Começar conversa</div></div></button>)}</div></div>}
            {notice && <div className="notice">{notice}</div>}
          </section>
        ) : showPersonas ? (
          <section className="explore-view history-view">
            <div className="section-heading history-heading"><div><div className="eyebrow muted">SUA IDENTIDADE NAS CONVERSAS</div><h2>Minhas personas</h2></div><button className="hero-button" onClick={() => { setPersonaName(""); setPersonaDescription(""); setCreatingPersona(true); }}><Plus size={16} /> Criar persona</button></div>
            <p className="persona-help">Crie identidades diferentes para usar nas conversas. Cada persona tem seu próprio nome e descrição.</p>
            {personas.length === 0 ? <div className="empty-state">Você ainda não criou nenhuma persona.</div> : <div className="persona-grid">
              {personas.map(persona => <div className="persona-card" key={persona.id}><div className="persona-card-icon">{persona.avatar_url ? <img src={persona.avatar_url} alt="" /> : <Sparkles size={19} />}</div><strong>{persona.name}</strong><p>{persona.description}</p><button className={activePersonaId === persona.id ? "persona-active" : "cancel-button"} onClick={() => setActivePersonaId(persona.id)}>{activePersonaId === persona.id ? "Selecionada" : "Usar nas conversas"}</button></div>)}
            </div>}
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
                <div className="character-card" key={character.id}>
                  <div className={`card-art ${character.color}`} onClick={() => openCharacter(character)}>{(character.avatar_url || character.avatarUrl) ? <img className="character-photo" src={character.avatar_url || character.avatarUrl} alt="" /> : <><div className="card-orbit"></div><span>{character.emoji}</span></>}</div>
                  <button className={`favorite-toggle ${favorites.some(item => item.id === character.id) ? "favorited" : ""}`} aria-label={favorites.some(item => item.id === character.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} title={favorites.some(item => item.id === character.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={() => toggleFavorite(character)}><Heart size={18} fill={favorites.some(item => item.id === character.id) ? "currentColor" : "none"} /></button>
                  <div className="card-info" onClick={() => openCharacter(character)}><div className="card-title">{character.name}<MoreHorizontal size={18} /></div><small className="character-creator">Criado por @{character.creator_username || "costa"}</small><p>{character.tagline}</p><div className="card-footer"><span><MessageCircle size={13} /> Começar conversa</span><span className="chat-count"><MessageCircle size={12} /> {chatCounts[character.id] || 0} chats</span></div>{character.is_owner === 1 && <div className="character-owner-actions"><button type="button" onClick={e => { e.stopPropagation(); beginCharacterEdit(character); }}>Editar</button><button type="button" className="danger" onClick={e => { e.stopPropagation(); deleteCharacter(character); }}>Excluir</button></div>}</div>
                </div>
              ))}
              {filtered.length === 0 && <div className="empty-state">Nenhum personagem encontrado. Tente outra busca.</div>}
            </div>
            <footer className="page-footer">Costa <span>·</span> Um lugar para imaginar e conversar.</footer>
          </section>
        )}
      </main>
      {creatingPersona && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setCreatingPersona(false); }}>
        <form className="create-modal" onSubmit={createPersona}>
          <div className="modal-top"><div><div className="eyebrow">NOVA PERSONA</div><h2>Crie sua identidade</h2></div><button type="button" className="icon-button" onClick={() => setCreatingPersona(false)}><X /></button></div>
          <label>Foto de perfil da persona<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => choosePersonaAvatar(e.target.files?.[0])} /></label>
          {personaAvatar && <div className="avatar-preview"><img src={personaAvatar} alt="Prévia da foto da persona" /><button type="button" className="cancel-button" onClick={() => setPersonaAvatar("")}>Remover foto</button></div>}
          <label>Nome da persona<input value={personaName} onChange={e => setPersonaName(e.target.value)} placeholder="Ex.: Alex, aventureiro..." maxLength={40} required /></label>
          <label>Descrição<textarea value={personaDescription} onChange={e => setPersonaDescription(e.target.value)} placeholder="Descreva quem você é nessa conversa, sua personalidade, história e como o personagem deve te enxergar..." rows={5} maxLength={1200} required /></label>
          {notice && <div className="notice">{notice}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setCreatingPersona(false)}>Cancelar</button><button className="hero-button" type="submit" disabled={personaBusy}>{personaBusy ? "Salvando..." : "Criar persona"} <Sparkles size={16} /></button></div>
        </form>
      </div>}
      {editingProfile && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditingProfile(false); }}>
        <form className="create-modal" onSubmit={saveProfile}>
          <div className="modal-top"><div><div className="eyebrow">SUA CONTA COSTA</div><h2>Editar perfil</h2></div><button type="button" className="icon-button" onClick={() => setEditingProfile(false)}><X /></button></div>
          <label>Foto de perfil<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => chooseProfileAvatar(e.target.files?.[0])} /></label>
          {profileAvatar && <div className="avatar-preview"><img src={profileAvatar} alt="Prévia da foto de perfil" /><button type="button" className="cancel-button" onClick={() => setProfileAvatar("")}>Remover foto</button></div>}
          <label>Capa do perfil<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => chooseProfileCover(e.target.files?.[0])} /></label>
          {profileCover && <div className="avatar-preview profile-cover-preview"><img src={profileCover} alt="Prévia da capa" /><button type="button" className="cancel-button" onClick={() => setProfileCover("")}>Remover capa</button></div>}
          <label>Nome de exibição<input value={profileName} onChange={e => setProfileName(e.target.value)} minLength={2} maxLength={50} required /></label>
          <label>@Usuário<input value={profileUsername} onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} minLength={3} maxLength={20} required /><small className="field-help">3–20 caracteres: letras sem acento, números e _.</small></label>
          <label>Biografia<textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder="Conte um pouco sobre você..." rows={4} maxLength={240} /><small className="field-help">{profileBio.length}/240</small></label>
          {notice && <div className="notice">{notice}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setEditingProfile(false)}>Cancelar</button><button className="hero-button" type="submit" disabled={profileBusy}>{profileBusy ? "Salvando..." : "Salvar perfil"}</button></div>
        </form>
      </div>}
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
          <div className="modal-top"><div><div className="eyebrow">{editingCharacterId ? "EDITAR PERSONAGEM" : "PERSONAGEM NOVO"}</div><h2>{editingCharacterId ? "Edite seu personagem" : "Crie alguém especial"}</h2></div><button type="button" className="icon-button" onClick={() => setCreating(false)}><X /></button></div>
          <label>Nome do personagem<input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex.: Alex" maxLength={40} required /></label>
          <label>Frase curta (opcional)<input value={newTagline} onChange={e => setNewTagline(e.target.value)} placeholder="Ex.: Uma amiga divertida e curiosa" maxLength={100} /></label>
          <label>Saudação inicial (opcional)<textarea value={newGreeting} onChange={e => setNewGreeting(e.target.value)} placeholder="O que o personagem diz ao iniciar uma conversa?" rows={2} maxLength={500} /></label>
          <label>Personalidade e instruções<textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descreva como ele fala, age e quais assuntos gosta..." rows={5} maxLength={1500} required /></label>
          <label>Visibilidade<select value={newVisibility} onChange={e => setNewVisibility(e.target.value)}><option value="public">Public — qualquer pessoa pode encontrar</option><option value="private">Private — só você pode ver</option></select></label>
          <label>Foto de perfil (opcional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => chooseAvatar(e.target.files?.[0])} /></label>
          {newAvatar && <div className="avatar-preview"><img src={newAvatar} alt="Prévia da foto do personagem" /><button type="button" className="cancel-button" onClick={() => setNewAvatar("")}>Remover foto</button></div>}
          {notice && <div className="notice">{notice}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => { setCreating(false); setEditingCharacterId(null); }}>Cancelar</button><button className="hero-button" type="submit" disabled={characterBusy}>{characterBusy ? "Salvando..." : editingCharacterId ? "Salvar alterações" : "Criar personagem"} <Sparkles size={16} /></button></div>
        </form>
      </div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
