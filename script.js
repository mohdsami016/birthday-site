// 1. Grab the elements we need from the page
const nameInput = document.getElementById("name");
const msgInput = document.getElementById("msg");
const cardName = document.getElementById("cardName");
const cardMsg = document.getElementById("cardMsg");

// 2. Copy what the user typed onto the card
function updateCard() {
  cardName.textContent = nameInput.value.trim() || "Your special one";
  cardMsg.textContent = msgInput.value.trim();
}

// 3. Run updateCard every time the user types in either box
nameInput.addEventListener("input", updateCard);
msgInput.addEventListener("input", updateCard);

// 4. Run it once when the page loads
updateCard();
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const statusLine = document.getElementById("statusLine");
const colors = ["#f7b32b", "#c21e66", "#12a3a7", "#ff6ba3", "#ff8a3d"];
let pieces = [];
let running = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function celebrate() {
  // Start the confetti from the middle of the card
  const box = document.getElementById("card").getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 3;

  for (let i = 0; i < 150; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 9;
    pieces.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 120 + Math.random() * 100,
    });
  }

  if (!running) {
    running = true;
    requestAnimationFrame(animate);
  }
  statusLine.textContent = "Happy birthday, " + cardName.textContent + "!";
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pieces.forEach(function (p) {
    p.vy += 0.2;   // gravity pulls it down
    p.vx *= 0.99;  // air slows it sideways
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
  });

  // Keep only pieces that are still alive and on screen
  pieces = pieces.filter(function (p) {
    return p.life > 0 && p.y < canvas.height + 20;
  });

  if (pieces.length > 0) {
    requestAnimationFrame(animate);
  } else {
    running = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

document.getElementById("celebrate").addEventListener("click", celebrate);

document.getElementById("copy").addEventListener("click", function () {
  const text =
        "Happy birthday, " + cardName.textContent + "! \uD83C\uDF82\n\n" + cardMsg.textContent +
    (cardFrom.textContent ? "\n\n" + cardFrom.textContent : "");
  navigator.clipboard.writeText(text).then(
    function () { statusLine.textContent = "Copied. Paste it into WhatsApp."; },
    function () { statusLine.textContent = "Could not copy. Select the card text and copy it yourself."; }
  );
});
const toneSelect = document.getElementById("tone");

// Ready-made wishes. {name} gets replaced with the typed name.
const wishes = {
  heartfelt: [
    "{name}, I hope this year is gentler on you and kinder to your dreams than the last. I'm lucky to have you in my life. Happy birthday.",
    "Another year older, and you are still the first person I'd call with good news. Thank you for always showing up. Wishing you a day full of people who love you, {name}.",
    "May this birthday bring you rest where you are tired, joy where you have been waiting, and everything you quietly hope for. I'm glad you were born, {name}.",
  ],
  funny: [
    "Happy birthday, {name}! You're not getting older, you're becoming a more valuable antique. Eat the cake and ignore the fire hazard on top.",
    "{name}, another lap around the sun and you still haven't learned to charge your phone before 1%. Happy birthday to the undefeated.",
    "Today you are officially allowed to be dramatic about your age. Use the power wisely, {name}. Cake first, questions later.",
  ],
  short: [
    "Happy birthday, {name}! Wishing you a wonderful year ahead.",
    "Many happy returns of the day, {name}. Make it a good one.",
    "Cheers to you today, {name}. All the best, always.",
  ],
};

let variant = 0;     // which of the 3 wishes we are showing
let edited = false;  // true once the user types in the message box

function fillMessage() {
  const list = wishes[toneSelect.value];
  const name = nameInput.value.trim() || "dear one";
  msgInput.value = list[variant % list.length].replaceAll("{name}", name);
  updateCard();
}

toneSelect.addEventListener("change", function () {
  edited = false;
  variant = 0;
  fillMessage();
});

document.getElementById("another").addEventListener("click", function () {
  edited = false;
  variant += 1;
  fillMessage();
});

// If the user types their own message, stop overwriting it
msgInput.addEventListener("input", function () {
  edited = true;
});

// Changing the name rewrites the wish, unless the user edited it by hand
nameInput.addEventListener("input", function () {
  if (!edited) fillMessage();
});

fillMessage(); // show a wish as soon as the page opens
const fromInput = document.getElementById("from");
const skinSelect = document.getElementById("skin");
const cardFrom = document.getElementById("cardFrom");
const card = document.getElementById("card");

function updateExtras() {
  const from = fromInput.value.trim();
  cardFrom.textContent = from ? "From " + from : "";
  card.dataset.skin = skinSelect.value;
}

fromInput.addEventListener("input", updateExtras);
skinSelect.addEventListener("change", updateExtras);
updateExtras();
const dateInput = document.getElementById("date");
const peopleList = document.getElementById("peopleList");
const emptyNote = document.getElementById("emptyNote");
const STORAGE_KEY = "birthdayPeople";

// --- Saving and loading (the browser's localStorage) ---
function loadPeople() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function savePeople() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
}

let people = loadPeople();

