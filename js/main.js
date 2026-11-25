document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Ouvrir le menu");
    }));
  }

  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Highlight today's opening time. The displayed hours come from the owner's supplied schedule.
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const today = new Date().getDay();
  const todayRow = document.querySelector('.hours-row[data-day="' + today + '"]');
  const status = document.getElementById("today-status");
  if (todayRow) {
    todayRow.classList.add("is-today");
    const time = todayRow.querySelector("time")?.textContent || "";
    const openAt = time.split("—")[0]?.trim();
    if (status) status.textContent = dayNames[today] + " : ouverture prévue à " + openAt + ".";
  }

  const copyButton = document.getElementById("copy-hours");
  const feedback = document.getElementById("copy-feedback");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const lines = Array.from(document.querySelectorAll(".hours-row")).map(row =>
        row.querySelector("span").textContent + " : " + row.querySelector("time").textContent.replace("—", "à")
      );
      const value = "Le Mint — Bar lounge, Remiremont\n" + lines.join("\n");
      try {
        await navigator.clipboard.writeText(value);
        if (feedback) feedback.textContent = "Horaires copiés.";
      } catch {
        if (feedback) feedback.textContent = "La copie n'est pas disponible sur ce navigateur.";
      }
    });
  }

  // Lightbox: gallery images open on click, close on button, backdrop or Escape.
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const closeButton = document.querySelector(".lightbox-close");
  let lastTrigger = null;
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (lightboxImage) { lightboxImage.src = ""; lightboxImage.alt = ""; }
    if (lastTrigger) lastTrigger.focus();
  };
  document.querySelectorAll(".gallery-card").forEach(button => {
    button.addEventListener("click", () => {
      const src = button.getAttribute("data-image");
      const img = button.querySelector("img");
      if (!src || !lightbox || !lightboxImage) return;
      lastTrigger = button;
      lightboxImage.src = src;
      lightboxImage.alt = img?.alt || "Photographie du Mint";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      closeButton?.focus();
    });
  });
  closeButton?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeLightbox(); });

  // Subtle 3D tilt on gallery cards and magnetic feedback on primary buttons.
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.querySelectorAll(".gallery-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 2.5) + "deg) rotateY(" + (x * 3) + "deg)";
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
    document.querySelectorAll(".button").forEach(button => {
      button.addEventListener("pointermove", event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .035;
        const y = (event.clientY - rect.top - rect.height / 2) * .06;
        button.style.transform = "translate(" + x + "px," + y + "px)";
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });
  }
});
