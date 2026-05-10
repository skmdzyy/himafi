// ======================
// SLIDER HERO
// ======================
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

if (slides.length) {
  setInterval(nextSlide, 8000);
}

// ======================
// HAMBURGER MENU
// ======================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});

// ======================
// NAVBAR SCROLL EFFECT
// ======================
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.backgroundColor = "rgba(10, 25, 48, 0.95)";
  } else {
    navbar.style.backgroundColor = "#0a1930";
  }
});

// ======================
// FUNGSI PEMBUKA MODAL F2 (GLOBAL)
// ======================
window.openModalF2 = function () {
  const modalF2 = document.getElementById("modalF2");
  if (modalF2) {
    modalF2.style.display = "block";
    document.body.style.overflow = "hidden";
  } else {
    alert("Modal F2 tidak ditemukan. Periksa HTML.");
  }
};

// ======================
// MODAL F2 - TUTUP
// ======================
const closeModalF2 = document.querySelector(".modal-f2-close");
if (closeModalF2) {
  closeModalF2.addEventListener("click", function () {
    const modalF2 = document.getElementById("modalF2");
    if (modalF2) {
      modalF2.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
}

// Klik di luar modal untuk menutup
window.addEventListener("click", function (e) {
  const modalF2 = document.getElementById("modalF2");
  if (e.target === modalF2) {
    modalF2.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// ======================
// MODAL SEDERHANA (G1, M1, dll)
// ======================
const modalSederhana = document.getElementById("kalkulatorModal");
const closeBtn = document.querySelector(".close");

document.querySelectorAll(".btn-kalkulator").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const kode = btn.getAttribute("data-kode");

    // KHUSUS F2 - BUKA MODAL BESAR
    if (kode === "F2") {
      if (typeof window.openModalF2 === "function") {
        window.openModalF2();
      } else {
        alert("Error: Fungsi pembuka modal F2 tidak ditemukan");
      }
      return;
    }

    // PRAKTIKUM LAIN - MODAL SEDERHANA
    if (modalSederhana) {
      document.getElementById("kodePraktikum").textContent = kode;
      document.getElementById("modalTitle").innerHTML = `Kalkulator Praktikum ${kode}`;
      modalSederhana.style.display = "block";
    }
  });
});

// Tutup modal sederhana
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    if (modalSederhana) modalSederhana.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modalSederhana) {
    modalSederhana.style.display = "none";
  }
});

// ======================
// HITUNG SEDERHANA UNTUK PRAKTIKUM LAIN
// ======================
const hitungBtn = document.getElementById("hitungBtn");
const hasilSpan = document.getElementById("hasilKalkulasi");
const num1 = document.getElementById("num1");
const num2 = document.getElementById("num2");

if (hitungBtn) {
  hitungBtn.addEventListener("click", () => {
    const a = parseFloat(num1.value);
    const b = parseFloat(num2.value);
    if (isNaN(a) || isNaN(b)) {
      hasilSpan.textContent = "Masukkan angka valid";
      return;
    }
    hasilSpan.textContent = a + b;
  });
}
