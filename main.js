/**
 * main.js — single-file SPA engine for the Warinthorn Savetamornkul portfolio.
 * =========================================================================
 * No framework, no build step. Native ES module, served over http://.
 *
 * Boot sequence:
 *   1. fetch('data.json')          → all portfolio content (strict JSON)
 *   2. renderApp(#app, data)       → build the ENTIRE DOM from that data:
 *                                    nav · hero · about · projects · artworks ·
 *                                    experience · skills · activities ·
 *                                    certifications · contact · lightbox ·
 *                                    scroll-to-top · footer
 *   3. hydrate + init behaviours   → project filter, project/artwork lightbox,
 *                                    scroll reveal, parallax décor, cursor
 *                                    trail, card tilt, scroll-to-top, nav.
 *
 * index.html is only a shell: <div id="app"></div>. Everything visual lives
 * here or in style.css.
 */

/* =========================================================================
   1. Painted-SVG placeholder generator (graceful image fallback)
   ========================================================================= */
const PALETTE = [
  "#f3dfa0", "#e2a695", "#d7cbe6", "#bdd4bd", "#bcd7e6", "#f0c6a3",
  "#f4b93f", "#ef8a5a", "#d9668f", "#9b8ad1", "#7fb069", "#57a8c9",
];
const WASH = ["#fbfaf7", "#fdf6ec", "#fbf2f5", "#f3f6f0", "#f1f6f8", "#fbf3ea"];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function paintedPlaceholder(seed, label) {
  const h = hashString(seed);
  const c1 = PALETTE[h % PALETTE.length];
  const c2 = PALETTE[(h >> 3) % PALETTE.length];
  const c3 = PALETTE[(h >> 6) % PALETTE.length];
  const wash = WASH[(h >> 2) % WASH.length];
  const cx = 20 + (h % 60);
  const cy = 20 + ((h >> 4) % 60);
  const r = 42 + (h % 34);
  const rot = h % 40;
  return `
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <rect width="200" height="150" fill="${wash}" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" opacity="0.6" />
      <circle cx="${200 - cx}" cy="${150 - cy}" r="${r * 0.7}" fill="${c2}" opacity="0.55" />
      <ellipse cx="${(cx + 90) % 200}" cy="${(cy + 60) % 150}" rx="${r * 0.4}" ry="${r * 0.22}"
        fill="${c3}" opacity="0.6" transform="rotate(${rot} ${(cx + 90) % 200} ${(cy + 60) % 150})" />
      <path d="M0,${100 + (h % 20)} Q 50,${60 + (h % 40)} 100,${100 + (h % 30)} T 200,${90 + (h % 25)} V150 H0 Z" fill="${c2}" opacity="0.32" />
      <circle cx="${(h >> 5) % 200}" cy="${(h >> 7) % 40}" r="5" fill="${c3}" opacity="0.7" />
    </svg>
    <span>${label}</span>
  `;
}

/* =========================================================================
   2. Small helpers
   ========================================================================= */
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* Resolve the preview image for a project or artwork:
   1. an explicit `image` path set in data.json, otherwise
   2. the convention path  assets/images/<kind>/<id>.png
   A missing/broken file triggers the <img> "error" handler below, which
   swaps in the seeded painted-SVG placeholder. */
function getImages(item, kind) {
  if (item.images && item.images.length > 0) return item.images;
  if (item.image) return [item.image];
  return [`assets/images/${kind}/${item.id}.png`];
}

// ฟังก์ชันช่วยจัดย่อหน้าข้อความ (เปลี่ยน \n เป็น <br>)
function formatText(str) {
  if (!str) return "";
  return escapeHtml(str).replace(/\n/g, '<br>');
}

// ฟังก์ชันเปิด/ปิดเสียงวิดีโอ
window.toggleMute = function(btn, event) {
  event.stopPropagation(); 
  const slide = btn.closest('.carousel-slide');
  // เปลี่ยนมาเจาะจงเฉพาะวิดีโอตัวหน้า (ตัวที่ชัด)
  const video = slide.querySelector('.media-fg'); 
  if (video && video.tagName === 'VIDEO') {
    video.muted = !video.muted;
    btn.querySelector('.icon-muted').style.display = video.muted ? 'block' : 'none';
    btn.querySelector('.icon-unmuted').style.display = video.muted ? 'none' : 'block';
  }
};