// --- Date maths ---
function daysUntil(dateText) {
  const parts = dateText.split("-"); // "2005-11-12" -> ["2005", "11", "12"]
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let next = Date.UTC(now.getFullYear(), month - 1, day);
  if (next < today) {
    next = Date.UTC(now.getFullYear() + 1, month - 1, day); // already passed this year
  }
  return Math.round((next - today) / 86400000); // milliseconds in a day
}

function formatDate(dateText) {
  const parts = dateText.split("-");
  return new Date(2000, Number(parts[1]) - 1, Number(parts[2]))
    .toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

// --- Drawing the list ---
function renderList() {
  peopleList.textContent = "";
  emptyNote.hidden = people.length > 0;

  const sorted = people.slice().sort(function (a, b) {
    return daysUntil(a.date) - daysUntil(b.date); // nearest birthday first
  });

  sorted.forEach(function (person) {
    const days = daysUntil(person.date);
    const li = document.createElement("li");

    const info = document.createElement("span");
    info.textContent = person.name + " \u00B7 " + formatDate(person.date);

    const when = document.createElement("span");
    when.className = "days";
    when.textContent = days === 0 ? "Today" : days === 1 ? "Tomorrow" : "in " + days + " days";

    const wishBtn = document.createElement("button");
    wishBtn.type = "button";
    wishBtn.className = "linkbtn";
    wishBtn.textContent = "Wish";
    wishBtn.addEventListener("click", function () {
      nameInput.value = person.name;
      dateInput.value = person.date;
      edited = false;
      variant = 0;
      fillMessage();
      celebrate();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "linkbtn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      if (confirm("Remove " + person.name + " from your list?")) {
        people = people.filter(function (p) { return p.id !== person.id; });
        savePeople();
        renderList();
      }
    });

    li.append(info, when, wishBtn, removeBtn);
    peopleList.appendChild(li);
  });
}

// --- The Save button ---
document.getElementById("save").addEventListener("click", function () {
  const name = nameInput.value.trim();
  if (!name || !dateInput.value) {
    statusLine.textContent = "Add their name and birthday first.";
    return;
  }

  const existing = people.find(function (p) {
    return p.name.toLowerCase() === name.toLowerCase();
  });
  if (existing) {
    existing.date = dateInput.value; // same name: update the date
  } else {
    people.push({ id: Date.now(), name: name, date: dateInput.value });
  }

  savePeople();
  renderList();
  statusLine.textContent = name + " is on your list.";
});

renderList(); // show the saved people when the page opens
function wishText() {
  return (
    "Happy birthday, " + cardName.textContent + "! \uD83C\uDF82\n\n" +
    cardMsg.textContent +
    (cardFrom.textContent ? "\n\n" + cardFrom.textContent : "")
  );
}

