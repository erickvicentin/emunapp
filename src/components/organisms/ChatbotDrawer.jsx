import React, { useState, useRef } from 'react';
import Icon from '../atoms/Icon';
import ChatMessageBubble from '../molecules/ChatMessageBubble';
import { ASSISTANT_PRESETS, STUDIO_INFO } from '../../data/landingData';

/**
 * ChatbotDrawer Organism
 * AI Assistant conversational interface aligned with CONTEXT.md Section 6:
 * Handles questions about studio location, cancellation policy (2 hs), packages, and schedule.
 */
export default function ChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Bienvenida/o a Emuná Pilates. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy sobre nuestras clases, horarios o membresías?',
      time: 'Ahora',
    },
  ]);
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

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    // Simulate intelligent assistant response (prepared for backend Cloud Functions & Gemini integration)
    setTimeout(() => {
      const lower = query.toLowerCase();
      let responseText = '';

      if (lower.includes('cancel') || lower.includes('anticipac') || lower.includes('reprogram')) {
        responseText =
          'En Emuná podés reprogramar o cancelar tus turnos con hasta 2 horas de anticipación para que el crédito se reintegre automáticamente a tu paquete móvil. Las cancelaciones con menos de 2 horas se registran como clase consumida.';
      } else if (lower.includes('donde') || lower.includes('ubicac') || lower.includes('direccion') || lower.includes('llegar')) {
        responseText =
          `Nos encontramos en ${STUDIO_INFO.address} (frente a la plazoleta arbolada). La zona es tranquila, con amplias veredas y fácil estacionamiento.`;
      } else if (lower.includes('precio') || lower.includes('tarifa') || lower.includes('plan') || lower.includes('paquete') || lower.includes('cuanto cuesta')) {
        responseText =
          'Nuestras membresías mensuales con vigencia móvil son:\n• 4 Clases: $24.000 (1x semana)\n• 8 Clases: $38.500 (2x semana - Más elegido)\n• 12 Clases: $49.000 (3x semana)\n• 20 Clases: $68.000 (Pase diario)\nPodés abonar por transferencia bancaria o tarjeta sin recargo.';
      } else if (lower.includes('cupo') || lower.includes('cama') || lower.includes('cuantas personas') || lower.includes('grupo')) {
        responseText =
          'Trabajamos con un cupo estricto de máximo 4 personas por turno en camillas de madera de guatambú, garantizando corrección y cuidado kinesiológico personalizado.';
      } else if (lower.includes('horario') || lower.includes('turno') || lower.includes('abierto')) {
        responseText =
          `Nuestros horarios de práctica son de ${STUDIO_INFO.hours.weekdays} y ${STUDIO_INFO.hours.saturday}. ¿Te gustaría que te comuniquemos con la administradora por WhatsApp para coordinar tu primer turno?`;
      } else if (
        lower.includes('clima') ||
        lower.includes('futbol') ||
        lower.includes('politica') ||
        lower.includes('receta')
      ) {
        // Enforcing CONTEXT.md Section 6 boundary rule:
        responseText =
          'Como asistente virtual de Emuná Pilates, solo puedo responder consultas sobre las clases, horarios, ubicación, paquetes y políticas del estudio. ¿Tenés alguna duda sobre tu práctica de pilates?';
      } else {
        responseText =
          '¡Gracias por tu consulta! En Emuná contamos con clases de Reformer en grupos reducidos de hasta 4 camas. Para una atención detallada o situaciones particulares, podés escribirle directamente a nuestra instructora por WhatsApp al ' +
          STUDIO_INFO.phone;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: responseText,
          time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
      scrollToBottom();
    }, 700);
  };

  const handlePresetClick = (preset) => {
    handleSendMessage(preset.query);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual de Emuná'}
          aria-expanded={isOpen}
          className="group relative flex items-center gap-3 pl-3 pr-5 py-3 rounded-full bg-primary-container text-on-primary shadow-xl hover:shadow-2xl transition-[transform,box-shadow] duration-300 hover:scale-[1.02] active:scale-95 border border-white/10"
        >
          {/* Avatar Badge with pulsating indicator */}
          <div className="relative w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs shadow-inner">
            <Icon name="smart_toy" className="text-[20px]" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            </span>
          </div>

          {/* Contextual Copy */}
          <div className="flex flex-col text-left">
            <span className="font-label-sm text-label-sm text-secondary-fixed tracking-wide uppercase font-semibold flex items-center gap-1">
              Asistente Virtual IA
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-fixed" />
            </span>
            <span className="font-label-md text-label-md text-on-primary font-medium whitespace-nowrap">
              {isOpen ? 'Cerrar conversación' : '¿Dudas sobre horarios o cupos?'}
            </span>
          </div>

          <Icon
            name={isOpen ? 'close' : 'chat_bubble'}
            className="text-secondary-fixed-dim text-[18px] group-hover:translate-x-0.5 transition-transform ml-1"
          />
        </button>
      </div>

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <dialog
          open
          aria-label="Asistente Conversacional de Emuná Pilates"
          className="fixed bottom-24 right-4 sm:right-6 z-50 m-0 p-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[80vh] bg-surface rounded-3xl shadow-2xl border border-surface-container-highest flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-primary-container text-on-primary flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
                <Icon name="smart_toy" className="text-[20px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-sm font-semibold text-on-primary">
                  Asistente Emuná
                </span>
                <span className="font-body-sm text-[11px] text-secondary-fixed flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En línea • Google Gemini API
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-on-primary/80 hover:text-on-primary hover:bg-white/10 transition-colors"
              aria-label="Cerrar ventana de chat"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="px-4 py-2.5 bg-surface-container-low border-b border-surface-container-high/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {ASSISTANT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-label-sm font-medium bg-surface text-primary border border-surface-container-high hover:border-secondary/40 hover:bg-surface-container transition-colors duration-150"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto bg-surface-bright flex flex-col">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                sender={msg.sender}
                text={msg.text}
                time={msg.time}
              />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-on-surface-variant text-xs italic py-1 self-start">
                <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" />
                <span>Emuná IA está respondiendo...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-surface border-t border-surface-container-high flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribí tu consulta aquí..."
              aria-label="Mensaje para el asistente"
              className="flex-1 px-4 py-2.5 rounded-full bg-surface-container text-xs sm:text-sm text-primary placeholder-on-surface-variant/60 border border-transparent focus:outline-none focus:border-secondary/50 focus:bg-surface"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              aria-label="Enviar mensaje"
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
