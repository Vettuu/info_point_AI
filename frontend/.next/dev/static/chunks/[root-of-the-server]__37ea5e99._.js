(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/src/pages/index.module.css [client] (css module)", ((__turbopack_context__) => {

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
"[project]/src/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/pages/index.module.css [client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const bufferToBase64 = (arrayBuffer)=>{
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const length = bytes.byteLength;
    for(let index = 0; index < length; index += 1){
        binary += String.fromCharCode(bytes[index]);
    }
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : window.btoa(binary);
};
const base64ToUint8Array = (base64)=>{
    if (("TURBOPACK compile-time value", "object") === "undefined" || !base64) {
        return new Uint8Array();
    }
    const binary = window.atob(base64);
    const output = new Uint8Array(binary.length);
    for(let index = 0; index < binary.length; index += 1){
        output[index] = binary.charCodeAt(index);
    }
    return output;
};
const VOICE_STATUS_LABELS = {
    idle: "",
    listening: "Sto ascoltando...",
    processing: "Sto elaborando la tua richiesta...",
    speaking: "Sto rispondendo..."
};
class AudioStreamer {
    constructor(){
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
        const blob = new Blob([
            typedArray.buffer
        ], {
            type: "audio/mp3"
        });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        this.activeAudio = audio;
        const cleanup = ()=>{
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
const InfoPointPage = ()=>{
    _s();
    const [assistantStarted, setAssistantStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [chatHistory, setChatHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSending, setIsSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isRecording, setIsRecording] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isVoiceProcessing, setIsVoiceProcessing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [voiceStatus, setVoiceStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [voiceTransport, setVoiceTransport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("http");
    const [voiceSessionId, setVoiceSessionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [voicePhase, setVoicePhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])("");
    const chatPaneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const chatEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mediaRecorderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioChunksRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const recordingModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])("http");
    const audioStreamerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const assistantEndpoint = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_ASSISTANT_API ?? "http://localhost:8000/api/assistant";
    const voiceAssistantEndpoint = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VOICE_API ?? "http://localhost:8000/api/voice-assistant";
    const voiceWsUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VOICE_WS ?? "ws://127.0.0.1:8000/ws/voice-assistant";
    const pageClasses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InfoPointPage.useMemo[pageClasses]": ()=>[
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].infopointPage,
                assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].pageStarted : ""
            ].join(" ").trim()
    }["InfoPointPage.useMemo[pageClasses]"], [
        assistantStarted
    ]);
    const heroClasses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InfoPointPage.useMemo[heroClasses]": ()=>[
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].heroCard,
                assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].heroActivated : ""
            ].join(" ").trim()
    }["InfoPointPage.useMemo[heroClasses]"], [
        assistantStarted
    ]);
    const hasConversation = chatHistory.length > 0;
    const updateVoicePhase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InfoPointPage.useCallback[updateVoicePhase]": (nextPhase, explicitStatus)=>{
            setVoicePhase(nextPhase);
            if (typeof explicitStatus === "string") {
                setVoiceStatus(explicitStatus);
                return;
            }
            setVoiceStatus(VOICE_STATUS_LABELS[nextPhase] ?? "");
        }
    }["InfoPointPage.useCallback[updateVoicePhase]"], [
        setVoicePhase,
        setVoiceStatus
    ]);
    const sendWsPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InfoPointPage.useCallback[sendWsPayload]": (payload)=>{
            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                return false;
            }
            const message = voiceSessionId ? {
                ...payload,
                sessionId: payload.sessionId ?? voiceSessionId
            } : payload;
            ws.send(JSON.stringify(message));
            return true;
        }
    }["InfoPointPage.useCallback[sendWsPayload]"], [
        voiceSessionId
    ]);
    const sendAudioChunkViaWs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InfoPointPage.useCallback[sendAudioChunkViaWs]": async (blob)=>{
            try {
                const buffer = await blob.arrayBuffer();
                const base64Chunk = bufferToBase64(buffer);
                return sendWsPayload({
                    type: "audio_chunk",
                    data: base64Chunk
                });
            } catch (chunkError) {
                setVoiceTransport("http");
                return false;
            }
        }
    }["InfoPointPage.useCallback[sendAudioChunkViaWs]"], [
        sendWsPayload,
        setVoiceTransport
    ]);
    const handleWsPayload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InfoPointPage.useCallback[handleWsPayload]": (payload)=>{
            if (!payload || typeof payload !== "object") {
                return;
            }
            switch(payload.type){
                case "session_started":
                    setVoiceSessionId(payload.sessionId ?? null);
                    break;
                case "transcript":
                    if (payload.final && payload.text) {
                        setChatHistory({
                            "InfoPointPage.useCallback[handleWsPayload]": (prev)=>[
                                    ...prev,
                                    {
                                        id: `voice-user-${Date.now()}`,
                                        role: "user",
                                        content: payload.text
                                    }
                                ]
                        }["InfoPointPage.useCallback[handleWsPayload]"]);
                        updateVoicePhase("processing");
                    } else if (payload.text) {
                        setVoiceStatus(`Sto trascrivendo: ${payload.text}`);
                    }
                    break;
                case "assistant_text":
                    if (payload.answer) {
                        setChatHistory({
                            "InfoPointPage.useCallback[handleWsPayload]": (prev)=>[
                                    ...prev,
                                    {
                                        id: `assistant-${Date.now()}`,
                                        role: "assistant",
                                        content: payload.answer,
                                        sources: payload.sources ?? []
                                    }
                                ]
                        }["InfoPointPage.useCallback[handleWsPayload]"]);
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
                    audioStreamerRef.current?.markStreamComplete({
                        "InfoPointPage.useCallback[handleWsPayload]": ()=>{
                            updateVoicePhase("idle");
                            setIsVoiceProcessing(false);
                        }
                    }["InfoPointPage.useCallback[handleWsPayload]"]);
                    break;
                case "assistant_paused":
                    audioStreamerRef.current?.flush();
                    updateVoicePhase("idle", "Risposta interrotta, pronto a ricevere una nuova domanda.");
                    break;
                case "error":
                    setError(payload.message || "Errore nella modalità vocale realtime.");
                    updateVoicePhase("idle");
                    setIsVoiceProcessing(false);
                    break;
                default:
                    break;
            }
        }
    }["InfoPointPage.useCallback[handleWsPayload]"], [
        setChatHistory,
        setError,
        setIsVoiceProcessing,
        updateVoicePhase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InfoPointPage.useEffect": ()=>{
            if (chatPaneRef.current) {
                chatPaneRef.current.scrollTop = chatPaneRef.current.scrollHeight;
            }
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "end"
                });
            }
        }
    }["InfoPointPage.useEffect"], [
        chatHistory,
        assistantStarted
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InfoPointPage.useEffect": ()=>{
            audioStreamerRef.current = new AudioStreamer();
            return ({
                "InfoPointPage.useEffect": ()=>{
                    audioStreamerRef.current?.flush();
                    audioStreamerRef.current = null;
                }
            })["InfoPointPage.useEffect"];
        }
    }["InfoPointPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InfoPointPage.useEffect": ()=>{
            if (!assistantStarted) {
                if (wsRef.current) {
                    wsRef.current.close();
                    wsRef.current = null;
                }
                setVoiceSessionId(null);
                setVoiceTransport("http");
                return;
            }
            if (!voiceWsUrl || ("TURBOPACK compile-time value", "object") === "undefined") {
                return;
            }
            let isActive = true;
            try {
                const ws = new WebSocket(`${voiceWsUrl}?t=${Date.now()}`);
                wsRef.current = ws;
                ws.onopen = ({
                    "InfoPointPage.useEffect": ()=>{
                        if (!isActive) return;
                        setVoiceTransport("ws");
                        updateVoicePhase("idle");
                    }
                })["InfoPointPage.useEffect"];
                ws.onmessage = ({
                    "InfoPointPage.useEffect": (event)=>{
                        if (!isActive) return;
                        try {
                            const payload = JSON.parse(event.data);
                            handleWsPayload(payload);
                        } catch (messageError) {
                        // ignore malformed payloads
                        }
                    }
                })["InfoPointPage.useEffect"];
                ws.onerror = ({
                    "InfoPointPage.useEffect": ()=>{
                        if (!isActive) return;
                        setVoiceTransport("http");
                    }
                })["InfoPointPage.useEffect"];
                ws.onclose = ({
                    "InfoPointPage.useEffect": ()=>{
                        if (!isActive) return;
                        wsRef.current = null;
                        setVoiceSessionId(null);
                        setVoiceTransport({
                            "InfoPointPage.useEffect": (prev)=>prev === "ws" ? "http" : prev
                        }["InfoPointPage.useEffect"]);
                        updateVoicePhase("idle");
                    }
                })["InfoPointPage.useEffect"];
                return ({
                    "InfoPointPage.useEffect": ()=>{
                        isActive = false;
                        ws.close();
                    }
                })["InfoPointPage.useEffect"];
            } catch (connectionError) {
                setVoiceTransport("http");
            }
        }
    }["InfoPointPage.useEffect"], [
        assistantStarted,
        handleWsPayload,
        updateVoicePhase,
        voiceWsUrl
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
    const agendaUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_AGENDA_URL ?? "http://127.0.0.1:8000/docs/agenda";
    const mapUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MAP_URL ?? "http://127.0.0.1:8000/docs/piantina";
    const handleOpenLink = (url)=>{
        window.open(url, "_blank", "noopener,noreferrer");
    };
    const ctaButtons = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].ctaButton,
                onClick: ()=>handleOpenLink(agendaUrl),
                children: "Consulta l'agenda"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 417,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].ctaButton,
                onClick: ()=>handleOpenLink(mapUrl),
                children: "Visualizza piantina"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 424,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
    const handleToggleRecording = async ()=>{
        if (!assistantStarted) {
            return;
        }
        if (!isRecording && voicePhase === "speaking") {
            audioStreamerRef.current?.flush();
            sendWsPayload({
                type: "user_cancel"
            });
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
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            const canUseStreaming = voiceTransport === "ws" && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && voiceSessionId;
            recordingModeRef.current = canUseStreaming ? "ws" : "http";
            const recorder = new MediaRecorder(audioStream);
            audioChunksRef.current = [];
            recorder.ondataavailable = async (event)=>{
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
            recorder.onstop = ()=>{
                audioStream.getTracks().forEach((track)=>track.stop());
                setIsRecording(false);
                if (recordingModeRef.current === "ws") {
                    updateVoicePhase("processing");
                    setIsVoiceProcessing(true);
                    const sent = sendWsPayload({
                        type: "user_stop"
                    });
                    if (!sent && audioChunksRef.current.length > 0) {
                        const fallbackBlob = new Blob(audioChunksRef.current, {
                            type: "audio/webm"
                        });
                        sendVoiceMessage(fallbackBlob);
                    }
                } else if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, {
                        type: "audio/webm"
                    });
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
                updateVoicePhase("listening", "Modalità realtime non disponibile: registrazione classica avviata.");
            }
        } catch (recorderError) {
            updateVoicePhase("idle");
            setError(recorderError instanceof Error ? recorderError.message : "Impossibile accedere al microfono.");
        }
    };
    const sendVoiceMessage = async (blob)=>{
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
                updateVoicePhase("speaking");
                audioStreamerRef.current?.flush();
                audioStreamerRef.current?.enqueue(data.audio);
                audioStreamerRef.current?.markStreamComplete(()=>{
                    updateVoicePhase("idle", "Risposta pronta.");
                });
            } else {
                updateVoicePhase("idle", "Risposta pronta.");
            }
        } catch (voiceError) {
            setError(voiceError.message);
            updateVoicePhase("idle");
        } finally{
            setIsVoiceProcessing(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: pageClasses,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: heroClasses,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].heroTitle} ${hasConversation ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].heroTitleCompact : ""}`,
                        children: "Info Point AI"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 581,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    assistantStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].quickActions,
                        children: ctaButtons
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 589,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    !hasConversation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].heroText,
                            children: assistantStarted ? "Chiedi qualcosa al nostro assistente AI. Inserisci la tua domanda qui sotto e premi invio." : "Scopri l'evento e fai domande al nostro assistente AI. Premi il simbolo per iniziare la conversazione."
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 593,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatShell} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatShellActive : ""}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatHistory,
                            ref: chatPaneRef,
                            children: [
                                chatHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatPlaceholder,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "La conversazione con l'assistente comparirà qui."
                                    }, void 0, false, {
                                        fileName: "[project]/src/pages/index.js",
                                        lineNumber: 608,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 607,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)) : chatHistory.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].messageRow} ${entry.role === "user" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].messageUser : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].messageAssistant}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].messageBubble,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: entry.content
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.js",
                                                    lineNumber: 621,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                entry.role === "assistant" && entry.sources && entry.sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].messageSources,
                                                    children: entry.sources.map((source)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: source.title
                                                        }, `${entry.id}-${source.id}`, false, {
                                                            fileName: "[project]/src/pages/index.js",
                                                            lineNumber: 627,
                                                            columnNumber: 29
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/pages/index.js",
                                                    lineNumber: 625,
                                                    columnNumber: 25
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 620,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, entry.id, false, {
                                        fileName: "[project]/src/pages/index.js",
                                        lineNumber: 612,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: chatEndRef
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 635,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 605,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 600,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].errorText,
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 638,
                        columnNumber: 19
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 580,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].floatingSymbol} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].symbolDocked : ""}`,
                onClick: handleStartAssistant,
                "aria-label": "Avvia l'assistente AI",
                children: "i"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 641,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            !assistantStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].secondaryActions,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].altLabel,
                        children: "Altrimenti:"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 653,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].quickActions,
                        children: ctaButtons
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.js",
                        lineNumber: 654,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 652,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].bottomDock} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].bottomDockActive : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].bottomContent,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatInputShell} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatVisible : ""}`,
                            onSubmit: handleSubmit,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatLabel,
                                    htmlFor: "prompt-input",
                                    children: "Invia il tuo messaggio"
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 670,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatFieldGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            id: "prompt-input",
                                            name: "prompt",
                                            value: message,
                                            placeholder: "Scrivi la tua domanda per l'assistente...",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].chatInput,
                                            onChange: (event)=>setMessage(event.target.value),
                                            autoFocus: assistantStarted,
                                            disabled: !assistantStarted || isSending
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 674,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].voiceButton} ${isRecording ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].voiceButtonActive : ""}`,
                                            onClick: handleToggleRecording,
                                            disabled: isVoiceProcessing,
                                            "aria-pressed": isRecording,
                                            children: isRecording ? "Stop" : "Parla"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 685,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].sendButton} ${isSending ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].sendButtonLoading : ""}`,
                                            disabled: !assistantStarted || isSending || !message.trim(),
                                            children: isSending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].sendButtonDots,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                        fileName: "[project]/src/pages/index.js",
                                                        lineNumber: 705,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                        fileName: "[project]/src/pages/index.js",
                                                        lineNumber: 706,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                                        fileName: "[project]/src/pages/index.js",
                                                        lineNumber: 707,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/pages/index.js",
                                                lineNumber: 704,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)) : "Invia"
                                        }, void 0, false, {
                                            fileName: "[project]/src/pages/index.js",
                                            lineNumber: 696,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 673,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                voiceStatus && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].voiceStatus,
                                    "aria-live": "polite",
                                    children: voiceStatus
                                }, void 0, false, {
                                    fileName: "[project]/src/pages/index.js",
                                    lineNumber: 715,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 664,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].bottomStart} ${assistantStarted ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$pages$2f$index$2e$module$2e$css__$5b$client$5d$__$28$css__module$29$__["default"].bottomStartHidden : ""}`,
                            onClick: handleStartAssistant,
                            children: "Avvia chat"
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.js",
                            lineNumber: 720,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/pages/index.js",
                    lineNumber: 663,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/pages/index.js",
                lineNumber: 658,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/pages/index.js",
        lineNumber: 579,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(InfoPointPage, "M+uo1cwlvZzgZdNnu36dujvRfCo=");
_c = InfoPointPage;
const __TURBOPACK__default__export__ = InfoPointPage;
var _c;
__turbopack_context__.k.register(_c, "InfoPointPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/src/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/src/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/src/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/src/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__37ea5e99._.js.map