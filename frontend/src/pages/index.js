"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";

const InfoPointPage = () => {
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const chatPaneRef = useRef(null);
  const chatEndRef = useRef(null);

  const assistantEndpoint =
    process.env.NEXT_PUBLIC_ASSISTANT_API ?? "http://localhost:8000/api/assistant";

  const pageClasses = useMemo(
    () =>
      [styles.infopointPage, assistantStarted ? styles.pageStarted : ""]
        .join(" ")
        .trim(),
    [assistantStarted]
  );

  const heroClasses = useMemo(
    () =>
      [styles.heroCard, assistantStarted ? styles.heroActivated : ""]
        .join(" ")
        .trim(),
    [assistantStarted]
  );

  const hasConversation = chatHistory.length > 0;

  useEffect(() => {
    if (chatPaneRef.current) {
      chatPaneRef.current.scrollTop = chatPaneRef.current.scrollHeight;
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatHistory, assistantStarted]);

  const handleStartAssistant = () => {
    if (!assistantStarted) {
      setAssistantStarted(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!assistantStarted || !message.trim()) {
      return;
    }

    setIsSending(true);
    setError("");
    const userQuestion = message.trim();

    try {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: userQuestion,
        },
      ]);
      setMessage("");

      const response = await fetch(assistantEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Errore inatteso");
      }

      setChatHistory((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data?.answer ?? "Non ho trovato informazioni pertinenti.",
          sources: data?.sources ?? [],
        },
      ]);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={pageClasses}>
      <header
        className={`${styles.pageHeader} ${
          hasConversation ? styles.pageHeaderVisible : ""
        }`}
      >
        <h1>Info Point AI</h1>
      </header>
      <div className={heroClasses}>
        <h1 className={styles.heroTitle}>Info Point AI</h1>
        <p className={styles.heroText}>
          {assistantStarted
            ? "Chiedi qualcosa al nostro assistente AI. Inserisci la tua domanda qui sotto e premi invio."
            : "Scopri l'evento e fai domande al nostro assistente AI. Premi il simbolo per iniziare la conversazione."}
        </p>
        {assistantStarted && (
          <div className={styles.quickActions}>
            <button type="button" className={styles.agendaButton}>
              Consulta l&apos;agenda
            </button>
          </div>
        )}
        <section
          className={`${styles.chatShell} ${
            assistantStarted ? styles.chatShellActive : ""
          }`}
        >
          <div className={styles.chatHistory} ref={chatPaneRef}>
            {chatHistory.length === 0 ? (
              <div className={styles.chatPlaceholder}>
                <p>La conversazione con l&apos;assistente comparirà qui.</p>
              </div>
            ) : (
              chatHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`${styles.messageRow} ${
                    entry.role === "user"
                      ? styles.messageUser
                      : styles.messageAssistant
                  }`}
                >
                  <div className={styles.messageBubble}>
                    <p>{entry.content}</p>
                    {entry.role === "assistant" &&
                      entry.sources &&
                      entry.sources.length > 0 && (
                        <ul className={styles.messageSources}>
                          {entry.sources.map((source) => (
                            <li key={`${entry.id}-${source.id}`}>{source.title}</li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </section>
        {error && <p className={styles.errorText}>{error}</p>}
      </div>

      <button
        type="button"
        className={`${styles.floatingSymbol} ${
          assistantStarted ? styles.symbolDocked : ""
        }`}
        onClick={handleStartAssistant}
        aria-label="Avvia l&apos;assistente AI"
      >
        i
      </button>
      {!assistantStarted && (
        <div className={styles.secondaryActions}>
          <p className={styles.altLabel}>Altrimenti:</p>
          <button type="button" className={styles.agendaButton}>
            Consulta l&apos;agenda
          </button>
        </div>
      )}

      <div
        className={`${styles.bottomDock} ${
          assistantStarted ? styles.bottomDockActive : ""
        }`}
      >
        <div className={styles.bottomContent}>
          <form
            className={`${styles.chatInputShell} ${
              assistantStarted ? styles.chatVisible : ""
            }`}
            onSubmit={handleSubmit}
          >
            <label className={styles.chatLabel} htmlFor="prompt-input">
              Invia il tuo messaggio
            </label>
            <div className={styles.chatFieldGroup}>
              <input
                type="text"
                id="prompt-input"
                name="prompt"
                value={message}
                placeholder="Scrivi la tua domanda per l&apos;assistente..."
                className={styles.chatInput}
                onChange={(event) => setMessage(event.target.value)}
                autoFocus={assistantStarted}
                disabled={!assistantStarted || isSending}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!assistantStarted || isSending || !message.trim()}
              >
                {isSending ? "Invio..." : "Invia"}
              </button>
            </div>
          </form>
          <button
            type="button"
            className={`${styles.bottomStart} ${
              assistantStarted ? styles.bottomStartHidden : ""
            }`}
            onClick={handleStartAssistant}
          >
            Avvia chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPointPage;