function buildCarouselHTML(images, id, label, isZoomable) {
  const createSlide = (src) => {
    const isVideo = src.toLowerCase().endsWith('.mp4');
    const zoomClass = (isZoomable && !isVideo) ? "zoomable" : "";
    
    if (isVideo) {
      return `
        <div class="carousel-slide ${zoomClass}">
          <!-- วิดีโอพื้นหลัง (เบลอ) -->
          <video class="media-bg" src="${escapeAttr(src)}" autoplay loop muted playsinline aria-hidden="true"></video>
          <!-- วิดีโอหลัก (ชัด) -->
          <video class="media-fg" src="${escapeAttr(src)}" autoplay loop muted playsinline></video>
          <button type="button" class="mute-toggle" aria-label="Toggle sound" onclick="toggleMute(this, event)">
            <svg class="icon-muted" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            <svg class="icon-unmuted" viewBox="0 0 24 24" style="display:none;"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
        </div>`;
    } else {
      return `
        <div class="carousel-slide ${zoomClass}">
          <!-- รูปพื้นหลัง (เบลอ) -->
          <img class="media-bg" src="${escapeAttr(src)}" aria-hidden="true" />
          <!-- รูปหลัก (ชัด) -->
          <img class="media-fg" src="${escapeAttr(src)}" data-fallback-seed="${escapeAttr(id)}" data-fallback-label="${escapeAttr(label)}" loading="lazy" />
        </div>`;
    }
  };

  if (images.length === 1) return createSlide(images[0]);
  const slides = images.map(createSlide).join("");
  return `<div class="carousel-container" data-slides="${images.length}"><div class="carousel-track">${slides}</div></div>`;
}

/* Wire every <img data-fallback-seed> inside `root` so a missing image
   is replaced by the painted placeholder instead of a broken-image icon. */
function attachImageFallback(root) {
  root.querySelectorAll("img[data-fallback-seed]").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        const wrapper = img.parentElement;
        if (wrapper) {
          wrapper.innerHTML = paintedPlaceholder(
            img.dataset.fallbackSeed,
            img.dataset.fallbackLabel || ""
          );
        }
      },
      { once: true }
    );
  });
}

/* =========================================================================
   3. Decorative painted marks (purely visual, aria-hidden, no pointer events)
   ========================================================================= */
const DECO = {
  hero: `
    <svg class="deco" data-parallax="14" style="top:16%; left:6%; width:90px;" viewBox="0 0 100 40" aria-hidden="true">
      <path d="M2 20 C 20 2, 40 38, 60 15 S 90 5, 98 22" stroke="#e2a695" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.6"/>
    </svg>
    <svg class="deco" data-parallax="8" style="bottom:20%; left:5%; width:60px;" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="26" fill="none" stroke="#d7cbe6" stroke-width="4" opacity="0.6"/>
    </svg>
    <svg class="deco" data-parallax="10" style="top:10%; right:8%; width:120px;" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="none" stroke="#f4b93f" stroke-width="3" stroke-dasharray="3 7" opacity="0.5"/>
    </svg>
    <svg class="deco" data-parallax="12" style="bottom:14%; right:12%; width:70px;" viewBox="0 0 70 70" aria-hidden="true">
      <path d="M35 4 C55 4 66 22 66 35 C66 54 50 66 35 66 C16 66 4 50 4 35 C4 18 18 4 35 4 Z" fill="#9b8ad1" opacity="0.25"/>
    </svg>`,
  work: `
    <svg class="deco" data-parallax="10" style="top:6%; left:-2%; width:70px;" viewBox="0 0 70 70" aria-hidden="true">
      <path d="M35 4 C55 4 66 22 66 35 C66 54 50 66 35 66 C16 66 4 50 4 35 C4 18 18 4 35 4 Z" fill="none" stroke="#d9668f" stroke-width="3" opacity="0.5"/>
    </svg>`,
  creative: `
    <svg class="deco" data-parallax="12" style="top:8%; right:2%; width:80px;" viewBox="0 0 80 40" aria-hidden="true">
      <path d="M2 20 C 15 2, 30 38, 42 15 S 65 5, 78 22" stroke="#f4b93f" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.55"/>
    </svg>`,
  experience: `
    <svg class="deco" data-parallax="9" style="bottom:8%; left:1%; width:56px;" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="24" fill="#7fb069" opacity="0.4"/>
    </svg>`,
  skills: `
    <svg class="deco" data-parallax="11" style="top:5%; right:3%; width:64px;" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="12" fill="none" stroke="#57a8c9" stroke-width="3" opacity="0.5" transform="rotate(12 32 32)"/>
    </svg>`,
  activities: `
    <svg class="deco" data-parallax="10" style="bottom:6%; right:1%; width:60px;" viewBox="0 0 60 60" aria-hidden="true">
      <path d="M30 4 L34 24 L54 24 L38 36 L44 56 L30 44 L16 56 L22 36 L6 24 L26 24 Z" fill="#ef8a5a" opacity="0.4"/>
    </svg>`,
  certifications: `
    <svg class="deco" data-parallax="9" style="top:4%; left:2%; width:50px;" viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#9b8ad1" stroke-width="3" stroke-dasharray="4 5" opacity="0.55"/>
    </svg>`,
};

