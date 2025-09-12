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

      // Init
      track.style.willChange = "transform";
      track.style.backfaceVisibility = "hidden";
      track.querySelectorAll("img").forEach((img) => {
        img.setAttribute("draggable", "false");
        img.setAttribute("decoding", "async");
      });
      goTo(0, false);
      startAuto();

      // Pointer events
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

      // Keyboard
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

      // Resize
      window.addEventListener("resize", () => {
        slideW = container.clientWidth;
        goTo(index, false);
      });
    }
  }

  // ---------- JAM OPERASIONAL ----------
  function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById("current-time");
    const dateElement = document.getElementById("current-date");

    if (timeElement) {
      const timeString = now.toLocaleTimeString("id-ID");
      timeElement.textContent = timeString;
    }

    if (dateElement) {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      const dateString = now.toLocaleDateString("id-ID", options);
      dateElement.textContent = dateString;
    }

    checkBusinessHours(now);
  }

  function checkBusinessHours(now) {
    const statusElement = document.getElementById("status-indicator");
    if (!statusElement) return;

    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    let status = "closed";
    let statusText = "Tutup";
    let statusDescription = "";

    if (day >= 1 && day <= 5) {
      // Senin - Jumat
      const morningOpen = 8 * 60;
      const morningClose = 12 * 60;
      const afternoonOpen = 13 * 60;
      const afternoonClose = 16 * 60;

      if (
        currentTimeInMinutes >= morningOpen &&
        currentTimeInMinutes <= morningClose
      ) {
        status = "open";
        statusText = "Buka";
        const closingTime = new Date(now);
        closingTime.setHours(12, 0, 0, 0);
        statusDescription =
          "Buka hingga " +
          closingTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          });
      } else if (
        currentTimeInMinutes >= afternoonOpen &&
        currentTimeInMinutes <= afternoonClose
      ) {
        status = "open";
        statusText = "Buka";
        const closingTime = new Date(now);
        closingTime.setHours(16, 0, 0, 0);
        statusDescription =
          "Buka hingga " +
          closingTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          });
      } else if (
        currentTimeInMinutes > morningClose &&
        currentTimeInMinutes < afternoonOpen
      ) {
        status = "break";
        statusText = "Istirahat";
        const openingTime = new Date(now);
        openingTime.setHours(13, 0, 0, 0);
        statusDescription =
          "Buka kembali " +
          openingTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          });
      } else {
        statusDescription = "Buka besok 08:00";
      }
    } else if (day === 6) {
      // Sabtu
      const openTime = 8 * 60;
      const closeTime = 12 * 60 + 30;
      if (
        currentTimeInMinutes >= openTime &&
        currentTimeInMinutes <= closeTime
      ) {
        status = "open";
        statusText = "Buka";
        const closingTime = new Date(now);
        closingTime.setHours(12, 30, 0, 0);
        statusDescription =
          "Buka hingga " +
          closingTime.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
          });
      } else {
        statusDescription = "Buka Senin 08:00";
      }
    } else if (day === 0) {
      // Minggu
      statusDescription = "Buka Senin 08:00";
    }

    statusElement.textContent = statusText;
    statusElement.className =
      "operational-hours__status operational-hours__status--" + status;

    if (statusDescription) {
      statusElement.setAttribute("title", statusDescription);
    }
  }

  window.toggleScheduleDetails = function () {
    const details = document.getElementById("schedule-details");
    const arrow = document.getElementById("schedule-arrow");
    if (details && arrow) {
      details.classList.toggle("visible");
      arrow.textContent = details.classList.contains("visible") ? "▲" : "▼";
    }
  };

  // Update jam setiap detik
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // ---------- SMART SEARCH SUGGESTIONS ----------
  const searchInput = document.getElementById("q");
  const suggestionsList = document.getElementById("suggestions");
  const searchForm = document.querySelector(".kbms-search");

  // Database produk dan layanan dengan kategori
  const searchDatabase = [
    // TABUNGAN - semua kata kunci yang mengarah ke Tabungan.html
    {
      keywords: ["tabungan", "menabung", "simpanan"],
      title: "Tabungan Syariah",
      url: "Tabungan.html"
    },
    {
      keywords: ["deposito", "berjangka", "investasi"],
      title: "Deposito Berjangka",
      url: "Tabungan.html"
    },
    {
      keywords: ["kurban", "qurban", "tabungan kurban"],
      title: "Tabungan Kurban",
      url: "Tabungan.html"
    },
    {
      keywords: ["pendidikan", "sekolah", "kuliah", "tabungan pendidikan"],
      title: "Tabungan Pendidikan",
      url: "Tabungan.html"
    },
    {
      keywords: ["lebaran", "hari raya", "paket lebaran", "tabungan lebaran"],
      title: "Paket Lebaran",
      url: "Tabungan.html"
    },
    {
      keywords: ["haji", "umroh", "umrah", "tabungan haji"],
      title: "Tabungan Haji & Umroh",
      url: "Tabungan.html"
    },
    {
      keywords: ["wadiah", "mudharabah", "bagi hasil"],
      title: "Produk Tabungan",
      url: "Tabungan.html"
    },

    // PEMBIAYAAN - semua kata kunci yang mengarah ke Pembiayaan.html
    {
      keywords: ["pembiayaan", "pinjaman", "kredit"],
      title: "Pembiayaan Syariah",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["murabahah", "murabaha", "jual beli"],
      title: "Pembiayaan Murabahah",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["qardh", "qardhul", "qardh hasan", "pinjaman kebajikan"],
      title: "Qardh Hasan",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["mudharabah", "bagi hasil", "kerjasama"],
      title: "Pembiayaan Mudharabah",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["musyarakah", "syirkah", "kemitraan"],
      title: "Pembiayaan Musyarakah",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["umkm", "usaha", "modal usaha", "bisnis"],
      title: "Pembiayaan UMKM",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["rumah", "properti", "kpr", "perumahan"],
      title: "Pembiayaan Rumah",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["motor", "mobil", "kendaraan", "otomotif"],
      title: "Pembiayaan Kendaraan",
      url: "Pembiayaan.html"
    },
    {
      keywords: ["modal kerja", "working capital", "kas"],
      title: "Pembiayaan Modal Kerja",
      url: "Pembiayaan.html"
    }
  ];

  if (searchInput && suggestionsList) {
    // Fungsi untuk mencari suggestions
    function showSuggestions(query) {
      suggestionsList.innerHTML = "";

      if (!query || query.length < 1) {
        suggestionsList.style.display = "none";
        return;
      }

      const queryLower = query.toLowerCase();
      const matches = [];
      const addedTitles = new Set(); // Hindari duplikasi

      // Cari yang cocok dengan kata kunci
      searchDatabase.forEach((item) => {
        const isMatch = item.keywords.some(
          (keyword) =>
            keyword.toLowerCase().includes(queryLower) ||
            queryLower.includes(keyword.toLowerCase())
        );

        if (isMatch && !addedTitles.has(item.title)) {
          matches.push(item);
          addedTitles.add(item.title);
        }
      });

      // Batasi hasil maksimal 5 suggestions
      const limitedMatches = matches.slice(0, 5);

      if (limitedMatches.length === 0) {
        suggestionsList.style.display = "none";
        return;
      }

      // Buat elemen suggestion
      limitedMatches.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = item.title;
        li.tabIndex = 0;
        li.style.cursor = "pointer";

        // Highlight kata yang cocok
        const regex = new RegExp(`(${queryLower})`, "gi");
        if (item.title.toLowerCase().includes(queryLower)) {
          li.innerHTML = item.title.replace(regex, "<strong>$1</strong>");
        }

        // Event click
        li.addEventListener("click", () => {
          searchInput.value = item.title;
          suggestionsList.style.display = "none";
          window.location.href = item.url;
        });

        // Event keyboard
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            searchInput.value = item.title;
            suggestionsList.style.display = "none";
            window.location.href = item.url;
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextItem = li.nextElementSibling;
            if (nextItem) nextItem.focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevItem = li.previousElementSibling;
            if (prevItem) {
              prevItem.focus();
            } else {
              searchInput.focus();
            }
          }
        });

        suggestionsList.appendChild(li);
      });

      suggestionsList.style.display = "block";
    }

    // Event input
    searchInput.addEventListener("input", (e) => {
      showSuggestions(e.target.value.trim());
    });

    // Event keyboard navigation untuk input
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const firstSuggestion = suggestionsList.querySelector("li");
        if (firstSuggestion) firstSuggestion.focus();
      } else if (e.key === "Escape") {
        suggestionsList.style.display = "none";
      }
    });

    // Handle form submit
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();

        if (!query) return;

        // Cari match terbaik
        let bestMatch = null;
        let bestScore = 0;

        searchDatabase.forEach((item) => {
          item.keywords.forEach((keyword) => {
            if (keyword.toLowerCase() === query) {
              // Exact match = skor tertinggi
              if (3 > bestScore) {
                bestScore = 3;
                bestMatch = item;
              }
            } else if (keyword.toLowerCase().includes(query)) {
              // Partial match = skor sedang
              if (2 > bestScore) {
                bestScore = 2;
                bestMatch = item;
              }
            } else if (query.includes(keyword.toLowerCase())) {
              // Query contains keyword = skor rendah
              if (1 > bestScore) {
                bestScore = 1;
                bestMatch = item;
              }
            }
          });
        });

        if (bestMatch) {
          window.location.href = bestMatch.url;
        } else {
          // Fallback: jika tidak ada match, beri tahu user
          alert(
            "Produk tidak ditemukan. Silakan coba kata kunci lain seperti 'tabungan' atau 'pembiayaan'."
          );
        }

        suggestionsList.style.display = "none";
      });
    }

    // Click outside untuk menutup suggestions
    document.addEventListener("click", (e) => {
      if (!searchForm.contains(e.target)) {
        suggestionsList.style.display = "none";
      }
    });
  }

  // ---------- FOOTER YEAR ----------
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
