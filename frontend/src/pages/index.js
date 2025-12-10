"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.css";

const bufferToBase64 = (arrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const length = bytes.byteLength;

  for (let index = 0; index < length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return typeof window === "undefined" ? "" : window.btoa(binary);
};

const base64ToUint8Array = (base64) => {
  if (typeof window === "undefined" || !base64) {
    return new Uint8Array();
  }

  const binary = window.atob(base64);
  const output = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }

  return output;
};

const VOICE_STATUS_LABELS = {
  idle: "",
  listening: "Sto ascoltando...",
  processing: "Sto elaborando la tua richiesta...",
  speaking: "Sto rispondendo...",
};

class AudioStreamer {
  constructor() {
    this.queue = [];
    this.activeAudio = null;
    this.streamClosing = false;
    this.onDrain = null;
  }

  enqueue(base64Chunk) {
    if (!base64Chunk) {
      return;
    }

    this.queue.push(base64Chunk);
    if (!this.activeAudio) {
      this.playNext();
    }
  }

  playNext() {
    if (this.queue.length === 0) {
      this.activeAudio = null;
      if (this.streamClosing && typeof this.onDrain === "function") {
        const callback = this.onDrain;
        this.onDrain = null;
        this.streamClosing = false;
        callback();
      }
      return;
    }

    const chunk = this.queue.shift();
    const typedArray = base64ToUint8Array(chunk);
    const blob = new Blob([typedArray.buffer], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.activeAudio = audio;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      this.activeAudio = null;
      this.playNext();
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;
    audio.play().catch(cleanup);
  }

  markStreamComplete(onDrain) {
    this.onDrain = onDrain;
    this.streamClosing = true;
    if (!this.activeAudio && this.queue.length === 0 && typeof this.onDrain === "function") {
      const callback = this.onDrain;
      this.onDrain = null;
      this.streamClosing = false;
      callback();
    }
  }

  flush() {
    this.queue = [];
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio = null;
    }
    this.streamClosing = false;
    if (typeof this.onDrain === "function") {
      const callback = this.onDrain;
      this.onDrain = null;
      callback();
    }
  }
}