document.getElementById("whatsapp").addEventListener("click", function () {
  window.open("https://wa.me/?text=" + encodeURIComponent(wishText()), "_blank");
});
function wrapLines(g, text, maxWidth) {
  const lines = [];
  let line = "";
  text.split(" ").forEach(function (word) {
    const test = line ? line + " " + word : word;
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line); // the line is full, so start a new one
      line = word;
    } else {
      line = test;      // the word still fits, so add it
    }
  });
  lines.push(line);
  return lines;
}
function drawCardImage() {
  const W = 1080;
  const H = 1350;
  const pic = document.createElement("canvas");
  pic.width = W;
  pic.height = H;
  const g = pic.getContext("2d");

  const css = getComputedStyle(card);
  const bg = css.getPropertyValue("--card-bg").trim();
  const fg = css.getPropertyValue("--card-fg").trim();
  const accent = css.getPropertyValue("--card-accent").trim();

  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Photo: a circle with a ring, and everything below moves down to make room
  const hasPhoto = !photoBox.hidden && photoImg.complete && photoImg.naturalWidth > 0;
  const top = hasPhoto ? 170 : 0;

  if (hasPhoto) {
    const r = 90;
    const cx = 90 + r + 10;
    const cy = 90 + r + 10;
    const iw = photoImg.naturalWidth;
    const ih = photoImg.naturalHeight;
    const side = Math.min(iw, ih);              // centre square crop
    const sx = (iw - side) / 2;
    const sy = (ih - side) / 2;

    g.save();
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.clip();                                   // only draw inside the circle
    g.drawImage(photoImg, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
    g.restore();

    g.strokeStyle = accent;                     // the gold ring
    g.lineWidth = 8;
    g.beginPath();
    g.arc(cx, cy, r + 10, 0, Math.PI * 2);
    g.stroke();
  }

  g.fillStyle = fg;
  const baseY = 190 + top;

  g.font = "56px 'Rozha One', Georgia, serif";
  g.fillText("Happy birthday,", 90, baseY);

  const name = cardName.textContent;
  let size = 150;
  while (size > 60) {
    g.font = size + "px 'Rozha One', Georgia, serif";
    if (g.measureText(name).width <= W - 180) break;
    size = size - 6;
  }
  const nameY = baseY + size + 20;
  g.fillText(name, 90, nameY);

  g.font = "40px 'Figtree', system-ui, sans-serif";
  const lines = wrapLines(g, cardMsg.textContent, W - 180);
  let y = nameY + 100;
  lines.forEach(function (line) {
    g.fillText(line, 90, y);
    y = y + 60;
  });

  if (cardFrom.textContent) {
    g.font = "italic 44px 'Figtree', system-ui, sans-serif";
    g.fillText(cardFrom.textContent, 90, H - 120);
  }

  return pic;
}
document.getElementById("image").addEventListener("click", async function () {
  // Wait until the fonts have loaded, so the picture uses them
  await document.fonts.load("56px 'Rozha One'");
  await document.fonts.load("40px 'Figtree'");

  const pic = drawCardImage();

  // Turn the canvas into a file and download it
  const a = document.createElement("a");
  a.href = pic.toDataURL("image/png");
  a.download = "birthday-card.png";
  a.click();

  statusLine.textContent = "Saved birthday-card.png in your Downloads folder.";
});const stickerSelect = document.getElementById("stickerPick");
const stickerArt = document.getElementById("stickerArt");

const stickers = {
  none: "",

  crown: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path class="a" d="M14 74 L10 36 L32 54 L50 26 L68 54 L90 36 L86 74 Z"/>
    <rect class="b" x="14" y="78" width="72" height="10" rx="3"/>
    <circle class="b" cx="10" cy="36" r="5"/>
    <circle class="b" cx="50" cy="26" r="5"/>
    <circle class="b" cx="90" cy="36" r="5"/>
  </svg>`,

  balloons: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path class="line" d="M32 55 Q36 80 50 94"/>
    <path class="line" d="M66 53 Q62 80 50 94"/>
    <path class="line" d="M50 70 L50 94"/>
    <ellipse class="a" cx="50" cy="48" rx="17" ry="21" opacity="0.7"/>
    <ellipse class="a" cx="32" cy="32" rx="18" ry="22"/>
    <path class="a" d="M32 54 l-3 5 h6 z"/>
    <ellipse class="b" cx="66" cy="30" rx="18" ry="22"/>
    <path class="b" d="M66 52 l-3 5 h6 z"/>
    <ellipse class="shine" cx="25" cy="24" rx="4" ry="7" transform="rotate(25 25 24)"/>
    <ellipse class="shine" cx="59" cy="22" rx="4" ry="7" transform="rotate(25 59 22)"/>
  </svg>`,

  gift: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <rect class="a" x="18" y="48" width="64" height="42" rx="2"/>
    <rect class="a" x="12" y="36" width="76" height="14" rx="2"/>
    <rect class="shade" x="12" y="49" width="76" height="2.5"/>
    <rect class="b" x="46" y="36" width="8" height="54"/>
    <ellipse class="b" cx="38" cy="28" rx="13" ry="8" transform="rotate(-20 38 28)"/>
    <ellipse class="b" cx="62" cy="28" rx="13" ry="8" transform="rotate(20 62 28)"/>
    <circle class="a" cx="50" cy="32" r="5"/>
  </svg>`,

  heart: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path class="a" d="M50 86 C14 60 10 34 28 24 C40 18 48 26 50 32 C52 26 60 18 72 24 C90 34 86 60 50 86 Z"/>
    <ellipse class="shine" cx="32" cy="34" rx="5" ry="9" transform="rotate(35 32 34)"/>
  </svg>`,

  sparkle: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path class="a" d="M50 18 C53 40 60 47 82 50 C60 53 53 60 50 82 C47 60 40 53 18 50 C40 47 47 40 50 18 Z"/>
    <path class="b" d="M80 6 C81.2 13 84 15.8 91 17 C84 18.2 81.2 21 80 28 C78.8 21 76 18.2 69 17 C76 15.8 78.8 13 80 6 Z"/>
    <path class="b" d="M22 70 C23 76 25.5 78.5 31.5 79.5 C25.5 80.5 23 83 22 89 C21 83 18.5 80.5 12.5 79.5 C18.5 78.5 21 76 22 70 Z"/>
  </svg>`,
};

function updateSticker() {
  stickerArt.innerHTML = stickers[stickerSelect.value] || "";
}

stickerSelect.addEventListener("change", updateSticker);
updateSticker(); // show the first sticker when the page opens
const photoInput = document.getElementById("photo");
const photoBox = document.getElementById("photoBox");
const photoImg = document.getElementById("photoImg");
const removePhotoBtn = document.getElementById("removePhoto");
let photoUrl = "";

photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    statusLine.textContent = "Please choose an image file (JPG or PNG).";
    photoInput.value = "";
    return;
  }

  if (photoUrl) URL.revokeObjectURL(photoUrl); // free the previous photo
  photoUrl = URL.createObjectURL(file);        // a temporary address for the file
  photoImg.src = photoUrl;
  photoBox.hidden = false;
  removePhotoBtn.hidden = false;
  statusLine.textContent = "Photo added.";
});

removePhotoBtn.addEventListener("click", function () {
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = "";
  photoImg.removeAttribute("src");
  photoBox.hidden = true;
  removePhotoBtn.hidden = true;
  photoInput.value = "";
  statusLine.textContent = "Photo removed.";
});