/* =========================================================================
   4. Section templates  (pure functions: data → HTML string)
   ========================================================================= */
function navMarkup(data) {
  return `
  <header class="site-nav">
    <a class="brand" href="#hero">Warinthorn S<em>.</em></a>
    <nav aria-label="Primary">
      <ul class="nav-links" id="nav-links">
        ${data.nav
          .map((i) => {
            if (i.subLinks) {
              return `
                <li class="nav-dropdown">
                  <a href="${escapeAttr(i.href)}" style="cursor: default;" onclick="event.preventDefault();">${i.label}</a>
                  <ul class="nav-dropdown-menu">
                    ${i.subLinks.map(sub => `<li><a href="${escapeAttr(sub.href)}">${sub.label}</a></li>`).join("")}
                  </ul>
                </li>
              `;
            }
            return `<li><a href="${escapeAttr(i.href)}">${i.label}</a></li>`;
          })
          .join("")}
      </ul>
    </nav>
    <button class="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">
      <span></span>
    </button>
  </header>`;
}

function heroMarkup(data) {
  const p = data.profile;
  return `
  <section id="hero" class="hero">
    ${DECO.hero}
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="hero-eyebrow">HELLO, I'M</p>
        <h1 class="hero-name">${p.name}</h1>
        <ul class="hero-roles">${p.roles.map((r) => `<li>${r}</li>`).join("")}</ul>
        <p class="hero-tagline">${p.tagline}</p>
        <div class="hero-ctas">
          <a class="btn btn-primary" href="${escapeAttr(p.resumeUrl || "#")}" target="_blank" rel="noopener noreferrer">Resume</a>
          <a class="btn btn-ghost" href="#contact">Contact</a>
        </div>
      </div>
      <div class="hero-portrait">
        <div class="portrait-stack">
          <div class="portrait-frame-back" aria-hidden="true"></div>
          <div class="portrait-frame">
            <img
              src="${escapeAttr(p.photo || "assets/images/profile.jpg")}"
              alt="Portrait of ${escapeAttr(p.name)}"
              id="profile-photo"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function aboutMarkup(data) {
  const educations = data.profile.education;
  
  return `
  <section id="about" class="about section-pad">
    <div class="wrap about-grid">
      
      <!-- คอลัมน์ซ้าย: About -->
      <div class="about-copy" data-reveal>
        <div class="section-head" style="margin-bottom: var(--space-4);">
          <h2>About Me</h2>
        </div>
        
        <div style="font-family: var(--font-display); font-size: var(--step-2); color: var(--ink); font-weight: 400; max-width: 58ch; line-height: 1.5;">
          Hi, I’m <strong style="color: #785dc8; font-weight: 600;">Warinthorn Savetamornkul (Fern), <br> a senior ICT student at Mahidol University</strong>. Specializing in Interactive Multimedia.<br><br>
          I’m passionate about <strong style="color: #c9517c; font-weight: 600;">UX/UI design, Frontend development, Product design,</strong> and <strong style="color: #c9517c; font-weight: 600;">2D Animation</strong>. I love collaborating with others to turn complex ideas into intuitive, user-centered digital experiences.
        </div>
      </div>

      <!-- คอลัมน์ขวา: Education -->
      <div data-reveal>
        <div class="section-head" style="margin-bottom: var(--space-3);">
          <h2>Education</h2>
        </div>
        
        <ul class="timeline" style="padding-left: 1.5rem; max-width: none;">
          ${educations.map(e => `
          <li class="timeline-item">
            <h3 style="margin-bottom: 0.2em;">${escapeHtml(e.school)}</h3>
            <p style="margin-bottom: 0.2em; font-weight: 600; color: var(--ink);">${escapeHtml(e.degree)}</p>
            
            ${e.minor ? `<p style="font-size: 1rem; margin-bottom: ${e.gpa ? '0.1em' : '0.4em'};">Minor: ${escapeHtml(e.minor)}</p>` : ''}
            ${e.gpa ? `<p style="font-size: 1rem; margin-bottom: 0.4em;">GPA: ${escapeHtml(e.gpa)}</p>` : ''}
            ${e.activities ? `<p style="font-size: 1rem; margin-bottom: 0.4em; line-height: 1.4;">Activities: ${escapeHtml(e.activities)}</p>` : ''}
            
            <span class="note" style="background: color-mix(in srgb, ${e.note_color} 55%, white);">${escapeHtml(e.period)}</span>
          </li>
          `).join('')}
        </ul>
      </div>
      
    </div>
  </section>`;
}

function projectMeta(p) {
  return [
    `<span>${p.type}</span>`,
    p.achievement ? `<span class="achievement">${p.achievement}</span>` : "",
  ].join("");
}

function projectCard(p) {
  const catAttr = (p.categories || []).join("|");
  return `
        <article
          class="project-card"
          data-layout="${escapeAttr(p.layout)}"
          data-categories="${escapeAttr(catAttr)}"
          data-id="${escapeAttr(p.id)}"
          data-reveal
          role="button"
          tabindex="0"
          aria-haspopup="dialog"
          aria-label="View details for ${escapeAttr(p.title)}"
        >
          <div class="project-visual">
            <span class="visual-media">
              ${buildCarouselHTML(getImages(p, "projects"), p.id, p.placeholder, false)}
            </span>
            <span class="visual-hint" aria-hidden="true">View details &rarr;</span>
          </div>
          <div class="project-body">
            
            <div class="project-meta">
              ${(p.categories || []).map(c => `<span class="tag-category">${c}</span>`).join("")}
            </div>
            
            <h3 style="margin-top: 0.2rem;">${p.title}</h3>
            
            <div class="project-meta" style="margin-bottom: 0.2rem;">
              ${projectMeta(p)}
            </div>
            
            <p class="project-role">${p.role}</p>
            <p class="project-desc">${formatText(p.description)}</p>
          </div>
        </article>`;
}

function workMarkup(data) {
  return `
  <section id="work" class="work section-pad">
    ${DECO.work}
    <div class="wrap">
      <div class="section-head">
        <h2>Projects</h2>
        <!-- ลบข้อความ kicker ออกเรียบร้อย -->
      </div>
      <div class="work-filter" id="work-filter" role="tablist" aria-label="Filter projects by category"></div>
      <div class="work-grid" id="work-grid">
        ${data.projects.map(projectCard).join("")}
      </div>
    </div>
  </section>`;
}

function artPiece(a) {
  const type = a.type || "Artwork";
  // ดึงคำอธิบายมาแสดง ถ้าไม่มีให้ขึ้นข้อความแนะนำไว้ก่อน
  const desc = a.description || "เพิ่มคำอธิบายผลงานของคุณได้ที่นี่ (สามารถแก้ไขได้ในไฟล์ data.json)"; 
  const achieveHTML = a.achievement ? `<span class="achievement">${a.achievement}</span>` : "";

  return `
        <article
          class="project-card"
          data-id="${escapeAttr(a.id)}"
          data-reveal
          role="button"
          tabindex="0"
          aria-haspopup="dialog"
          aria-label="View artwork: ${escapeAttr(a.title)}"
        >
          <div class="project-visual">
            <span class="visual-media">
              ${buildCarouselHTML(getImages(a, "artworks"), a.id, "ARTWORK", false)}
            </span>
            <span class="visual-hint" aria-hidden="true">View details &rarr;</span>
          </div>
          <div class="project-body">
            
            <!-- ลบส่วน Tag Category ออกไปแล้ว -->
            
            <h3 style="margin-top: 0.2rem;">${a.title}</h3>
            
            <div class="project-meta" style="margin-bottom: 0.2rem;">
              <span>${escapeHtml(type)}</span>
              ${achieveHTML}
            </div>
            
            <!-- ลบ Role (Designer) ออก และใส่เป็นข้อความบรรยาย (Description) แทน -->
            <p class="project-desc">${formatText(desc)}</p>
          </div>
        </article>`;
}

function creativeMarkup(data) {
  return `
  <section id="creative" class="art-wall section-pad">
    ${DECO.creative}
    <div class="wrap">
      <div class="section-head">
        <h2>Creative &amp; Art Works</h2>
        <!-- ลบข้อความ kicker ออกเรียบร้อย -->
      </div>
      <div class="art-grid" id="art-grid">
        ${data.artworks.map(artPiece).join("")}
      </div>
    </div>
  </section>`;
}

function experienceMarkup(data) {
  return `
  <section id="experience" class="experience section-pad">
    ${DECO.experience}
    <div class="wrap">
      <div class="section-head"><h2>Work Experience</h2></div>
      <ul class="timeline">
        ${data.experience
      .map(
        (e) => `
        <li class="timeline-item" data-reveal>
          <h3>${e.title}</h3>
          <p>${e.org}</p>
          ${e.note ? `<span class="note">${e.note}</span>` : ""}
        </li>`
      )
      .join("")}
      </ul>
    </div>
  </section>`;
}

function skillsMarkup(data) {
  return `
  <section id="skills" class="skills section-pad">
    ${DECO.skills}
    <div class="wrap">
      <div class="section-head"><h2>Skills</h2></div>
      <div class="skills-grid" id="skills-grid">
        ${data.skills
      .map(
        (s) => `
        <article class="skill-card" data-cat="${escapeAttr(s.category)}" data-reveal tabindex="0">
          <h3>${s.category}</h3>
          <ul>${s.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        </article>`
      )
      .join("")}
      </div>
    </div>
  </section>`;
}

function activitiesMarkup(data) {
  return `
  <section id="activities" class="activities section-pad">
    ${DECO.activities}
    <div class="wrap">
      <div class="section-head"><h2>Activities</h2></div>
      <div class="activity-board" id="activity-board">
        ${data.activities
      .map(
        (a) => `
        <article class="activity-card" data-reveal>
          <h3>${a.title}</h3>
          <p>${a.role}</p>
        </article>`
      )
      .join("")}
      </div>
    </div>
  </section>`;
}

function certificationsMarkup(data) {
  return `
  <section id="certifications" class="certifications section-pad">
    ${DECO.certifications}
    <div class="wrap">
      <div class="section-head"><h2>Certificates</h2></div>
      <div class="cert-list" id="cert-list">
        ${data.certifications
      .map(
        (c, i) => {
          // เช็คว่ามีรูปหรือลิงก์ไหม ถ้ามีให้สร้างโครงสร้างขึ้นมา
          const imgHTML = c.image ? `<img src="${escapeAttr(c.image)}" alt="${escapeAttr(c.title)}" class="cert-img" loading="lazy">` : "";
          const linkHTML = c.url ? `<a href="${escapeAttr(c.url)}" target="_blank" rel="noopener noreferrer" class="cert-link">View Credential &rarr;</a>` : "";
          
          return `
          <article class="cert-card" data-reveal>
            <div class="cert-badge">${String(i + 1).padStart(2, "0")}</div>
            <h3>${c.title}</h3>
            <p>${c.issuer}</p>
            ${imgHTML}
            ${linkHTML}
          </article>`;
        }
      )
      .join("")}
      </div>
    </div>
  </section>`;
}

function contactMarkup(data) {
  const c = data.contact;
  return `
  <section id="contact" class="footer-contact section-pad">
    <div class="wrap contact-grid" data-reveal>
      <div class="contact-col">
        <h2 class="contact-brand">${c.brand}</h2>
        <div class="social-pills">
          ${(c.socials || [])
      .map(
        (s) =>
          `<a href="${escapeAttr(s.href)}" class="btn btn-ghost">${s.label}</a>`
      )
      .join("")}
        </div>
      </div>

      <div class="contact-col">
        <h3 class="col-heading">Quick Links</h3>
        <ul class="quick-links">
          ${data.nav
      // ใช้ flatMap เพื่อดึงเมนูย่อยออกมาเรียงต่อกัน และตัดคำว่า MORE ทิ้งไป
      .flatMap((n) => n.subLinks ? n.subLinks : [n])
      .map((n) => `<li><a href="${escapeAttr(n.href)}">${n.label}</a></li>`)
      .join("")}
        </ul>
      </div>

      <div class="contact-col">
        <h3 class="col-heading">Get in Touch</h3>
        <a href="mailto:${escapeAttr(c.email)}" class="email-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          ${c.email}
        </a>
      </div>
    </div>
  </section>`;
}

function lightboxMarkup() {
  return `
  <div class="lightbox" id="lightbox" aria-hidden="true">
    <div class="lightbox-backdrop" data-modal-close></div>
    <div class="lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <button type="button" class="lightbox-close" data-modal-close aria-label="Close">&times;</button>
      <div class="lightbox-visual" id="lightbox-visual"></div>
      <div class="lightbox-body">
        
        <div class="project-meta" id="lightbox-categories"></div>
        
        <h3 id="lightbox-title" style="margin-top: 0.2rem;"></h3>
        
        <div class="project-meta" id="lightbox-meta" style="margin-bottom: 0.2rem;"></div>
        
        <p class="lightbox-role" id="lightbox-role"></p>
        <p class="lightbox-desc" id="lightbox-desc"></p>
      </div>
    </div>
  </div>`;
}

function scrollTopMarkup() {
  return `
  <button type="button" class="scroll-top" id="scroll-top" aria-label="Scroll back to top">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  </button>`;
}

function footerMarkup(data) {
  return `
  <footer class="site-footer">
    <p>&copy; <span id="year"></span> ${data.profile.name}. Built by hand with HTML, CSS and JavaScript.</p>
  </footer>`;
}

/* =========================================================================
   5. Shared lightbox  (projects + artworks)
   ========================================================================= */
let lastFocusedEl = null;

function openLightbox({ title, role, desc, metaHTML, categoriesHTML, item, kind, fallbackSeed, fallbackLabel }) {
  const overlay = document.getElementById("lightbox");
  if (!overlay) return;

  lastFocusedEl = document.activeElement;
  const visual = document.getElementById("lightbox-visual");
  const imgs = getImages(item, kind);
  
  visual.innerHTML = `
    <span class="visual-media">
      ${buildCarouselHTML(imgs, fallbackSeed, fallbackLabel, true)}
    </span>
  `;
  attachImageFallback(visual);

  document.getElementById("lightbox-title").textContent = title;

  const roleEl = document.getElementById("lightbox-role");
  roleEl.textContent = role || "";
  roleEl.hidden = !role;

  const descEl = document.getElementById("lightbox-desc");
  descEl.innerHTML = formatText(desc);
  descEl.hidden = !desc;

  // อัปเดตข้อมูล Categories
  const catEl = document.getElementById("lightbox-categories");
  if (catEl) {
    catEl.innerHTML = categoriesHTML || "";
    catEl.hidden = !categoriesHTML;
  }

  // อัปเดตข้อมูล Meta (Type/Award)
  const metaEl = document.getElementById("lightbox-meta");
  if (metaEl) {
    metaEl.innerHTML = metaHTML || "";
    metaEl.hidden = !metaHTML;
  }

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  overlay.querySelector(".lightbox-close")?.focus();

  // เรียกใช้ระบบสไลด์ภาพและซูม
  if (typeof initCarousels === 'function') initCarousels();
  if (typeof initZoom === 'function') initZoom();
}

function closeLightbox() {
  const overlay = document.getElementById("lightbox");
  if (!overlay || !overlay.classList.contains("is-open")) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  lastFocusedEl?.focus?.();
}

function initLightbox() {
  const overlay = document.getElementById("lightbox");
  if (!overlay) return;
  overlay.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function projectLightbox(p) {
  const catsHTML = (p.categories || []).map(c => `<span class="tag-category">${escapeHtml(c)}</span>`).join("");
  openLightbox({
    title: p.title,
    role: p.role,
    desc: p.description,
    categoriesHTML: catsHTML,
    metaHTML: projectMeta(p),
    item: p,
    kind: "projects",
    fallbackSeed: p.id,
    fallbackLabel: p.placeholder,
  });
}

function artworkLightbox(a) {
  const type = a.type || "Artwork";
  const desc = a.description || "เพิ่มคำอธิบายผลงานของคุณได้ที่นี่ (สามารถแก้ไขได้ในไฟล์ data.json)";
  const achieveHTML = a.achievement ? `<span class="achievement">${a.achievement}</span>` : "";
  
  const metaHTML = `<span>${escapeHtml(type)}</span>${achieveHTML}`;

  openLightbox({
    title: a.title,
    role: "", // ลบ role ออกเพื่อให้ว่าง
    desc: desc, // ดึงข้อความบรรยายมาแสดง
    categoriesHTML: "", // ลบหมวดหมู่ tag บนสุดออก
    metaHTML: metaHTML,
    item: a,
    kind: "artworks",
    fallbackSeed: a.id,
    fallbackLabel: "ARTWORK",
  });
}

/* =========================================================================
   6. Hydration  (attach listeners / fallbacks to the freshly rendered DOM)
   ========================================================================= */
function bindCardOpen(card, open) {
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
}

function hydrateWork(data) {
  const grid = document.getElementById("work-grid");
  if (!grid) return;
  attachImageFallback(grid);
  grid.querySelectorAll(".project-card").forEach((card) => {
    const p = data.projects.find((x) => x.id === card.dataset.id);
    if (p) bindCardOpen(card, () => projectLightbox(p));
  });
  initWorkFilter(data);
}

function hydrateCreative(data) {
  const grid = document.getElementById("art-grid");
  if (!grid) return;
  attachImageFallback(grid);
  
  grid.querySelectorAll(".project-card").forEach((piece) => {
    const a = data.artworks.find((x) => x.id === piece.dataset.id);
    if (a) bindCardOpen(piece, () => artworkLightbox(a));
  });
}

function initWorkFilter(data) {
  const bar = document.getElementById("work-filter");
  if (!bar) return;

  const cats = ["All", "UX/UI Design", "Game Design", "2D Animation"];

  bar.innerHTML = cats
    .map(
      (c, i) => `
        <button type="button" class="filter-pill${i === 0 ? " is-active" : ""}" data-filter="${escapeAttr(c)}" role="tab" aria-selected="${i === 0}">
          ${c}
        </button>
      `
    )
    .join("");

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    bar.querySelectorAll(".filter-pill").forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-selected", "true");
    applyWorkFilter(btn.dataset.filter);
  });
}

function applyWorkFilter(filter) {
  document.querySelectorAll("#work-grid .project-card").forEach((card) => {
    const cats = (card.dataset.categories || "").split("|").filter(Boolean);
    const match = filter === "All" || cats.includes(filter);
    card.classList.toggle("is-hidden", !match);
  });
}

function initProfilePhoto() {
  const img = document.getElementById("profile-photo");
  if (!img) return;
  img.addEventListener(
    "error",
    () => {
      const frame = img.closest(".portrait-frame");
      if (frame) {
        frame.innerHTML = `<div class="portrait-fallback">${paintedPlaceholder(
          "profile-photo",
          "ADD YOUR PHOTO"
        )}</div>`;
      }
    },
    { once: true }
  );
}

function setFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* =========================================================================
   7. Behaviours  (navigation, motion, cursor, scroll-to-top)
   ========================================================================= */
function initNav() {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const sections = document.querySelectorAll("#main-content section[id]");

  if (!nav) return;

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    },
    { passive: true }
  );

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });

    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("is-open");
      })
    );
  }

  if (!sections.length) return;
  const navLinks = document.querySelectorAll(".nav-links a");
  const byHref = new Map([...navLinks].map((a) => [a.getAttribute("href"), a]));

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("is-active"));
          byHref.get(`#${entry.target.id}`)?.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((s) => spy.observe(s));
}

function initScrollReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
    io.observe(el);
  });
}

function initParallaxDecor() {
  const layer = document.querySelectorAll("[data-parallax]");
  if (!layer.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return;

  let mouseX = 0.5;
  let mouseY = 0.5;
  let ticking = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    },
    { passive: true }
  );

  function applyParallax() {
    layer.forEach((el) => {
      const depth = parseFloat(el.dataset.parallax) || 10;
      const x = (mouseX - 0.5) * depth;
      const y = (mouseY - 0.5) * depth;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    ticking = false;
  }
}

function initBrushTrail() {
  if (window.matchMedia("(hover: none)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dot = document.createElement("div");
  dot.className = "brush-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);

  let visible = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      dot.style.opacity = "0.5";
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      visible = true;
      clearTimeout(dot._hideTimer);
      dot._hideTimer = setTimeout(() => {
        if (visible) dot.style.opacity = "0";
      }, 500);
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", () => (dot.style.opacity = "0"));
}

function initProjectTilt() {
  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${py * -2}deg`);
      card.style.setProperty("--tilt-y", `${px * 2}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

/**
 * Floating "scroll to top" button — hidden until the user has scrolled
 * roughly one viewport, then fades in. rAF-throttled passive scroll
 * handler; CSS owns the animation via the `is-visible` class.
 */
function initScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const threshold = () => Math.min(window.innerHeight * 0.9, 640);
  let ticking = false;

  const update = () => {
    btn.classList.toggle("is-visible", window.scrollY > threshold());
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  update();
}

/* =========================================================================
   CUSTOM BEHAVIOURS: Carousel & Zoom
   ========================================================================= */
function initCarousels() {
  if (window.carouselIntervals) {
    window.carouselIntervals.forEach(clearInterval);
  }
  window.carouselIntervals = [];

  document.querySelectorAll('.carousel-container').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const count = parseInt(carousel.dataset.slides) || 1;
    if (count <= 1 || !track) return;

    let index = 0;
    let autoSlide;

    const updateSlide = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    const nextSlide = () => {
      index = (index + 1) % count;
      updateSlide();
    };

    const prevSlide = () => {
      index = (index - 1 + count) % count;
      updateSlide();
    };

    // ฟังก์ชันเริ่มสไลด์อัตโนมัติ (และตั้งเวลาใหม่ทุกครั้งที่กดเลื่อนเอง)
    const startAutoSlide = () => {
      clearInterval(autoSlide);
      autoSlide = setInterval(nextSlide, 3000);
      window.carouselIntervals.push(autoSlide);
    };

    startAutoSlide();

    // ระบบคลิกปุ่มซ้าย-ขวา
    const btnPrev = carousel.querySelector('.carousel-prev');
    const btnNext = carousel.querySelector('.carousel-next');
    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation(); // กันไม่ให้คำสั่งทะลุไปโดนกลไกซูม
        prevSlide();
        startAutoSlide(); 
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
        startAutoSlide();
      });
    }

    // ระบบปัดซ้าย-ขวา (Swipe) สำหรับมือถือ
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeThreshold = 40; // ต้องปัดนิ้วอย่างน้อย 40px ถึงจะเลื่อน
      if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide(); // ปัดซ้ายไปภาพถัดไป
        startAutoSlide();
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide(); // ปัดขวากลับภาพเดิม
        startAutoSlide();
      }
    };
  });
}

