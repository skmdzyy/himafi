// ======================
// DATA REGRESI AIR (DARI MODUL)
// ======================
const dataRegresi = [
  { suhu: 0, viskositas: 1.8 },
  { suhu: 20, viskositas: 1.0 },
  { suhu: 40, viskositas: 0.8 },
  { suhu: 60, viskositas: 0.65 },
];

// Fungsi Regresi Linear (dengan Sy, Sm, Sn)
function regresiLinear(data) {
  const n = data.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  data.forEach((point) => {
    sumX += point.suhu;
    sumY += point.viskositas;
    sumXY += point.suhu * point.viskositas;
    sumX2 += point.suhu * point.suhu;
  });

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const n_intercept = (sumY - m * sumX) / n;

  // Hitung simpangan baku residual (Sy)
  let sumResid2 = 0;
  data.forEach((point) => {
    const yPred = m * point.suhu + n_intercept;
    sumResid2 += Math.pow(point.viskositas - yPred, 2);
  });
  const sy = Math.sqrt(sumResid2 / (n - 2));

  // Hitung simpangan baku slope (Sm)
  const sm = sy / Math.sqrt(sumX2 - (sumX * sumX) / n);

  // Hitung simpangan baku intercept (Sn)
  const sn = sy * Math.sqrt(1 / n + (sumX * sumX) / n / (sumX2 - (sumX * sumX) / n));

  return { m, n: n_intercept, sy, sm, sn };
}

