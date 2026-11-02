import { useCallback, useEffect, useState } from 'react';

const BASE_DELAY = 950;

// Animasiya oynadıcısı: addımlar, oynat/dayandır, sürət və klaviatura qısayolları.
export function usePlayer(active, blocked = false) {
  const [anim, setAnim] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing || !anim) return;
    if (index >= anim.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), BASE_DELAY / speed);
    return () => clearTimeout(t);
  }, [playing, index, anim, speed]);

  // Başqa struktura keçəndə animasiya dayanır.
  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  const run = useCallback((result) => {
    setAnim(result);
    setIndex(0);
    setPlaying(true);
  }, []);

  const reset = useCallback(() => {
    setAnim(null);
    setIndex(0);
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!anim) return;
    if (!playing && index >= anim.steps.length - 1) setIndex(0);
    setPlaying((p) => !p);
  }, [anim, playing, index]);

  const stepBy = useCallback(
    (d) => {
      if (!anim) return;
      setPlaying(false);
      setIndex((i) => Math.min(Math.max(i + d, 0), anim.steps.length - 1));
    },
    [anim]
  );

  const seek = useCallback((i) => {
    setPlaying(false);
    setIndex(i);
  }, []);

  // Space — oynat/dayandır, ← → — addımlar
  useEffect(() => {
    if (!active || blocked) return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') stepBy(1);
      else if (e.key === 'ArrowLeft') stepBy(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, blocked, togglePlay, stepBy]);

  return {
    anim,
    index,
    playing,
    speed,
    setSpeed,
    step: anim ? anim.steps[index] : null,
    run,
    reset,
    togglePlay,
    stepBy,
    seek,
  };
}
