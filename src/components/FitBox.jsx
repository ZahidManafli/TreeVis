import { useLayoutEffect, useRef, useState } from 'react';

// Məzmunu kətanın ölçüsünə sığdırır: lazım olanda kiçildir (heç vaxt böyütmür),
// beləliklə geniş massiv/cədvəl kənara daşmır və həmişə mərkəzdə qalır.
export default function FitBox({ children, padX = 32, padY = 72 }) {
  const outer = useRef(null);
  const inner = useRef(null);
  const [fit, setFit] = useState({ scale: 1, w: 0, h: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const o = outer.current;
      const i = inner.current;
      if (!o || !i) return;
      const availW = o.clientWidth - padX;
      const availH = o.clientHeight - padY;
      const w = i.offsetWidth;
      const h = i.offsetHeight;
      if (availW <= 0 || availH <= 0 || !w || !h) return; // gizli iş sahəsi
      const scale = Math.min(1, availW / w, availH / h);
      setFit((f) => (f.scale === scale && f.w === w && f.h === h ? f : { scale, w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer.current);
    ro.observe(inner.current);
    return () => ro.disconnect();
  }, [padX, padY]);

  return (
    <div ref={outer} className="fit-box">
      <div style={{ width: fit.w * fit.scale || undefined, height: fit.h * fit.scale || undefined }}>
        <div ref={inner} className="fit-inner" style={{ transform: `scale(${fit.scale})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