function hitungRata(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

function parseInput(inputStr) {
  return inputStr
    .split(",")
    .map((x) => parseFloat(x.trim()))
    .filter((x) => !isNaN(x));
}

let airResult = { ta: 0, etaAir: 0, deltaEtaAir: 0 };

// ======================
// TAB AIR
// ======================
function hitungAir() {
  const waktuInput = document.getElementById("waktuAir").value;
  const suhu = parseFloat(document.getElementById("suhuAir").value);

  if (!waktuInput || isNaN(suhu)) {
    alert("Mohon isi semua data dengan benar!");
    return;
  }

  const waktuArr = parseInput(waktuInput);
  if (waktuArr.length !== 10) {
    alert("Harap masukkan 10 data waktu yang dipisahkan dengan koma!");
    return;
  }

  const ta = hitungRata(waktuArr);
  const reg = regresiLinear(dataRegresi);
  const etaAir = (reg.m * suhu + reg.n) * 1e-3;
  const deltaEtaAir = Math.abs(reg.sm * suhu + reg.sn) * 1e-3;

  airResult = { ta, etaAir, deltaEtaAir };

  const hasilDiv = document.getElementById("hasilAir");
  if (hasilDiv) {
    hasilDiv.innerHTML = `
            <p><strong> Data Input:</strong></p>
            <ul>
                <li>Rata-rata waktu air (t<sub>a</sub>) = ${ta.toFixed(4)} s</li>
                <li>Suhu ruang (T) = ${suhu} °C</li>
            </ul>
            <p><strong> Hasil Regresi Linear (η = m·T + n):</strong></p>
            <ul>
                <li>Slope (m) = ${reg.m.toFixed(6)} ×10⁻³ Pa·s/°C</li>
                <li>Intercept (n) = ${reg.n.toFixed(6)} ×10⁻³ Pa·s</li>
                <li> Sy (Simpangan Baku Residual)</strong> = ${reg.sy.toFixed(6)} ×10⁻³</li>
                <li> Sm (Simpangan Baku Slope)</strong> = ${reg.sm.toFixed(6)} ×10⁻³</li>
                <li> Sn (Simpangan Baku Intercept)</strong> = ${reg.sn.toFixed(6)} ×10⁻³</li>
            </ul>
            <p><strong> Persamaan Regresi:</strong></p>
            <p>η = (${reg.m.toFixed(6)} × T) + ${reg.n.toFixed(6)} &nbsp; (×10⁻³ Pa·s)</p>
            <p><strong> Viskositas Air pada Suhu ${suhu}°C:</strong></p>
            <p>η<sub>air</sub> = ${etaAir.toExponential(6)} Pa·s</p>
            <p>Δη<sub>air</sub> = ${deltaEtaAir.toExponential(6)} Pa·s</p>
            <hr>
            <small><strong>Keterangan:</strong><br>
            - Sy: Simpangan baku residual (ukuran sebaran data terhadap garis regresi)<br>
            - Sm: Simpangan baku slope (ketidakpastian nilai m)<br>
            - Sn: Simpangan baku intercept (ketidakpastian nilai n)
            </small>
        `;
    hasilDiv.style.display = "block";
  }
}

// ======================
// TAB ALKOHOL
// ======================
function hitungAlkohol() {
  const waktuInput = document.getElementById("waktuAlkohol").value;
  const rhoAlkohol = parseFloat(document.getElementById("rhoAlkohol").value);

  if (!waktuInput || isNaN(rhoAlkohol)) {
    alert("Mohon isi semua data dengan benar!");
    return;
  }

  const waktuArr = parseInput(waktuInput);
  if (waktuArr.length !== 10) {
    alert("Harap masukkan 10 data waktu yang dipisahkan dengan koma!");
    return;
  }

  const tb = hitungRata(waktuArr);
  const rhoAir = 1000;
  const ta = airResult.ta;
  const etaAir = airResult.etaAir;

  if (ta === 0) {
    alert("Silakan hitung viskositas air terlebih dahulu!");
    return;
  }

  const etaAlkohol = ((rhoAlkohol * tb) / (rhoAir * ta)) * etaAir;

  const hasilDiv = document.getElementById("hasilAlkohol");
  if (hasilDiv) {
    hasilDiv.innerHTML = `
            <p><strong>Data Input:</strong></p>
            <ul>
                <li>Rata-rata waktu alkohol (t<sub>b</sub>) = ${tb.toFixed(4)} s</li>
                <li>Massa jenis alkohol (ρ<sub>alkohol</sub>) = ${rhoAlkohol} kg/m³</li>
                <li>Rata-rata waktu air (t<sub>a</sub>) = ${ta.toFixed(4)} s</li>
                <li>Viskositas air (η<sub>air</sub>) = ${etaAir.toExponential(6)} Pa·s</li>
            </ul>
            <p><strong>Viskositas Alkohol:</strong></p>
            <p>η<sub>alkohol</sub> = ${etaAlkohol.toExponential(6)} Pa·s</p>
        `;
    hasilDiv.style.display = "block";
  }
}

// ======================
// TAB GLISERIN
// ======================
function hitungGliserin() {
  const m = parseFloat(document.getElementById("massaBola").value);
  const d = parseFloat(document.getElementById("diameterBola").value);
  const t = parseFloat(document.getElementById("waktuGliserin").value);
  const h = parseFloat(document.getElementById("jarakGliserin").value);
  const rhoGliserin = parseFloat(document.getElementById("rhoGliserin").value);
  const g = 9.8;

  if (isNaN(m) || isNaN(d) || isNaN(t) || isNaN(h) || isNaN(rhoGliserin)) {
    alert("Mohon isi semua data dengan benar!");
    return;
  }

  const pi = Math.PI;
  const term1 = (g * t) / (3 * h);
  const term2 = m / (pi * d) - (d * d * rhoGliserin) / 6;
  const etaGliserin = term1 * term2;

  const hasilDiv = document.getElementById("hasilGliserin");
  if (hasilDiv) {
    hasilDiv.innerHTML = `
            <p><strong>Data Input:</strong></p>
            <ul>
                <li>Rata-rata massa bola (m<sub>avg</sub>) = ${m.toExponential(6)} kg</li>
                <li>Rata-rata diameter bola (d<sub>avg</sub>) = ${d.toExponential(6)} m</li>
                <li>Rata-rata waktu (t<sub>avg</sub>) = ${t.toFixed(4)} s</li>
                <li>Jarak tempuh (h) = ${h.toFixed(4)} m</li>
                <li>Massa jenis gliserin (ρ<sub>gliserin</sub>) = ${rhoGliserin} kg/m³</li>
                <li>Gravitasi (g) = ${g} m/s²</li>
            </ul>
            <p><strong>Viskositas Gliserin (Hukum Stokes):</strong></p>
            <p>η<sub>gliserin</sub> = ${etaGliserin.toExponential(6)} Pa·s</p>
        `;
    hasilDiv.style.display = "block";
  }
}

// ======================
// PDF TABS & DOWNLOAD BUTTONS
// ======================
document.addEventListener("DOMContentLoaded", function () {
  // PDF Tabs
  const pdfTabs = document.querySelectorAll(".pdf-tab");
  const pdfViewer = document.getElementById("pdfViewer");

  if (pdfTabs.length && pdfViewer) {
    pdfTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        pdfTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const pdfType = tab.getAttribute("data-pdf");
        if (pdfType === "ostwald") {
          pdfViewer.src = "assets/pdf/modul_ostwald.pdf";
        } else {
          pdfViewer.src = "assets/pdf/modul_stokes.pdf";
        }
      });
    });
  }

  // Download buttons
  const downloadOstwald = document.getElementById("downloadOstwald");
  const downloadStokes = document.getElementById("downloadStokes");

  if (downloadOstwald) {
    downloadOstwald.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = "assets/pdf/modul_ostwald.pdf";
      link.download = "Modul_Viskosimeter_Ostwald.pdf";
      link.click();
    });
  }

  if (downloadStokes) {
    downloadStokes.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = "assets/pdf/modul_stokes.pdf";
      link.download = "Modul_Hukum_Stokes.pdf";
      link.click();
    });
  }

  // Kalkulator Tabs
  const kalkulatorTabs = document.querySelectorAll(".kalkulator-tab");
  const tabContents = document.querySelectorAll(".kalkulator-tab-content");

  if (kalkulatorTabs.length) {
    kalkulatorTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        kalkulatorTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const tabId = tab.getAttribute("data-tab");
        tabContents.forEach((content) => {
          content.classList.remove("active");
          if (content.id === `tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`) {
            content.classList.add("active");
          }
        });
      });
    });
  }

  console.log("F2.js loaded - All features ready");
});
