"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";

const InfoPointPage = () => {
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [error, setError] = useState("");
  const chatPaneRef = useRef(null);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const assistantEndpoint =
    process.env.NEXT_PUBLIC_ASSISTANT_API ?? "http://localhost:8000/api/assistant";
  const voiceAssistantEndpoint =
    process.env.NEXT_PUBLIC_VOICE_API ?? "http://localhost:8000/api/voice-assistant";

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

  const agendaUrl =
    process.env.NEXT_PUBLIC_AGENDA_URL ?? "http://127.0.0.1:8000/docs/agenda";
  const mapUrl =
    process.env.NEXT_PUBLIC_MAP_URL ?? "http://127.0.0.1:8000/docs/piantina";

  const handleOpenLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const ctaButtons = (
    <>
      <button
        type="button"
        className={styles.ctaButton}
        onClick={() => handleOpenLink(agendaUrl)}
      >
        Consulta l&apos;agenda
      </button>
      <button
        type="button"
        className={styles.ctaButton}
        onClick={() => handleOpenLink(mapUrl)}
      >
        Visualizza piantina
      </button>
    </>
  );

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setVoiceStatus("Sto elaborando la tua registrazione...");
      return;
    }

    try {
      setError("");
      setVoiceStatus("Sto ascoltando...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        sendVoiceMessage(audioBlob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (recorderError) {
      setVoiceStatus("");
      setError(
        recorderError instanceof Error
          ? recorderError.message
          : "Impossibile accedere al microfono."
      );
    }
  };

  const sendVoiceMessage = async (blob) => {
    setIsRecording(false);
    setIsVoiceProcessing(true);
    setVoiceStatus("Sto trascrivendo e generando la risposta...");

    const formData = new FormData();
    formData.append("audio", blob, "input.webm");

    try {
      const response = await fetch(voiceAssistantEndpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Errore vocale inatteso");
      }

      setChatHistory((prev) => [
        ...prev,
        { id: `voice-user-${Date.now()}`, role: "user", content: data.question || "" },
        {
          id: `voice-assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);

      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play().catch(() => {
          /* ignore autoplay issues */
        });
      }
      setVoiceStatus("Risposta pronta.");
    } catch (voiceError) {
      setError(voiceError.message);
      setVoiceStatus("");
    } finally {
      setIsVoiceProcessing(false);
      setTimeout(() => setVoiceStatus(""), 2500);
    }
  };

  return (
    <div className={pageClasses}>
      <div className={heroClasses}>
        <h1
          className={`${styles.heroTitle} ${
            hasConversation ? styles.heroTitleCompact : ""
          }`}
        >
          Info Point AI
        </h1>
        {assistantStarted && (
          <div className={styles.quickActions}>{ctaButtons}</div>
        )}
        {!hasConversation && (
          <>
            <p className={styles.heroText}>
              {assistantStarted
                ? "Chiedi qualcosa al nostro assistente AI. Inserisci la tua domanda qui sotto e premi invio."
                : "Scopri l'evento e fai domande al nostro assistente AI. Premi il simbolo per iniziare la conversazione."}
            </p>
          </>
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
          <div className={styles.quickActions}>{ctaButtons}</div>
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
                type="button"
                className={`${styles.voiceButton} ${
                  isRecording ? styles.voiceButtonActive : ""
                }`}
                onClick={handleToggleRecording}
                disabled={isVoiceProcessing}
                aria-pressed={isRecording}
              >
                {isRecording ? "Stop" : "Parla"}
              </button>
              <button
                type="submit"
                className={`${styles.sendButton} ${
                  isSending ? styles.sendButtonLoading : ""
                }`}
                disabled={!assistantStarted || isSending || !message.trim()}
              >
                {isSending ? (
                  <span className={styles.sendButtonDots}>
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  "Invia"
                )}
              </button>
            </div>
            {voiceStatus && (
              <p className={styles.voiceStatus} aria-live="polite">
                {voiceStatus}
              </p>
            )}
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
