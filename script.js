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
    $$("#navMenu a").forEach((a) => {
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
      chips.forEach((c) => c.classList.remove("chip--active"));
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
        chips.forEach((c) => c.classList.remove("chip--active"));
        setAmount(v);
      }
    });
  }

  // donate buttons (open modal)
  const donateTriggers = [
    "#donateBtnTop",
    "#donateBtnHero",
    "#donateBtnShop",
    "#donateBtnSection",
  ]
    .map((sel) => $(sel))
    .filter(Boolean);

  donateTriggers.forEach((btn) => {
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

  // gallery lightbox (main gallery + tower galleries + event galleries)
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  if (lightbox && lightboxImg) {
    bindClose(lightbox);

    // Inject prev/next buttons into the lightbox figure
    const figure = lightbox.querySelector(".lightbox__figure");
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "lightbox__nav lightbox__nav--prev";
    prevBtn.setAttribute("aria-label", "Предыдущее фото");
    prevBtn.innerHTML = "‹";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "lightbox__nav lightbox__nav--next";
    nextBtn.setAttribute("aria-label", "Следующее фото");
    nextBtn.innerHTML = "›";

    if (figure) {
      figure.appendChild(prevBtn);
      figure.appendChild(nextBtn);
    }

    const TRIGGER_SELECTOR =
      ".thumb, .gallery-item, .tower-gallery__thumb, .familyMiniGallery__item, .eventGallery__item";
    let currentGroup = [];
    let currentIndex = 0;

    function showAt(index) {
      if (!currentGroup.length) return;
      currentIndex = (index + currentGroup.length) % currentGroup.length;
      const trigger = currentGroup[currentIndex];
      lightboxImg.src = trigger.dataset.full;
      lightboxImg.alt = trigger.getAttribute("aria-label") || "";
    }

    function next() { showAt(currentIndex + 1); }
    function prev() { showAt(currentIndex - 1); }

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(TRIGGER_SELECTOR);
      if (!trigger) return;
      const src = trigger.dataset.full;
      if (!src) return;
      e.preventDefault();

      const container =
        trigger.closest(".tower-gallery, .gallery-grid, .gallery, .familyMiniGallery, .eventGallery") ||
        document;
      currentGroup = Array.from(container.querySelectorAll(TRIGGER_SELECTOR));
      currentIndex = currentGroup.indexOf(trigger);
      if (currentIndex < 0) currentIndex = 0;

      showAt(currentIndex);
      openModal(lightbox);
    });

    // Arrow button clicks (stop propagation so they don't bubble to backdrop)
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prev(); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); next(); });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (lightbox.getAttribute("aria-hidden") !== "false") return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    });

    // Click left/right half of the image to navigate
    lightboxImg.addEventListener("click", (e) => {
      const rect = lightboxImg.getBoundingClientRect();
      if (e.clientX - rect.left < rect.width / 2) prev();
      else next();
    });

    // Right-click to go back
    lightboxImg.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      prev();
    });
  }

  // families "show all" demo
  const familiesAllBtn = $("#familiesAllBtn");
  const familiesGrid = $("#familiesGrid");
  if (familiesAllBtn && familiesGrid) {
    familiesAllBtn.addEventListener("click", () => {
      const current = familiesGrid.children.length;
      const target = 12;
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

  // demo links to be replaced
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

(function initDonations() {
  var selectedAmount = 500; // по умолчанию — подсвеченный чип 500 ₽

  // ─── Чипы с суммами ────────────────────────────────────────
  var chips = document.querySelectorAll('.donateBox__row .chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('chip--active'); });
      chip.classList.add('chip--active');
      selectedAmount = parseInt(chip.dataset.amount, 10) || 0;
      // Если пользователь выбрал чип — очищаем своё значение
      var custom = document.getElementById('customAmount');
      if (custom) custom.value = '';
    });
  });

  // ─── Поле «своя сумма» ─────────────────────────────────────
  var customInput = document.getElementById('customAmount');
  if (customInput) {
    customInput.addEventListener('input', function () {
      var val = parseInt(customInput.value.replace(/\D/g, ''), 10);
      if (val > 0) {
        selectedAmount = val;
        chips.forEach(function (c) { c.classList.remove('chip--active'); });
      }
    });
  }

  // ─── Отправка пожертвования ────────────────────────────────
  function submitDonation(btn) {
    var comment = '';
    var commentEl = document.getElementById('donateComment');
    if (commentEl) comment = commentEl.value.trim();

    if (!selectedAmount || selectedAmount < 10) {
      alert('Пожалуйста, выберите или введите сумму от 10 ₽.');
      return;
    }

    // Блокируем кнопку
    var originalText = '';
    if (btn) {
      originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Перенаправляем на оплату…';
    }

    fetch('/donate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: selectedAmount,
        comment: comment
      })
    })
      .then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
      .then(function (res) {
        if (!res.ok || !res.data || !res.data.ok || !res.data.confirmation_url) {
          throw new Error((res.data && res.data.error) || 'Неизвестная ошибка');
        }
        // Редирект на страницу оплаты ЮKassa
        window.location.href = res.data.confirmation_url;
      })
      .catch(function (err) {
        alert('Не удалось создать платёж: ' + err.message + '\nПопробуйте ещё раз.');
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
  }

  // ─── Кнопки, открывающие оплату напрямую ───────────────────
  var directBtn = document.getElementById('donateBtnSection');
  if (directBtn) {
    directBtn.addEventListener('click', function () { submitDonation(directBtn); });
  }

  // ─── Кнопки «Пожертвовать» в шапке/герое/shop ──────────────
  // Просто скроллим к секции #donate, пользователь выбирает сумму там.
  ['donateBtnTop', 'donateBtnHero', 'donateBtnShop'].forEach(function (id) {
    var b = document.getElementById(id);
    if (!b) return;
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('donate');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();