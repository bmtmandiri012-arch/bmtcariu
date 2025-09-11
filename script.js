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
// Script untuk jam operasional
      // Fungsi untuk memperbarui waktu dan tanggal
      function updateDateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        // Format waktu
        const timeString = now.toLocaleTimeString('id-ID');
        timeElement.textContent = timeString;
        // Format tanggal
        const options = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        const dateString = now.toLocaleDateString('id-ID', options);
        dateElement.textContent = dateString;
        // Periksa status buka/tutup
        checkBusinessHours(now);
      }
      // Fungsi untuk memeriksa jam operasional
      function checkBusinessHours(now) {
        const statusElement = document.getElementById('status-indicator');
        const day = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
        const hours = now.getHours();
        const minutes = now.getMinutes();
        // Konversi ke menit untuk memudahkan perbandingan
        const currentTimeInMinutes = hours * 60 + minutes;
        let status = 'closed';
        let statusText = 'Tutup';
        let statusDescription = '';
        if (day >= 1 && day <= 5) { // Senin - Jumat
          // Pagi: 08:00 - 12:00
          const morningOpen = 8 * 60; // 08:00
          const morningClose = 12 * 60; // 12:00
          // Siang: 13:00 - 16:00
          const afternoonOpen = 13 * 60; // 13:00
          const afternoonClose = 16 * 60; // 16:00
          if (currentTimeInMinutes >= morningOpen && currentTimeInMinutes <= morningClose) {
            status = 'open';
            statusText = 'Buka';
            const closingTime = new Date(now);
            closingTime.setHours(12, 0, 0, 0);
            statusDescription = 'Buka hingga ' + closingTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            });
          } else if (currentTimeInMinutes >= afternoonOpen && currentTimeInMinutes <= afternoonClose) {
            status = 'open';
            statusText = 'Buka';
            const closingTime = new Date(now);
            closingTime.setHours(16, 0, 0, 0);
            statusDescription = 'Buka hingga ' + closingTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            });
          } else if (currentTimeInMinutes > morningClose && currentTimeInMinutes < afternoonOpen) {
            status = 'break';
            statusText = 'Istirahat';
            const openingTime = new Date(now);
            openingTime.setHours(13, 0, 0, 0);
            statusDescription = 'Buka kembali ' + openingTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            });
          } else {
            statusDescription = 'Buka besok 08:00';
          }
        } else if (day === 6) { // Sabtu
          const openTime = 8 * 60; // 08:00
          const closeTime = 12 * 60 + 30; // 12:30
          if (currentTimeInMinutes >= openTime && currentTimeInMinutes <= closeTime) {
            status = 'open';
            statusText = 'Buka';
            const closingTime = new Date(now);
            closingTime.setHours(12, 30, 0, 0);
            statusDescription = 'Buka hingga ' + closingTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            });
          } else {
            statusDescription = 'Buka Senin 08:00';
          }
        } else if (day === 0) { // Minggu
          statusDescription = 'Buka Senin 08:00';
        }
        // Perbarui tampilan status
        statusElement.textContent = statusText;
        statusElement.className = 'operational-hours__status operational-hours__status--' + status;
        // Tambahkan deskripsi status jika ada
        if (statusDescription) {
          statusElement.setAttribute('title', statusDescription);
        }
      }
      // Fungsi untuk menampilkan/sembunyikan detail jadwal
      window.toggleScheduleDetails = function() {
        const details = document.getElementById('schedule-details');
        const arrow = document.getElementById('schedule-arrow');
        details.classList.toggle('visible');
        if (details.classList.contains('visible')) {
          arrow.textContent = '▲';
        } else {
          arrow.textContent = '▼';
        }
      }
      // Perbarui waktu setiap detik
      updateDateTime();
      setInterval(updateDateTime, 1000);
      // Tahun di footer
      document.getElementById('year').textContent = new Date().getFullYear();
      
  // ---------- FOOTER YEAR ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
