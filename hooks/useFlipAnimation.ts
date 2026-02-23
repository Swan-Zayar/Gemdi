import { useState, useRef, useEffect } from 'react';
import { StudySession } from '../types';

export function useFlipAnimation(
  sessions: StudySession[],
  onDelete: (id: string) => void
) {
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const flipPositionsRef = useRef<Map<string, { top: number; left: number }>>(new Map());

  // FLIP Steps 3-5 — fires when sessions state updates and the deleting card is gone
  useEffect(() => {
    if (!deletingSession) return;
    if (sessions.some(s => s.id === deletingSession)) return;

    // Card is gone from state — run FLIP then clear the flag
    const firstPositions = flipPositionsRef.current;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('[data-session-card]').forEach(el => {
          const cardId = (el as HTMLElement).dataset.sessionCard!;
          const first = firstPositions.get(cardId);
          if (!first) return;
          const last = el.getBoundingClientRect();
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
          const htmlEl = el as HTMLElement;
          htmlEl.style.transition = 'none';
          htmlEl.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            htmlEl.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
            htmlEl.style.transform = '';
            htmlEl.addEventListener('transitionend', () => {
              htmlEl.style.transition = '';
            }, { once: true });
          });
        });
        setDeletingSession(null);
        flipPositionsRef.current = new Map();
      });
    });
  }, [sessions, deletingSession]);

  const triggerDelete = (sessionId: string) => {
    setDeletingSession(sessionId);

    setTimeout(() => {
      const deletedId = sessionId;

      // FLIP Step 1 — snapshot positions now (after height collapse, before React removes the card)
      const firstPositions = new Map<string, { top: number; left: number }>();
      document.querySelectorAll('[data-session-card]').forEach(el => {
        const id = (el as HTMLElement).dataset.sessionCard!;
        if (id === deletedId) return;
        const r = el.getBoundingClientRect();
        firstPositions.set(id, { top: r.top, left: r.left });
      });
      flipPositionsRef.current = firstPositions;

      // NOTE: do NOT clear deletingSession here — the useEffect above handles it
      // once the session is actually gone from state (after the async Firebase delete)
      onDelete(deletedId);
    }, 500);
  };

  return { deletingSession, triggerDelete };
}
