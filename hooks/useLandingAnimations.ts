import React, { useRef, useState, useEffect } from 'react';

/** Hook that cycles through phrases with a typewriter typing/deleting effect */
export function useTypewriter(phrases: string[], typingMs = 80, deletingMs = 40, pauseMs = 1500): string {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!isDeleting && charCount < current.length) {
      const id = setTimeout(() => setCharCount(c => c + 1), typingMs);
      return () => clearTimeout(id);
    }

    if (!isDeleting && charCount === current.length) {
      const id = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(id);
    }

    if (isDeleting && charCount > 0) {
      const id = setTimeout(() => setCharCount(c => c - 1), deletingMs);
      return () => clearTimeout(id);
    }

    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setPhraseIndex(i => (i + 1) % phrases.length);
    }
  }, [charCount, isDeleting, phraseIndex, phrases, typingMs, deletingMs, pauseMs]);

  return phrases[phraseIndex].slice(0, charCount);
}

/** Hook that tracks whether the element is currently in view (toggles on scroll) */
export function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}
