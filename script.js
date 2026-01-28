(function () {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  
    // year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // mobile menu
    const navToggle = $("#navToggle");
    const navMenu = $("#navMenu");
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
  
      // close menu on link click
      $$("#navMenu a").forEach(a => {
        a.addEventListener("click", () => {
          navMenu.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  
    // smooth anchor scroll
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id.length < 2) return;
  
      const el = document.querySelector(id);
      if (!el) return;
  
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  
    // modals
    function openModal(modal) {
      if (!modal) return;
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeModal(modal) {
      if (!modal) return;
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  
    function bindClose(modal) {
      if (!modal) return;
      modal.addEventListener("click", (e) => {
        const close = e.target.closest("[data-close='true']");
        if (close) closeModal(modal);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
          closeModal(modal);
        }
      });
    }
  
    const donateModal = $("#donateModal");
    const filterModal = $("#filterModal");
    bindClose(donateModal);
    bindClose(filterModal);
  
    // donate amount selection
    let selectedAmount = 500;
    const chips = $$(".chip");
    const customAmount = $("#customAmount");
    const modalAmount = $("#modalAmount");
  
    function setAmount(val) {
      selectedAmount = val;
      if (modalAmount) modalAmount.textContent = `${val} ₽`;
    }
  
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("chip--active"));
        chip.classList.add("chip--active");
        const v = Number(chip.dataset.amount || "0");
        if (customAmount) customAmount.value = "";
        setAmount(v || 500);
      });
    });
  
    if (customAmount) {
      customAmount.addEventListener("input", () => {
        const digits = customAmount.value.replace(/[^\d]/g, "");
        customAmount.value = digits;
        const v = Number(digits || "0");
        if (v > 0) {
          chips.forEach(c => c.classList.remove("chip--active"));
          setAmount(v);
        }
      });
    }
  
    // donate buttons (open modal)
    const donateTriggers = ["#donateBtnTop", "#donateBtnHero", "#donateBtnShop", "#donateBtnSection"]
      .map(sel => $(sel))
      .filter(Boolean);
  
    donateTriggers.forEach(btn => {
      btn.addEventListener("click", () => {
        setAmount(selectedAmount || 500);
        openModal(donateModal);
      });
    });
  
    // filters
    const mapFilterBtn = $("#mapFilterBtn");
    if (mapFilterBtn) {
      mapFilterBtn.addEventListener("click", () => openModal(filterModal));
    }
  
    // gallery lightbox
    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightboxImg");
    if (lightbox) {
      bindClose(lightbox);
      $$(".thumb").forEach((t) => {
        t.addEventListener("click", () => {
          const src = t.dataset.full;
          if (!src || !lightboxImg) return;
          lightboxImg.src = src;
          openModal(lightbox);
        });
      });
    }
  
    // families "show all" demo
    const familiesAllBtn = $("#familiesAllBtn");
    const familiesGrid = $("#familiesGrid");
    if (familiesAllBtn && familiesGrid) {
      familiesAllBtn.addEventListener("click", () => {
        // demo: add more placeholder cards
        const current = familiesGrid.children.length;
        const target = 12; // show a bit more in demo
        for (let i = current; i < target; i++) {
          const card = document.createElement("article");
          card.className = "family";
          card.innerHTML = `
            <div class="family__badge">Фамилия</div>
            <h3>Фамилия №${i + 1}</h3>
            <p class="muted">Короткая справка. Позже это будет страница с генеалогическим древом.</p>
            <button class="btn btn--ghost btn--small familyMore">Открыть →</button>
          `;
          familiesGrid.appendChild(card);
        }
        familiesAllBtn.textContent = "Каталог будет на отдельной странице";
        familiesAllBtn.disabled = true;
        familiesAllBtn.style.opacity = "0.75";
      });
    }
  
    // Demo links to be replaced
    const placeholders = [
      ["#map3dLink", "https://example.org/3d-map"],
      ["#tourLink", "https://example.org/3d-tour"],
      ["#mapLink", "https://example.org/map"],
    ];
    placeholders.forEach(([sel, url]) => {
      const el = $(sel);
      if (el) el.setAttribute("href", url);
    });
  
  })();
  