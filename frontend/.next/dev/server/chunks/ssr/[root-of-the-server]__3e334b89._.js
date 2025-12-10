module.exports = [
"[project]/src/pages/index.module.css [ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "altLabel": "index-module__STTVBW__altLabel",
  "bottomContent": "index-module__STTVBW__bottomContent",
  "bottomDock": "index-module__STTVBW__bottomDock",
  "bottomDockActive": "index-module__STTVBW__bottomDockActive",
  "bottomStart": "index-module__STTVBW__bottomStart",
  "bottomStartHidden": "index-module__STTVBW__bottomStartHidden",
  "chatFieldGroup": "index-module__STTVBW__chatFieldGroup",
  "chatHistory": "index-module__STTVBW__chatHistory",
  "chatInput": "index-module__STTVBW__chatInput",
  "chatInputShell": "index-module__STTVBW__chatInputShell",
  "chatLabel": "index-module__STTVBW__chatLabel",
  "chatPlaceholder": "index-module__STTVBW__chatPlaceholder",
  "chatShell": "index-module__STTVBW__chatShell",
  "chatShellActive": "index-module__STTVBW__chatShellActive",
  "chatVisible": "index-module__STTVBW__chatVisible",
  "ctaButton": "index-module__STTVBW__ctaButton",
  "errorText": "index-module__STTVBW__errorText",
  "floatingSymbol": "index-module__STTVBW__floatingSymbol",
  "heroActivated": "index-module__STTVBW__heroActivated",
  "heroCard": "index-module__STTVBW__heroCard",
  "heroText": "index-module__STTVBW__heroText",
  "heroTitle": "index-module__STTVBW__heroTitle",
  "heroTitleCompact": "index-module__STTVBW__heroTitleCompact",
  "infopointPage": "index-module__STTVBW__infopointPage",
  "messageAssistant": "index-module__STTVBW__messageAssistant",
  "messageBubble": "index-module__STTVBW__messageBubble",
  "messageRow": "index-module__STTVBW__messageRow",
  "messageSources": "index-module__STTVBW__messageSources",
  "messageUser": "index-module__STTVBW__messageUser",
  "pageStarted": "index-module__STTVBW__pageStarted",
  "quickActions": "index-module__STTVBW__quickActions",
  "secondaryActions": "index-module__STTVBW__secondaryActions",
  "sendButton": "index-module__STTVBW__sendButton",
  "sendButtonDots": "index-module__STTVBW__sendButtonDots",
  "sendButtonLoading": "index-module__STTVBW__sendButtonLoading",
  "sendPulse": "index-module__STTVBW__sendPulse",
  "symbolDocked": "index-module__STTVBW__symbolDocked",
  "voiceButton": "index-module__STTVBW__voiceButton",
  "voiceButtonActive": "index-module__STTVBW__voiceButtonActive",
  "voiceStatus": "index-module__STTVBW__voiceStatus",
});
}),
"[project]/src/pages/index.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/pages/index.module.css [ssr] (css module)");
"use client";
;
;
;
const InfoPointPage = ()=>{
    const [assistantStarted, setAssistantStarted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [chatHistory, setChatHistory] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    const [isSending, setIsSending] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isRecording, setIsRecording] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isVoiceProcessing, setIsVoiceProcessing] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [voiceStatus, setVoiceStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const chatPaneRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const chatEndRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const mediaRecorderRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const audioChunksRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])([]);
    const assistantEndpoint = process.env.NEXT_PUBLIC_ASSISTANT_API ?? "http://localhost:8000/api/assistant";
    const voiceAssistantEndpoint = process.env.NEXT_PUBLIC_VOICE_API ?? "http://localhost:8000/api/voice-assistant";
    const pageClasses = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>[
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].infopointPage,
            assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].pageStarted : ""
        ].join(" ").trim(), [
        assistantStarted
    ]);
    const heroClasses = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>[
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].heroCard,
            assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].heroActivated : ""
        ].join(" ").trim(), [
        assistantStarted
    ]);
    const hasConversation = chatHistory.length > 0;
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (chatPaneRef.current) {
            chatPaneRef.current.scrollTop = chatPaneRef.current.scrollHeight;
        }
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    }, [
        chatHistory,
        assistantStarted
    ]);
    const handleStartAssistant = ()=>{
        if (!assistantStarted) {
            setAssistantStarted(true);
        }
    };
    const handleSubmit = async (event)=>{
        event.preventDefault();
        if (!assistantStarted || !message.trim()) {
            return;
        }
        setIsSending(true);
        setError("");
        const userQuestion = message.trim();
        try {
            setChatHistory((prev)=>[
                    ...prev,
                    {
                        id: `user-${Date.now()}`,
                        role: "user",
                        content: userQuestion
                    }
                ]);
            setMessage("");
            const response = await fetch(assistantEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: userQuestion
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Errore inatteso");
            }
            setChatHistory((prev)=>[
                    ...prev,
                    {
                        id: `assistant-${Date.now()}`,
                        role: "assistant",
                        content: data?.answer ?? "Non ho trovato informazioni pertinenti.",
                        sources: data?.sources ?? []
                    }
                ]);
        } catch (fetchError) {
            setError(fetchError.message);
        } finally{
            setIsSending(false);
        }
    };
    const agendaUrl = process.env.NEXT_PUBLIC_AGENDA_URL ?? "http://127.0.0.1:8000/docs/agenda";
    const mapUrl = process.env.NEXT_PUBLIC_MAP_URL ?? "http://127.0.0.1:8000/docs/piantina";
    const handleOpenLink = (url)=>{
        window.open(url, "_blank", "noopener,noreferrer");
    };
    const ctaButtons = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].ctaButton,
                onClick: ()=>handleOpenLink(agendaUrl),
                children: "Consulta l'agenda"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 120,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].ctaButton,
                onClick: ()=>handleOpenLink(mapUrl),
                children: "Visualizza piantina"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 127,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
    const handleToggleRecording = async ()=>{
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            setVoiceStatus("Sto elaborando la tua registrazione...");
            return;
        }
        try {
            setError("");
            setVoiceStatus("Sto ascoltando...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];
            recorder.ondataavailable = (event)=>{
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            recorder.onstop = ()=>{
                stream.getTracks().forEach((track)=>track.stop());
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm"
                });
                sendVoiceMessage(audioBlob);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (recorderError) {
            setVoiceStatus("");
            setError(recorderError instanceof Error ? recorderError.message : "Impossibile accedere al microfono.");
        }
    };
    const sendVoiceMessage = async (blob)=>{
        setIsRecording(false);
        setIsVoiceProcessing(true);
        setVoiceStatus("Sto trascrivendo e generando la risposta...");
        const formData = new FormData();
        formData.append("audio", blob, "input.webm");
        try {
            const response = await fetch(voiceAssistantEndpoint, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Errore vocale inatteso");
            }
            setChatHistory((prev)=>[
                    ...prev,
                    {
                        id: `voice-user-${Date.now()}`,
                        role: "user",
                        content: data.question || ""
                    },
                    {
                        id: `voice-assistant-${Date.now()}`,
                        role: "assistant",
                        content: data.answer,
                        sources: data.sources || []
                    }
                ]);
            if (data.audio) {
                const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                audio.play().catch(()=>{
                /* ignore autoplay issues */ });
            }
            setVoiceStatus("Risposta pronta.");
        } catch (voiceError) {
            setError(voiceError.message);
            setVoiceStatus("");
        } finally{
            setIsVoiceProcessing(false);
            setTimeout(()=>setVoiceStatus(""), 2500);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: pageClasses,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: heroClasses,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].heroTitle} ${hasConversation ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].heroTitleCompact : ""}`,
                        children: "Info Point AI"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 227,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    assistantStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].quickActions,
                        children: ctaButtons
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 235,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    !hasConversation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].heroText,
                            children: assistantStarted ? "Chiedi qualcosa al nostro assistente AI. Inserisci la tua domanda qui sotto e premi invio." : "Scopri l'evento e fai domande al nostro assistente AI. Premi il simbolo per iniziare la conversazione."
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 239,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatShell} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatShellActive : ""}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatHistory,
                            ref: chatPaneRef,
                            children: [
                                chatHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatPlaceholder,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        children: "La conversazione con l'assistente comparirà qui."
                                    }, void 0, false, {
                                        fileName: "[project]/src/pages/index.js",
                                        lineNumber: 254,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 253,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)) : chatHistory.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].messageRow} ${entry.role === "user" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].messageUser : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].messageAssistant}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].messageBubble,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                    children: entry.content
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.js",
                                                    lineNumber: 267,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                entry.role === "assistant" && entry.sources && entry.sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].messageSources,
                                                    children: entry.sources.map((source)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                                            children: source.title
                                                        }, `${entry.id}-${source.id}`, false, {
                                                            fileName: "[project]/src/pages/index.js",
                                                            lineNumber: 273,
                                                            columnNumber: 29
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.js",
                                                    lineNumber: 271,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 266,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, entry.id, false, {
                                        fileName: "[project]/src/pages/index.js",
                                        lineNumber: 258,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    ref: chatEndRef
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 281,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 251,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 246,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].errorText,
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 284,
                        columnNumber: 19
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 226,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                type: "button",
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].floatingSymbol} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].symbolDocked : ""}`,
                onClick: handleStartAssistant,
                "aria-label": "Avvia l'assistente AI",
                children: "i"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 287,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            !assistantStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].secondaryActions,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].altLabel,
                        children: "Altrimenti:"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 299,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].quickActions,
                        children: ctaButtons
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 300,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 298,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].bottomDock} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].bottomDockActive : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].bottomContent,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatInputShell} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatVisible : ""}`,
                            onSubmit: handleSubmit,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatLabel,
                                    htmlFor: "prompt-input",
                                    children: "Invia il tuo messaggio"
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 316,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatFieldGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            id: "prompt-input",
                                            name: "prompt",
                                            value: message,
                                            placeholder: "Scrivi la tua domanda per l'assistente...",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].chatInput,
                                            onChange: (event)=>setMessage(event.target.value),
                                            autoFocus: assistantStarted,
                                            disabled: !assistantStarted || isSending
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 320,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].voiceButton} ${isRecording ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].voiceButtonActive : ""}`,
                                            onClick: handleToggleRecording,
                                            disabled: isVoiceProcessing,
                                            "aria-pressed": isRecording,
                                            children: isRecording ? "Stop" : "Parla"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 331,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].sendButton} ${isSending ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].sendButtonLoading : ""}`,
                                            disabled: !assistantStarted || isSending || !message.trim(),
                                            children: isSending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].sendButtonDots,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                        fileName: "[project]/src/pages/index.js",
                                                        lineNumber: 351,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                        fileName: "[project]/src/pages/index.js",
                                                        lineNumber: 352,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                        fileName: "[project]/src/pages/index.js",
                                                        lineNumber: 353,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.js",
                                                lineNumber: 350,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)) : "Invia"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 342,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 319,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                voiceStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].voiceStatus,
                                    "aria-live": "polite",
                                    children: voiceStatus
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 361,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 310,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].bottomStart} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].bottomStartHidden : ""}`,
                            onClick: handleStartAssistant,
                            children: "Avvia chat"
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 366,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/pages/index.js",
                    lineNumber: 309,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 304,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/pages/index.js",
        lineNumber: 225,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = InfoPointPage;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3e334b89._.js.map