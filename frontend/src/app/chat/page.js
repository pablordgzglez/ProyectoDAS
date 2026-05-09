"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import {
  createChat,
  deleteChatById,
  getChatById,
  getChats,
  sendChatMessage,
} from "../../services/chat";
import styles from "./chat.module.css";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatScreen />
    </ProtectedRoute>
  );
}

function ChatScreen() {
  const { accessToken } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatsError, setChatsError] = useState("");
  const [chatError, setChatError] = useState("");
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    loadChats();
  }, [accessToken]);

  async function loadChats(chatIdToSelect) {
    setChatsLoading(true);
    setChatsError("");

    try {
      const data = await getChats(accessToken);
      const chatList = Array.isArray(data) ? data : data.results || [];

      setChats(chatList);

      if (chatList.length === 0) {
        setSelectedChatId(null);
        setSelectedChat(null);
        setChatError("");
        return;
      }

      const nextChatId =
        chatIdToSelect ||
        (selectedChatId && chatList.some((chat) => chat.id === selectedChatId)
          ? selectedChatId
          : chatList[0].id);

      await loadChatDetail(nextChatId);
    } catch (error) {
      setChatsError(error.message);
      setChats([]);
    } finally {
      setChatsLoading(false);
    }
  }

  async function loadChatDetail(chatId) {
    setChatLoading(true);
    setChatError("");
    setMessageError("");

    try {
      const data = await getChatById(chatId, accessToken);
      setSelectedChatId(chatId);
      setSelectedChat(data);
    } catch (error) {
      setSelectedChatId(chatId);
      setSelectedChat(null);
      setChatError(error.message);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleCreateChat() {
    setCreatingChat(true);
    setChatsError("");

    try {
      const newChat = await createChat(accessToken);
      await loadChats(newChat.id);
    } catch (error) {
      setChatsError(error.message);
    } finally {
      setCreatingChat(false);
    }
  }

  async function handleDeleteChat(chatId, event) {
    event.stopPropagation();

    const confirmed = window.confirm("¿Quieres borrar este chat?");
    if (!confirmed) {
      return;
    }

    setChatsError("");

    try {
      await deleteChatById(chatId, accessToken);

      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);

      if (chatId !== selectedChatId) {
        return;
      }

      if (updatedChats.length === 0) {
        setSelectedChatId(null);
        setSelectedChat(null);
        setChatError("");
        setMessageError("");
        return;
      }

      await loadChatDetail(updatedChats[0].id);
    } catch (error) {
      setChatsError(error.message);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    setMessageError("");

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setMessageError("No puedes enviar un mensaje vacio.");
      return;
    }

    if (!selectedChat) {
      setMessageError("Primero debes crear o seleccionar un chat.");
      return;
    }

    setSendingMessage(true);

    try {
      await sendChatMessage(selectedChat.id, trimmedMessage, accessToken);
      await loadChatDetail(selectedChat.id);
      setMessage("");
    } catch (error) {
      setMessageError(error.message);
    } finally {
      setSendingMessage(false);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString("es-ES");
  }

  function isGenericTitle(title) {
    const normalizedTitle = (title || "").trim().toLowerCase();

    return (
      !normalizedTitle ||
      normalizedTitle === "new chat" ||
      normalizedTitle === "chat" ||
      normalizedTitle.startsWith("chat ")
    );
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredChats = chats.filter((chat) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const titleText = (chat.title || "").toLowerCase();
    if (titleText.includes(normalizedSearchTerm)) {
      return true;
    }

    const canSearchMessages =
      chat.id === selectedChatId &&
      selectedChat &&
      selectedChat.id === chat.id &&
      isGenericTitle(chat.title) &&
      selectedChat.messages;

    if (canSearchMessages) {
      const messagesText = selectedChat.messages
        .map((chatMessage) => chatMessage.content.toLowerCase())
        .join(" ");

      return messagesText.includes(normalizedSearchTerm);
    }

    return false;
  });

  return (
    <section className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>Mis chats</h1>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={handleCreateChat}
            disabled={creatingChat}
          >
            {creatingChat ? "Creando..." : "Nuevo chat"}
          </button>
        </div>

        <input
          className={styles.searchInput}
          type="text"
          placeholder="Buscar chats..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        {chatsLoading ? (
          <div className={styles.stateBox}>
            <p>Cargando chats...</p>
          </div>
        ) : null}

        {chatsError ? (
          <div className={styles.errorBox}>
            <p>{chatsError}</p>
          </div>
        ) : null}

        {!chatsLoading && !chats.length ? (
          <div className={styles.stateBox}>
            <p>No tienes chats todavia.</p>
          </div>
        ) : null}

        {!chatsLoading && chats.length > 0 && filteredChats.length === 0 ? (
          <div className={styles.stateBox}>
            <p>No se han encontrado chats.</p>
          </div>
        ) : null}

        <ul className={styles.chatList}>
          {filteredChats.map((chat) => (
            <li key={chat.id}>
              <div
                className={`${styles.chatItem} ${
                  chat.id === selectedChatId ? styles.chatItemActive : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.chatSelectButton}
                  onClick={() => loadChatDetail(chat.id)}
                >
                  <div className={styles.chatItemContent}>
                    <span className={styles.chatTitle}>{chat.title || `Chat ${chat.id}`}</span>
                    <span className={styles.chatDate}>{formatDate(chat.created_at)}</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={(event) => handleDeleteChat(chat.id, event)}
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.chatPanel}>
        {chatLoading ? (
          <div className={styles.stateBox}>
            <p>Cargando mensajes...</p>
          </div>
        ) : null}

        {!chatLoading && chatError ? (
          <div className={styles.errorBox}>
            <p>{chatError}</p>
            {selectedChatId ? (
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => loadChatDetail(selectedChatId)}
              >
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}

        {!chatLoading && !chatError && !selectedChat ? (
          <div className={styles.stateBox}>
            <p>Selecciona un chat o crea uno nuevo para empezar.</p>
          </div>
        ) : null}

        {!chatLoading && !chatError && selectedChat ? (
          <>
            <header className={styles.chatHeader}>
              <h2 className={styles.chatHeaderTitle}>
                {selectedChat.title || `Chat ${selectedChat.id}`}
              </h2>
            </header>

            <div className={styles.messages}>
              {!selectedChat.messages || selectedChat.messages.length === 0 ? (
                <div className={styles.stateBox}>
                  <p>Este chat todavia no tiene mensajes.</p>
                </div>
              ) : (
                selectedChat.messages.map((chatMessage) => (
                  <article
                    key={chatMessage.id}
                    className={`${styles.messageRow} ${
                      chatMessage.role === "user"
                        ? styles.messageRowUser
                        : styles.messageRowAssistant
                    }`}
                  >
                    <div
                      className={`${styles.messageBubble} ${
                        chatMessage.role === "user"
                          ? styles.messageBubbleUser
                          : styles.messageBubbleAssistant
                      }`}
                    >
                      <p>{chatMessage.content}</p>
                    </div>
                  </article>
                ))
              )}
            </div>

            <form className={styles.messageForm} onSubmit={handleSendMessage}>
              <textarea
                className={styles.textarea}
                placeholder="Escribe tu mensaje..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={sendingMessage}
              />

              {messageError ? <p className={styles.formError}>{messageError}</p> : null}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={sendingMessage}
              >
                {sendingMessage ? "Enviando..." : "Enviar"}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </section>
  );
}
