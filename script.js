const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
const sections = [...document.querySelectorAll("[data-section]")];
const pageLinks = [...document.querySelectorAll('a[href^="#"]')];
const pageIds = new Set(sections.map((section) => section.id));

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});

function closeMenu() {
  nav?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
}

function showPage(pageId, { updateHistory = true } = {}) {
  const selectedId = pageIds.has(pageId) ? pageId : "home";

  sections.forEach((section) => {
    const active = section.id === selectedId;
    section.hidden = !active;
    section.classList.toggle("is-active-panel", active);
    section.classList.toggle("is-visible", active);

    if (active) {
      requestAnimationFrame(() => {
        section.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-shown"));
      });
    }
  });

  pageLinks.forEach((link) => {
    const isPageLink = pageIds.has(link.hash.slice(1));
    if (!isPageLink) return;
    const active = link.hash === `#${selectedId}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  closeMenu();
  window.scrollTo({ top: 0, behavior: "auto" });

  if (updateHistory && window.location.hash !== `#${selectedId}`) {
    window.history.pushState({ page: selectedId }, "", `#${selectedId}`);
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const pageId = link.hash.slice(1);
  if (!pageIds.has(pageId)) return;
  event.preventDefault();
  showPage(pageId);
});

window.addEventListener("popstate", () => showPage(window.location.hash.slice(1), { updateHistory: false }));
showPage(window.location.hash.slice(1) || "home", { updateHistory: false });

const projectTabs = [...document.querySelectorAll('.project-tabs [role="tab"]')];
const projectPanels = [...document.querySelectorAll('.projects [role="tabpanel"]')];

function activateProjectTab(tab) {
  projectTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });

  projectPanels.forEach((panel) => {
    const active = panel.id === tab.getAttribute("aria-controls");
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
}

projectTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateProjectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % projectTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + projectTabs.length) % projectTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = projectTabs.length - 1;
    else return;

    event.preventDefault();
    projectTabs[nextIndex].focus();
    activateProjectTab(projectTabs[nextIndex]);
  });
});

const galleryRoots = [...document.querySelectorAll("[data-gallery-page]")];
const galleryData = window.ATOP_GALLERY || {};
const galleryGroups = Object.entries(galleryData);
const galleryImages = [];
const longestGroup = Math.max(0, ...galleryGroups.map(([, items]) => items.length));

for (let imageIndex = 0; imageIndex < longestGroup; imageIndex += 1) {
  galleryGroups.forEach(([group, items]) => {
    if (items[imageIndex]) galleryImages.push({ ...items[imageIndex], group });
  });
}

const galleryPageSize = 10;
galleryRoots.forEach((galleryRoot) => {
  const page = Number(galleryRoot.dataset.galleryPage || 0);
  const start = page * galleryPageSize;
  galleryImages.slice(start, start + galleryPageSize).forEach((item, offset) => {
    const index = start + offset;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-item";
    button.dataset.galleryIndex = String(index);
    button.setAttribute("aria-label", `Xem hình ảnh công trình ATOP tại ${item.group}`);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = offset < 4 ? "eager" : "lazy";
    image.decoding = "async";
    button.append(image);
    galleryRoot.append(button);
  });
});

const lightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
let lightboxIndex = 0;

function showGalleryImage(index) {
  if (!galleryImages.length || !lightboxImage || !lightboxCaption) return;
  lightboxIndex = (index + galleryImages.length) % galleryImages.length;
  const item = galleryImages[lightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = `${item.group} · ${item.caption} · ${lightboxIndex + 1}/${galleryImages.length}`;
}

galleryRoots.forEach((galleryRoot) => {
  galleryRoot.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-item");
    if (!button || !lightbox) return;
    showGalleryImage(Number(button.dataset.galleryIndex));
    lightbox.showModal();
  });
});

lightbox?.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
lightbox?.querySelector(".lightbox-prev")?.addEventListener("click", () => showGalleryImage(lightboxIndex - 1));
lightbox?.querySelector(".lightbox-next")?.addEventListener("click", () => showGalleryImage(lightboxIndex + 1));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showGalleryImage(lightboxIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(lightboxIndex + 1);
});

document.querySelector("#year").textContent = new Date().getFullYear();
