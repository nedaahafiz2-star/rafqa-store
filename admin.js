// ============================================================
// admin.js — لوحة تحكم Rafqa (إضافة + حذف الألعاب)
// الدخول بكلمة مرور محلية — مستقل تماماً عن Firebase Auth
// ============================================================

const IMGBB_API_KEY  = "10cc28c81f07178b3b5aa1376ac14e4a";
const ADMIN_PASSWORD = "Rafqa@2025"; // ← غيّريها لكلمة مرور تختارينها

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(initAdminAuth, 500);
});

function initAdminAuth() {
  const loginScreen = document.getElementById("adminLoginScreen");
  const adminPanel  = document.getElementById("adminPanel");
  const loginBtn    = document.getElementById("adminLoginBtn");
  const logoutBtn   = document.getElementById("adminLogoutBtn");
  const passInput   = document.getElementById("adminPassword");
  const errorDiv    = document.getElementById("adminLoginError");

  // تحقق من جلسة محلية
  if (sessionStorage.getItem("rafqa_admin") === "true") {
    loginScreen.style.display = "none";
    adminPanel.style.display  = "block";
    initAdmin();
    return;
  }

  loginScreen.style.display = "flex";
  adminPanel.style.display  = "none";

  // زر الدخول
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const pass = passInput.value;

      if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem("rafqa_admin", "true");
        loginScreen.style.display = "none";
        adminPanel.style.display  = "block";
        errorDiv.style.display    = "none";
        initAdmin();
      } else {
        errorDiv.textContent      = "كلمة المرور غلط، حاولي مرة أخرى.";
        errorDiv.style.display    = "block";
        passInput.value           = "";
        passInput.focus();
      }
    });

    // دخول بـ Enter
    passInput && passInput.addEventListener("keydown", e => {
      if (e.key === "Enter") loginBtn.click();
    });
  }

  // زر الخروج
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("rafqa_admin");
      adminPanel.style.display  = "none";
      loginScreen.style.display = "flex";
      passInput && (passInput.value = "");
    });
  }
}

// ============================================================
// لوحة التحكم الرئيسية
// ============================================================
function initAdmin() {
  const currentRtdb = window.rtdb || (typeof rtdb !== "undefined" ? rtdb : null);

  if (!currentRtdb) {
    console.error("❌ rtdb غير متاح. تأكدي من تحميل firebase-config.js أولاً.");
    return;
  }

  const addGameForm       = document.getElementById("addGameForm");
  const gameNameInput     = document.getElementById("gameName");
  const gameCategoryInput = document.getElementById("gameCategory");
  const gamePriceInput    = document.getElementById("gamePrice");
  const gameDescInput     = document.getElementById("gameDescription");
  const gameImageInput    = document.getElementById("gameImage");
  const adminGamesList    = document.getElementById("adminGamesList");

  // --------------------------------------------------------
  // 1. جلب وعرض الألعاب الحالية مع زر الحذف
  // --------------------------------------------------------
  function loadAdminGames() {
    currentRtdb.ref("games").on("value", (snapshot) => {
      if (!adminGamesList) return;
      adminGamesList.innerHTML = "";

      if (!snapshot.exists()) {
        adminGamesList.innerHTML = `<p style="color:#6b7280;font-size:0.9rem;">لا توجد ألعاب بعد.</p>`;
        return;
      }

      snapshot.forEach((child) => {
        const game = child.val();
        const id   = child.key;

        const item = document.createElement("div");
        item.className = "games-list-item";
        item.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${game.image || ''}" alt="${game.name}"
              style="width:48px;height:48px;object-fit:cover;border-radius:8px;background:#e5e7eb;"
              onerror="this.src='https://via.placeholder.com/48x48?text=🎮'">
            <div>
              <div style="font-weight:600;">${game.name}</div>
              <div style="font-size:0.8rem;color:#6b7280;">${game.price} ر.س</div>
            </div>
          </div>
          <button class="danger-btn" data-id="${id}">حذف</button>
        `;

        item.querySelector(".danger-btn").addEventListener("click", () => {
          if (confirm(`هل أنتِ متأكدة من حذف "${game.name}"؟`)) {
            currentRtdb.ref("games/" + id).remove()
              .then(() => alert("✅ تم حذف اللعبة بنجاح."))
              .catch((err) => alert("❌ خطأ أثناء الحذف: " + err.message));
          }
        });

        adminGamesList.appendChild(item);
      });
    });
  }

  // --------------------------------------------------------
  // 2. رفع الصورة على ImgBB
  // --------------------------------------------------------
  async function uploadImageToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error("فشل رفع الصورة: " + (data.error?.message || "خطأ غير معروف"));
    }
    return data.data.url;
  }

  // --------------------------------------------------------
  // 3. إضافة لعبة جديدة
  // --------------------------------------------------------
  if (addGameForm) {
    addGameForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name        = gameNameInput.value.trim();
      const category    = gameCategoryInput.value;
      const price       = parseFloat(gamePriceInput.value);
      const description = gameDescInput.value.trim();
      const imageFile   = gameImageInput.files[0];

      if (!name || !price || !imageFile) {
        alert("الرجاء تعبئة جميع الحقول واختيار صورة.");
        return;
      }

      const submitBtn = addGameForm.querySelector("button[type=submit]");
      submitBtn.disabled    = true;
      submitBtn.textContent = "⏳ جارٍ رفع الصورة...";

      try {
        const imageUrl = await uploadImageToImgBB(imageFile);
        submitBtn.textContent = "⏳ جارٍ الحفظ...";

        await currentRtdb.ref("games").push({
          name, category, price, description,
          image: imageUrl,
          createdAt: Date.now()
        });

        alert("🎉 تم إضافة اللعبة بنجاح!");
        addGameForm.reset();

      } catch (err) {
        alert("❌ حدث خطأ: " + err.message);
      } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = "حفظ اللعبة";
      }
    });
  }

  loadAdminGames();
}