const InfoPointPage = () => {
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceTransport, setVoiceTransport] = useState("http");
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [voicePhase, setVoicePhase] = useState("idle");
  const [error, setError] = useState("");
  const chatPaneRef = useRef(null);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const recordingModeRef = useRef("http");
  const audioStreamerRef = useRef(null);

  const assistantEndpoint =
    process.env.NEXT_PUBLIC_ASSISTANT_API ?? "http://localhost:8000/api/assistant";
  const voiceAssistantEndpoint =
    process.env.NEXT_PUBLIC_VOICE_API ?? "http://localhost:8000/api/voice-assistant";
  const voiceWsUrl =
    process.env.NEXT_PUBLIC_VOICE_WS ?? "ws://127.0.0.1:9000/ws/voice-assistant";

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

  const updateVoicePhase = useCallback(
    (nextPhase, explicitStatus) => {
      setVoicePhase(nextPhase);

      if (typeof explicitStatus === "string") {
        setVoiceStatus(explicitStatus);
        return;
      }

      setVoiceStatus(VOICE_STATUS_LABELS[nextPhase] ?? "");
    },
    [setVoicePhase, setVoiceStatus]
  );

  const sendWsPayload = useCallback(
    (payload) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return false;
      }

      const message = voiceSessionId
        ? { ...payload, sessionId: payload.sessionId ?? voiceSessionId }
        : payload;

      ws.send(JSON.stringify(message));
      return true;
    },
    [voiceSessionId]
  );

  const sendAudioChunkViaWs = useCallback(
    async (blob) => {
      try {
        const buffer = await blob.arrayBuffer();
        const base64Chunk = bufferToBase64(buffer);
        return sendWsPayload({ type: "audio_chunk", data: base64Chunk });
      } catch (chunkError) {
        setVoiceTransport("http");
        return false;
      }
    },
    [sendWsPayload, setVoiceTransport]
  );

  const handleWsPayload = useCallback(
    (payload) => {
      if (!payload || typeof payload !== "object") {
        return;
      }

      switch (payload.type) {
        case "session_started":
          setVoiceSessionId(payload.sessionId ?? null);
          break;
        case "transcript":
          if (payload.final && payload.text) {
            setChatHistory((prev) => [
              ...prev,
              { id: `voice-user-${Date.now()}`, role: "user", content: payload.text },
            ]);
            updateVoicePhase("processing");
          } else if (payload.text) {
            setVoiceStatus(`Sto trascrivendo: ${payload.text}`);
          }
          break;
        case "assistant_text":
          if (payload.answer) {
            setChatHistory((prev) => [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: payload.answer,
                sources: payload.sources ?? [],
              },
            ]);
          }
          updateVoicePhase(payload.audioStreaming ? "speaking" : "idle");
          setIsVoiceProcessing(false);
          break;
        case "assistant_audio_chunk":
          if (payload.data) {
            audioStreamerRef.current?.enqueue(payload.data);
            updateVoicePhase("speaking");
          }
          break;
        case "assistant_audio_end":
          audioStreamerRef.current?.markStreamComplete(() => {
            updateVoicePhase("idle");
            setIsVoiceProcessing(false);
          });
          break;
        case "assistant_paused":
          audioStreamerRef.current?.flush();
          updateVoicePhase(
            "idle",
            "Risposta interrotta, pronto a ricevere una nuova domanda."
          );
          break;
        case "error":
          setError(payload.message || "Errore nella modalità vocale realtime.");
          updateVoicePhase("idle");
          setIsVoiceProcessing(false);
          break;
        default:
          break;
      }
    },
    [setChatHistory, setError, setIsVoiceProcessing, updateVoicePhase]
  );

  useEffect(() => {
    if (chatPaneRef.current) {
      chatPaneRef.current.scrollTop = chatPaneRef.current.scrollHeight;
    }
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatHistory, assistantStarted]);

  useEffect(() => {
    audioStreamerRef.current = new AudioStreamer();

    return () => {
      audioStreamerRef.current?.flush();
      audioStreamerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!assistantStarted) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setVoiceSessionId(null);
      setVoiceTransport("http");
      return;
    }

    if (!voiceWsUrl || typeof window === "undefined") {
      return;
    }

    let isActive = true;

    try {
      const ws = new WebSocket(`${voiceWsUrl}?t=${Date.now()}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isActive) return;
        setVoiceTransport("ws");
        updateVoicePhase("idle");
      };

      ws.onmessage = (event) => {
        if (!isActive) return;
        try {
          const payload = JSON.parse(event.data);
          handleWsPayload(payload);
        } catch (messageError) {
          // ignore malformed payloads
        }
      };

      ws.onerror = () => {
        if (!isActive) return;
        setVoiceTransport("http");
      };

      ws.onclose = () => {
        if (!isActive) return;
        wsRef.current = null;
        setVoiceSessionId(null);
        setVoiceTransport((prev) => (prev === "ws" ? "http" : prev));
        updateVoicePhase("idle");
      };

      return () => {
        isActive = false;
        ws.close();
      };
    } catch (connectionError) {
      setVoiceTransport("http");
    }
  }, [assistantStarted, handleWsPayload, updateVoicePhase, voiceWsUrl]);

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
    if (!assistantStarted) {
      return;
    }

    if (!isRecording && voicePhase === "speaking") {
      audioStreamerRef.current?.flush();
      sendWsPayload({ type: "user_cancel" });
    }

    if (isRecording) {
      if (recordingModeRef.current === "ws") {
        updateVoicePhase("processing");
        setIsVoiceProcessing(true);
      }
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      setError("");
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const canUseStreaming =
        voiceTransport === "ws" &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        voiceSessionId;

      recordingModeRef.current = canUseStreaming ? "ws" : "http";
      const recorder = new MediaRecorder(audioStream);
      audioChunksRef.current = [];

      recorder.ondataavailable = async (event) => {
        if (!event.data || event.data.size === 0) {
          return;
        }

        if (recordingModeRef.current === "ws") {
          const sent = await sendAudioChunkViaWs(event.data);
          if (!sent) {
            audioChunksRef.current.push(event.data);
          }
        } else {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        audioStream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);

        if (recordingModeRef.current === "ws") {
          updateVoicePhase("processing");
          setIsVoiceProcessing(true);
          const sent = sendWsPayload({ type: "user_stop" });
          if (!sent && audioChunksRef.current.length > 0) {
            const fallbackBlob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            sendVoiceMessage(fallbackBlob);
          }
        } else if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          sendVoiceMessage(audioBlob);
        }

        audioChunksRef.current = [];
      };

      recorder.start(canUseStreaming ? 200 : undefined);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      if (canUseStreaming) {
        updateVoicePhase("listening");
      } else {
        updateVoicePhase(
          "listening",
          "Modalità realtime non disponibile: registrazione classica avviata."
        );
      }
    } catch (recorderError) {
      updateVoicePhase("idle");
      setError(
        recorderError instanceof Error
          ? recorderError.message
          : "Impossibile accedere al microfono."
      );
    }
  };

  const sendVoiceMessage = async (blob) => {
    if (!blob) {
      return;
    }

    setIsRecording(false);
    setIsVoiceProcessing(true);
    updateVoicePhase("processing");

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
        updateVoicePhase("speaking");
        audioStreamerRef.current?.flush();
        audioStreamerRef.current?.enqueue(data.audio);
        audioStreamerRef.current?.markStreamComplete(() => {
          updateVoicePhase("idle", "Risposta pronta.");
        });
      } else {
        updateVoicePhase("idle", "Risposta pronta.");
      }
    } catch (voiceError) {
      setError(voiceError.message);
      updateVoicePhase("idle");
    } finally {
      setIsVoiceProcessing(false);
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
