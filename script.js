// script.js
document.addEventListener("DOMContentLoaded", () => {
  // ---------- NAV TOGGLE ----------
  const toggle = document.querySelector(".kbms-nav-toggle");
  const nav = document.querySelector(".kbms-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  // ---------- SLIDER ----------
  const container = document.querySelector(".kbms-slider");
  const track = document.querySelector(".kbms-slider__wrapper");
  if (!container || !track) {
    console.warn("Slider: elemen tidak lengkap.");
  } else {
    const slides = track.querySelectorAll(".kbms-slide");
    if (!slides.length) {
      console.warn("Slider: tidak ada .kbms-slide.");
    } else {
      // Pastikan setiap slide pas 1 layar
      slides.forEach(s => {
        s.style.minWidth = "100%";
        s.style.flex = "0 0 100%";
      });

      let index = 0;
      let dragging = false;
      let startX = 0;
      let deltaX = 0;
      let slideW = container.clientWidth;
      let autoTimer = null;

      const setX = (x, animate = false) => {
        track.style.transition = animate ? "transform 280ms ease-out" : "none";
        track.style.transform = `translate3d(${x}px,0,0)`;
      };

      const goTo = (i, animate = true) => {
        index = (i + slides.length) % slides.length;
        setX(-index * slideW, animate);
      };

      const startAuto = () => {
        stopAuto();
        autoTimer = setInterval(() => goTo(index + 1, true), 5000);
      };
      const stopAuto = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
      };

      // Init
      track.style.willChange = "transform";
      track.style.backfaceVisibility = "hidden";
      track.querySelectorAll("img").forEach(img => {
        img.setAttribute("draggable", "false");
        img.setAttribute("decoding", "async");
      });
      goTo(0, false);
      startAuto();

      // Pointer events
      container.style.touchAction = "pan-y"; // biar horizontal drag tidak bentrok dengan scroll
      container.addEventListener("pointerdown", (e) => {
        dragging = true;
        startX = e.clientX;
        deltaX = 0;
        stopAuto();
        setX(-index * slideW, false);
        try { track.setPointerCapture && track.setPointerCapture(e.pointerId); } catch {}
      });

      container.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        deltaX = e.clientX - startX;
        // geser mengikuti jari
        setX(-index * slideW + deltaX, false);
      });

      const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        // Threshold adaptif: 8% dari lebar slide (min 30px, max 80px)
        const thresh = Math.max(30, Math.min(80, slideW * 0.08));
        if (Math.abs(deltaX) > thresh) {
          goTo(deltaX < 0 ? index + 1 : index - 1, true);
        } else {
          goTo(index, true);
        }
        deltaX = 0;
        startAuto();
        try { track.releasePointerCapture && track.releasePointerCapture(e.pointerId); } catch {}
      };

      container.addEventListener("pointerup", endDrag);
      container.addEventListener("pointercancel", endDrag);
      container.addEventListener("pointerleave", endDrag);

      // Keyboard (opsional)
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") { goTo(index - 1); stopAuto(); startAuto(); }
        if (e.key === "ArrowRight") { goTo(index + 1); stopAuto(); startAuto(); }
      });

      // Resize
      window.addEventListener("resize", () => {
        slideW = container.clientWidth;
        goTo(index, false);
      });
    }
  }

  // ---------- FOOTER YEAR ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