function initZoom() {
  document.querySelectorAll('.zoomable').forEach(container => {
    let isZoomed = false;

    container.addEventListener('dblclick', (e) => {
      isZoomed = !isZoomed;
      container.classList.toggle('is-zoomed', isZoomed);
      
      // ชี้เป้าไปที่รูปภาพหลัก (.media-fg)
      const img = container.querySelector('.media-fg');
      if (!isZoomed && img) {
        img.style.transformOrigin = `center center`;
      } else if (isZoomed && img) {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
      }
    });

    container.addEventListener('mousemove', (e) => {
      if (!isZoomed) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const img = container.querySelector('.media-fg');
      if (img) img.style.transformOrigin = `${x}% ${y}%`;
    });
    
    container.addEventListener('mouseleave', () => {
      isZoomed = false;
      container.classList.remove('is-zoomed');
      const img = container.querySelector('.media-fg');
      if (img) img.style.transformOrigin = `center center`;
    });
  });
}

/* =========================================================================
   8. App bootstrap
   ========================================================================= */
function renderApp(app, data) {
  app.innerHTML = [
    `<a class="skip-link" href="#main-content">Skip to content</a>`,
    navMarkup(data),
    `<main id="main-content">`,
    heroMarkup(data),
    aboutMarkup(data),
    workMarkup(data),
    creativeMarkup(data),
    experienceMarkup(data),
    skillsMarkup(data),
    activitiesMarkup(data),
    certificationsMarkup(data),
    contactMarkup(data),
    `</main>`,
    lightboxMarkup(),
    scrollTopMarkup(),
    footerMarkup(data),
  ].join("");

  /* hydrate data-driven interactivity */
  hydrateWork(data);
  hydrateCreative(data);
  setFooterYear();

  /* wire behaviours (order mirrors the pre-SPA boot sequence) */
  initNav();
  initScrollReveal();
  initParallaxDecor();
  initBrushTrail();
  initProjectTilt();
  initProfilePhoto();
  initLightbox();
  initScrollTop();
  initCarousels();
}

async function boot() {
  const app = document.getElementById("app");
  if (!app) return;

  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load data.json (HTTP ${res.status})`);
    const data = await res.json();
    renderApp(app, data);
  } catch (err) {
    console.error("[portfolio] failed to initialise:", err);
    app.innerHTML =
      `<div class="load-error" role="alert">` +
      `<h1>Couldn’t load the portfolio</h1>` +
      `<p>${escapeHtml(err && err.message ? err.message : String(err))}</p>` +
      `<p>If you opened this page from the file system, serve it over HTTP so ` +
      `<code>fetch()</code> can read <code>data.json</code> — e.g. ` +
      `<code>python3 -m http.server</code>, then open ` +
      `<code>http://localhost:8000</code>.</p>` +
      `</div>`;
  }
}

boot();
