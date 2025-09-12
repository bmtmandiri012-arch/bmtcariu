// script.js (paste keseluruhan ini, ganti file lama)
document.addEventListener("DOMContentLoaded", () => {
  // ---------- NAV TOGGLE ----------
  const toggle = document.querySelector(".kbms-nav-toggle");
  const nav = document.querySelector(".kbms-nav");
  if (toggle && nav)
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));

  // ---------- SLIDER ----------
  const container = document.querySelector(".kbms-slider");
  const track = document.querySelector(".kbms-slider__wrapper");
  if (container && track) {
    const slides = track.querySelectorAll(".kbms-slide");
    if (slides.length) {
      slides.forEach((s) => {
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

      track.style.willChange = "transform";
      track.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
        img.setAttribute("decoding", "async");
      });
      goTo(0, false);
      startAuto();

      container.style.touchAction = "pan-y";
      container.addEventListener("pointerdown", (e) => {
        dragging = true;
        startX = e.clientX;
        deltaX = 0;
        stopAuto();
        setX(-index * slideW, false);
        try {
          track.setPointerCapture && track.setPointerCapture(e.pointerId);
        } catch {}
      });

      container.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        deltaX = e.clientX - startX;
        setX(-index * slideW + deltaX, false);
      });

      const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        const thresh = Math.max(30, Math.min(80, slideW * 0.08));
        if (Math.abs(deltaX) > thresh) {
          goTo(deltaX < 0 ? index + 1 : index - 1, true);
        } else {
          goTo(index, true);
        }
        deltaX = 0;
        startAuto();
        try {
          track.releasePointerCapture &&
            track.releasePointerCapture(e.pointerId);
        } catch {}
      };

      container.addEventListener("pointerup", endDrag);
      container.addEventListener("pointercancel", endDrag);
      container.addEventListener("pointerleave", endDrag);

      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          goTo(index - 1);
          stopAuto();
          startAuto();
        }
        if (e.key === "ArrowRight") {
          goTo(index + 1);
          stopAuto();
          startAuto();
        }
      });

      window.addEventListener("resize", () => {
        slideW = container.clientWidth;
        goTo(index, false);
      });
    }
  }

  // ---------- SEARCH SUGGESTIONS ----------
  const searchInput = document.getElementById("q");
  const suggestionsList = document.getElementById("suggestions");
  const produkData = [
    "Tabungan",
    "Deposito Berjangka",
    "Pembiayaan Syariah",
    "Pembukaan Rekening",
    "Mobile Banking"
  ];

  if (searchInput && suggestionsList) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      suggestionsList.innerHTML = "";

      if (!query) {
        suggestionsList.style.display = "none";
        return;
      }

      const filtered = produkData.filter((item) =>
        item.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        suggestionsList.style.display = "none";
        return;
      }

      filtered.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        li.tabIndex = 0;
        li.addEventListener("click", () => {
          searchInput.value = item;
          suggestionsList.innerHTML = "";
          suggestionsList.style.display = "none";
        });
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            searchInput.value = item;
            suggestionsList.innerHTML = "";
            suggestionsList.style.display = "none";
          }
        });
        suggestionsList.appendChild(li);
      });
      suggestionsList.style.display = "block";
    });

    // Klik di luar → tutup suggestion
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".kbms-search") &&
        !e.target.closest("#suggestions")
      ) {
        suggestionsList.innerHTML = "";
        suggestionsList.style.display = "none";
      }
    });
  }
  // kode JS tambahan untuk search ke tabungan.html
  const produk = [
    { name: "Tabungan", url: "tabungan.html" },
    { name: "Deposito", url: "produk-deposito.html" },
    { name: "Pembiayaan", url: "produk-pembiayaan.html" }
  ];

  const input = document.getElementById("q");
  const suggestions = document.getElementById("suggestions");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    suggestions.innerHTML = "";

    if (query.length > 0) {
      const matches = produk.filter((item) =>
        item.name.toLowerCase().includes(query)
      );

      matches.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item.name;
        li.addEventListener("click", () => {
          window.location.href = item.url;
        });
        suggestions.appendChild(li);
      });

      suggestions.style.display = matches.length ? "block" : "none";
    } else {
      suggestions.style.display = "none";
    }
  });

  document.querySelector(".kbms-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.toLowerCase();
    const match = produk.find((item) =>
      item.name.toLowerCase().includes(query)
    );
    if (match) {
      window.location.href = match.url;
    }
  });
// Tambahkan di akhir file JS Anda
function togglePersyaratan(jenis) {
  const content = document.getElementById(`persyaratan-${jenis}`);
  const button = document.getElementById(`btn-${jenis}`);
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    button.textContent = 'Sembunyikan Cara Buka Rekening';
  } else {
    content.style.display = 'none';
    button.textContent = 'Cara Buka Rekening';
  }
}
  // ---------- FOOTER YEAR ----------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
