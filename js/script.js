// Slider Otomatis (bergeser setiap 8 detik)
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

// Ganti slide setiap 8 detik
if (slides.length) {
  setInterval(nextSlide, 8000);
}

// ======================
// HAMBURGER MENU (Responsive)
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger?.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Tutup menu saat klik link
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});

// ======================
// KALKULATOR PRAKTIKUM (Modal)
const modal = document.getElementById("kalkulatorModal");
const modalTitle = document.getElementById("modalTitle");
const kodeSpan = document.getElementById("kodePraktikum");
const closeBtn = document.querySelector(".close");
const hitungBtn = document.getElementById("hitungBtn");
const hasilSpan = document.getElementById("hasilKalkulasi");
const num1 = document.getElementById("num1");
const num2 = document.getElementById("num2");

let currentKode = "";

// Buka modal untuk setiap tombol kalkulator
document.querySelectorAll(".btn-kalkulator").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const kode = btn.getAttribute("data-kode");
    currentKode = kode;
    kodeSpan.textContent = kode;
    modalTitle.innerHTML = `Kalkulator Praktikum ${kode}`;
    // Reset input & hasil
    num1.value = "";
    num2.value = "";
    hasilSpan.textContent = "-";
    modal.style.display = "block";
  });
});

// Tutup modal
closeBtn?.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Fungsi hitung sederhana (contoh, bisa dikembangkan per kode praktikum nantinya)
hitungBtn?.addEventListener("click", () => {
  const a = parseFloat(num1.value);
  const b = parseFloat(num2.value);
  if (isNaN(a) || isNaN(b)) {
    hasilSpan.textContent = "Masukkan angka valid";
    return;
  }
  // Contoh: penjumlahan, tapi nanti bisa disesuaikan dengan rumus praktikum masing-masing (G1, M1, dll)
  let result = a + b;
  hasilSpan.textContent = result;
});

// ======================
// Smooth scroll untuk link navbar (sudah otomatis dengan CSS scroll-behavior)
// ======================

// Efek tambahan: navbar berubah warna saat scroll (opsional)
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.backgroundColor = "rgba(10, 25, 48, 0.95)";
  } else {
    navbar.style.backgroundColor = "var(--navy)";
  }
});
// Update dots saat slide berubah
function updateDots(index) {
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// Ubah fungsi showSlide yang sudah ada
function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
  updateDots(index); // tambahkan baris ini
}

// Event listener untuk klik dot (opsional)
document.querySelectorAll(".dot").forEach((dot, idx) => {
  dot.addEventListener("click", () => {
    currentSlide = idx;
    showSlide(currentSlide);
  });
});

// Periksa apakah gambar hero tersedia, jika tidak beri placeholder
// (Admin bisa mengganti foto di folder assets)
console.log("Website HIMAFI siap digunakan!");
