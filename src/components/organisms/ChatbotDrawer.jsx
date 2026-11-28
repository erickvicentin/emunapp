import React, { useRef, useState } from 'react';
import Icon from '../atoms/Icon';
import ChatMessageBubble from '../molecules/ChatMessageBubble';
import { ASSISTANT_PRESETS, STUDIO_INFO } from '../../data/landingData';
import { askLandingAssistant } from '../../services/assistantService';

function formatCurrentTime() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function pickRandomPresets(presets = [], count = 3) {
  const copy = [...presets];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function buildFallbackReply(errorMessage) {
  if (errorMessage && !errorMessage.includes('internal')) {
    return errorMessage;
  }
  return `No pudimos conectarnos con el asistente en este momento. Podés escribirnos directamente por WhatsApp al ${STUDIO_INFO.phone} y te respondemos en el día.`;
}

/**
 * ChatbotDrawer Organism
 * Conversational assistant for the landing page:
 * - Quick preset chips answer locally at zero API cost.
 * - Free-text queries call `askLandingAssistant` Cloud Function grounded in Emuná's knowledge base.
 */
export default function ChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy Muna, tu asistente virtual. ¿En qué puedo ayudarte hoy sobre reservas, pagos, créditos, cancelaciones o horarios?',
      time: 'Ahora',
    },
  ]);
  const [suggestedPresets] = useState(() => pickRandomPresets(ASSISTANT_PRESETS, 3));
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      scrollToBottom();
    }
  };

  const appendAssistantMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-assistant`,
        sender: 'assistant',
        text,
        time: formatCurrentTime(),
      },
    ]);
    scrollToBottom();
  };

  const handlePresetClick = (preset) => {
    if (isTyping) return;
    const nowTime = formatCurrentTime();
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, sender: 'user', text: preset.query, time: nowTime },
      { id: `${Date.now() + 1}-assistant`, sender: 'assistant', text: preset.response, time: nowTime },
    ]);
    scrollToBottom();
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    const query = inputText.trim();
    if (!query || isTyping) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text: query,
      time: formatCurrentTime(),
    };

    const historySnapshot = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const reply = await askLandingAssistant({
        message: query,
        history: historySnapshot,
      });
      appendAssistantMessage(reply || buildFallbackReply());
    } catch (err) {
      appendAssistantMessage(buildFallbackReply(err?.message));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <button
          type="button"
          onClick={handleToggle}
          data-testid="chatbot-toggle-btn"
          aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual de Emuná'}
          aria-expanded={isOpen}
          className="group relative flex items-center gap-3 pl-3 pr-5 py-3 rounded-full bg-primary-container text-on-primary shadow-xl hover:shadow-2xl transition-[transform,box-shadow] duration-300 hover:scale-[1.02] active:scale-95 border border-white/10"
        >
          <div className="relative w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow-inner">
            <Icon name="smart_toy" className="text-[20px]" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="font-label-sm text-label-sm text-secondary-fixed tracking-wide uppercase font-semibold flex items-center gap-1">
              Asistente Virtual
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
            </span>
            <span className="font-label-md text-label-md text-on-primary font-medium whitespace-nowrap">
              {isOpen ? 'Cerrar conversación' : '¿Dudas sobre reservas o pagos?'}
            </span>
          </div>

          <Icon
            name={isOpen ? 'close' : 'chat_bubble'}
            className="text-secondary-fixed-dim text-[18px] group-hover:translate-x-0.5 transition-transform ml-1"
          />
        </button>
      </div>

      {isOpen && (
        <dialog
          open
          data-testid="chatbot-drawer"
          aria-label="Asistente Conversacional de Emuná Pilates"
          className="fixed bottom-24 left-auto right-4 sm:right-6 z-50 m-0 p-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[80vh] bg-surface rounded-3xl shadow-2xl border border-surface-container-highest flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="px-5 py-4 bg-primary-container text-on-primary flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
                <Icon name="smart_toy" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-sm font-semibold text-on-primary">
                  Muna - Asistente Virtual
                </span>
                <span className="font-body-sm text-[11px] text-secondary-fixed flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea • Consultas del estudio
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              data-testid="chatbot-close-btn"
              className="p-1.5 rounded-full text-on-primary/80 hover:text-on-primary hover:bg-white/10 transition-colors"
              aria-label="Cerrar ventana de chat"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          <div
            data-testid="chatbot-messages"
            className="flex-1 p-4 overflow-y-auto bg-surface-bright flex flex-col"
          >
            {messages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                <ChatMessageBubble
                  sender={msg.sender}
                  text={msg.text}
                  time={msg.time}
                />
                {index === 0 && messages.length === 1 && suggestedPresets.length > 0 && (
                  <div
                    data-testid="chatbot-presets"
                    className="flex flex-wrap gap-2 pl-9 pr-2 mt-1 mb-2"
                  >
                    {suggestedPresets.map((preset, presetIdx) => (
                      <button
                        key={preset.label}
                        type="button"
                        data-testid={`chatbot-preset-${presetIdx}`}
                        onClick={() => handlePresetClick(preset)}
                        className="text-left px-3 py-1.5 rounded-2xl text-xs font-label-sm font-medium bg-surface-container-low text-primary border border-surface-container-highest hover:border-secondary/50 hover:bg-surface-container transition-colors duration-150 shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}

            {isTyping && (
              <div
                data-testid="chatbot-typing-indicator"
                className="flex items-center gap-2 text-on-surface-variant text-xs italic py-1 self-start"
              >
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                <span>Asistente Emuná está escribiendo...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-surface border-t border-surface-container-high flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={500}
              placeholder="Escribí tu consulta aquí..."
              aria-label="Mensaje para el asistente"
              data-testid="chatbot-input"
              className="flex-1 px-4 py-2.5 rounded-full bg-surface-container text-xs sm:text-sm text-primary placeholder-on-surface-variant/60 border border-transparent focus:outline-none focus:border-secondary/50 focus:bg-surface"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              aria-label="Enviar mensaje"
              data-testid="chatbot-send-btn"
              className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
            >
              <Icon name="send" className="text-[18px]" />
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}
