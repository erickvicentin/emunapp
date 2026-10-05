import React from 'react';
import Icon from '../atoms/Icon';

/**
 * ChatMessageBubble Molecule
 * For the AI Conversational Assistant
 * @param {Object} props
 * @param {'assistant'|'user'} props.sender
 * @param {string} props.text
 * @param {string} [props.time]
 */
export default function ChatMessageBubble({ sender = 'assistant', text, time }) {
  const isAssistant = sender === 'assistant';

  return (
    <div
      className={`flex items-start gap-2.5 my-2 max-w-[88%] ${
        isAssistant ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'
      }`}
    >
      {isAssistant ? (
        <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
          <Icon name="smart_toy" className="text-[16px]" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
          <Icon name="person" className="text-[16px]" />
        </div>
      )}

      <div
        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
          isAssistant
            ? 'bg-surface-container text-on-surface rounded-tl-xs shadow-xs border border-surface-container-high'
            : 'bg-primary-container text-on-primary rounded-tr-xs shadow-xs'
        }`}
      >
        <p className="whitespace-pre-line">{text}</p>
        {time && (
          <span
            className={`block text-[10px] mt-1 text-right ${
              isAssistant ? 'text-on-surface-variant/70' : 'text-on-primary/70'
            }`}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
