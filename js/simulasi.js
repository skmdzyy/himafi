/**
 * HIMAFI UNAIR - Engine Simulasi Fisika Interaktif (Physically Accurate & Bug-Free)
 * 
 * 1. Radiasi Benda Hitam (Planck's Spectral Radiance Law & Wien's Displacement Law)
 * 2. Sistem Pegas (Damped Simple Harmonic Oscillator & Energy Conservation)
 * 3. Momen Inersia (Rolling Without Slipping with Visual Wheel Rotation & Exact Kinematics)
 * 4. Mekanika Lagrangian & Hamiltonian (RK4 Solver Double Pendulum & Phase Space)
 * 5. Elektromagnetik (Boris Pusher Cyclotron Motion & Lorentz Force F = q(E + v x B))
 * 6. Mekanika Klasik (Dual Trajectory Projectile Motion: Ideal vs Air Drag + Vector Decomposition)
 */

window.SimulasiFisika = (function () {
  let activeTab = 'blackbody';
  let animationFrames = {};

  // ==========================================
  // STATE 1: BLACKBODY RADIATION
  // ==========================================
  let bbTemp = 5500; // Kelvin
  let bbScaleMode = 'normalized'; // 'normalized' atau 'absolute'

  // ==========================================
  // STATE 2: SPRING OSCILLATOR
  // ==========================================
  let pegasMass = 2.0; // kg
  let pegasK = 50; // N/m
  let pegasDamp = 0.05; // c (N s/m)
  let pegasX = 0.8; // Posisi (meter)
  let pegasV = 0.0; // Kecepatan (m/s)
  let pegasTime = 0;
  let pegasHistory = []; // Array {t, x, v, Ek, Ep, Etotal}

  // ==========================================
  // STATE 3: MOMEN INERSIA (ROLLING RACE)
  // ==========================================
  let miAngle = 30; // Derajat
  let miRunning = false;
  let miTime = 0;
  let miWinners = [];
  const miShapes = [
    { id: 'sphere', name: 'Bola Pejal', beta: 0.40, color: '#ef4444', s: 0, v: 0, angle: 0, rank: 0 },
    { id: 'disk', name: 'Silinder Pejal / Cakram', beta: 0.50, color: '#3b82f6', s: 0, v: 0, angle: 0, rank: 0 },
    { id: 'hollow_sphere', name: 'Bola Rongga', beta: 0.67, color: '#f59e0b', s: 0, v: 0, angle: 0, rank: 0 },
    { id: 'ring', name: 'Cincin / Hoop', beta: 1.00, color: '#a855f7', s: 0, v: 0, angle: 0, rank: 0 }
  ];

  // ==========================================
  // STATE 4: LAGRANGIAN & HAMILTONIAN
  // ==========================================
  let lhMode = 'simple'; // 'simple' atau 'double'
  let lhState = {
    th1: Math.PI / 3,
    th2: Math.PI / 4,
    w1: 0,
    w2: 0
  };
  let lhTrail = [];
  let lhPhaseHistory = [];

  // ==========================================
  // STATE 5: ELECTROMAGNETISM (LORENTZ FORCE)
  // ==========================================
  let emCharge = 1; // +1 Coulomb
  let emMass = 1; // 1 kg
  let emEx = 0;
  let emEy = 10; // N/C
  let emBz = 2.0; // Tesla
  let emState = { x: 0, y: 0, vx: 30, vy: 0 };
  let emTrail = [];

  // ==========================================
  // STATE 6: MEKANIKA KLASIK (PROJECTILE)
  // ==========================================
  let projV0 = 50; // m/s
  let projAngle = 45; // deg
  let projDrag = 0.02; // drag coefficient b/m
  let projRunning = false;
  let projTime = 0;
  let projRealState = { x: 0, y: 0, vx: 0, vy: 0 };
  let projRealTrail = [];
  let projIdealTrail = [];

  // ==========================================
  // INITIALIZATION & TAB CONTROLS
  // ==========================================
  function init() {
    setupTabSwitching();
    setupControls();
    switchTab('blackbody');
  }

  function setupTabSwitching() {
    const tabs = document.querySelectorAll('.sim-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const simId = tab.getAttribute('data-sim');
        switchTab(simId);
      });
    });
  }

  function switchTab(simId) {
    activeTab = simId;

    document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sim-panel').forEach(p => p.classList.remove('active'));

    const selectedTab = document.querySelector(`.sim-tab[data-sim="${simId}"]`);
    const selectedPanel = document.getElementById(`sim-${simId}`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedPanel) selectedPanel.classList.add('active');

    // Clear frames
    Object.keys(animationFrames).forEach(key => {
      if (animationFrames[key]) cancelAnimationFrame(animationFrames[key]);
    });

    if (simId === 'blackbody') drawBlackbody();
    else if (simId === 'pegas') loopPegas();
    else if (simId === 'inersia') drawInersia();
    else if (simId === 'lagrange') loopLagrange();
    else if (simId === 'em') loopEM();
    else if (simId === 'mechanics') drawMechanics();
  }

  function setupControls() {
    // 1. Blackbody
    const bbTempSlider = document.getElementById('bbTemp');
    const bbScaleSelect = document.getElementById('bbScaleMode');
    if (bbTempSlider) {
      bbTempSlider.addEventListener('input', (e) => {
        bbTemp = parseFloat(e.target.value);
        document.getElementById('bbTempVal').textContent = bbTemp + ' K';
        drawBlackbody();
      });
    }
    if (bbScaleSelect) {
      bbScaleSelect.addEventListener('change', (e) => {
        bbScaleMode = e.target.value;
        drawBlackbody();
      });
    }

    // 2. Pegas
    const pMass = document.getElementById('pegasMass');
    const pK = document.getElementById('pegasK');
    const pDamp = document.getElementById('pegasDamp');
    const pReset = document.getElementById('pegasReset');

    if (pMass) pMass.addEventListener('input', (e) => { pegasMass = parseFloat(e.target.value); document.getElementById('pegasMassVal').textContent = pegasMass + ' kg'; });
    if (pK) pK.addEventListener('input', (e) => { pegasK = parseFloat(e.target.value); document.getElementById('pegasKVal').textContent = pegasK + ' N/m'; });
    if (pDamp) pDamp.addEventListener('input', (e) => { pegasDamp = parseFloat(e.target.value); document.getElementById('pegasDampVal').textContent = pegasDamp; });
    if (pReset) pReset.addEventListener('click', resetPegas);

    // 3. Momen Inersia
    const miAngleSlider = document.getElementById('miAngle');
    const miStartBtn = document.getElementById('miStart');
    const miResetBtn = document.getElementById('miReset');

    if (miAngleSlider) miAngleSlider.addEventListener('input', (e) => { miAngle = parseFloat(e.target.value); document.getElementById('miAngleVal').textContent = miAngle + '°'; drawInersia(); });
    if (miStartBtn) miStartBtn.addEventListener('click', startInersia);
    if (miResetBtn) miResetBtn.addEventListener('click', resetInersia);

    // 4. Lagrange
    const lhModeSelect = document.getElementById('lhMode');
    const lhResetBtn = document.getElementById('lhReset');

    if (lhModeSelect) {
      lhModeSelect.addEventListener('change', (e) => {
        lhMode = e.target.value;
        resetLagrange();
      });
    }
    if (lhResetBtn) lhResetBtn.addEventListener('click', resetLagrange);

    // 5. EM
    const emChargeSel = document.getElementById('emCharge');
    const emEySlider = document.getElementById('emEy');
    const emBzSlider = document.getElementById('emBz');
    const emResetBtn = document.getElementById('emReset');

    if (emChargeSel) emChargeSel.addEventListener('change', (e) => { emCharge = parseFloat(e.target.value); resetEM(); });
    if (emEySlider) emEySlider.addEventListener('input', (e) => { emEy = parseFloat(e.target.value); document.getElementById('emEyVal').textContent = emEy + ' N/C'; });
    if (emBzSlider) emBzSlider.addEventListener('input', (e) => { emBz = parseFloat(e.target.value); document.getElementById('emBzVal').textContent = emBz + ' T'; });
    if (emResetBtn) emResetBtn.addEventListener('click', resetEM);

    // 6. Mechanics
    const projV0Slider = document.getElementById('projV0');
    const projAngleSlider = document.getElementById('projAngle');
    const projDragSlider = document.getElementById('projDrag');
    const projStartBtn = document.getElementById('projStart');
    const projResetBtn = document.getElementById('projReset');

    if (projV0Slider) projV0Slider.addEventListener('input', (e) => { projV0 = parseFloat(e.target.value); document.getElementById('projV0Val').textContent = projV0 + ' m/s'; drawMechanics(); });
    if (projAngleSlider) projAngleSlider.addEventListener('input', (e) => { projAngle = parseFloat(e.target.value); document.getElementById('projAngleVal').textContent = projAngle + '°'; drawMechanics(); });
    if (projDragSlider) projDragSlider.addEventListener('input', (e) => { projDrag = parseFloat(e.target.value); document.getElementById('projDragVal').textContent = projDrag; drawMechanics(); });
    if (projStartBtn) projStartBtn.addEventListener('click', startProjectile);
    if (projResetBtn) projResetBtn.addEventListener('click', resetProjectile);
  }

  // ==========================================
  // 1. SIMULASI RADIASI BENDA HITAM
  // ==========================================
  function drawBlackbody() {
    const canvas = document.getElementById('canvas-blackbody');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 360;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Wien's Displacement Law: lambda_max * T = 2.8977719e-3 m*K
    const bWien = 2.8977719e-3;
    const lambdaMaxM = bWien / bbTemp;
    const lambdaMaxNm = (lambdaMaxM * 1e9).toFixed(1);

    const badge = document.getElementById('wienPeakDisplay');
    if (badge) {
      badge.textContent = `Puncak Spektrum (λ_max): ${lambdaMaxNm} nm (${getSpectrumRegion(lambdaMaxNm)})`;
    }

    // Spectrum Color Bar
    const marginL = 75;
    const marginR = 30;
    const specY = height - 45;
    const graphW = width - marginL - marginR;

    for (let x = marginL; x < width - marginR; x++) {
      const nm = mapRange(x, marginL, width - marginR, 100, 2000);
      ctx.fillStyle = wavelengthToRGB(nm);
      ctx.fillRect(x, specY + 5, 1, 12);
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginL, 25);
    ctx.lineTo(marginL, specY);
    ctx.lineTo(width - marginR, specY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Radiansi Spektral B_λ (kW/m²/nm/sr)', 10, 20);
    ctx.fillText('Panjang Gelombang λ (nm)', width / 2 - 60, height - 10);

    // Wavelength Ticks
    [200, 400, 750, 1000, 1500, 2000].forEach(nmVal => {
      const tx = mapRange(nmVal, 100, 2000, marginL, width - marginR);
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(tx, specY);
      ctx.lineTo(tx, specY + 4);
      ctx.stroke();
      ctx.fillText(`${nmVal}`, tx - 10, specY + 18);
    });

    // Planck's Law Formula calculation:
    // B_lambda(lambda, T) = (2 h c^2 / lambda^5) / (exp(h c / (lambda k T)) - 1)
    const h = 6.62607015e-34;
    const c = 2.99792458e8;
    const kB = 1.380649e-23;

    // Peak Intensity calculation for scaling
    const c1 = 2 * h * c * c;
    const c2 = (h * c) / (kB * bbTemp);
    const expMax = Math.exp(c2 / lambdaMaxM);
    const B_max = c1 / (Math.pow(lambdaMaxM, 5) * (expMax - 1));

    // Dynamic color glow based on temperature
    const glowColor = tempToColor(bbTemp);

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;
    ctx.beginPath();

    let peakPx = marginL;
    let peakPy = specY;

    for (let px = marginL; px <= width - marginR; px++) {
      const lambda = mapRange(px, marginL, width - marginR, 100, 2000) * 1e-9;
      const xExp = c2 / lambda;
      let B = 0;
      if (xExp < 700) {
        B = c1 / (Math.pow(lambda, 5) * (Math.exp(xExp) - 1));
      }

      // Height normalization based on mode
      let yNormalized = 0;
      if (bbScaleMode === 'absolute') {
        // Absolute scale relative to T=10000K max
        const B_ref_10k = 1.2e14;
        yNormalized = (B / B_ref_10k) * (specY - 40);
      } else {
        // Normalized scale so peak fits nicely on screen
        yNormalized = (B / B_max) * (specY - 60);
      }

      const py = Math.max(30, specY - yNormalized);
      if (px === marginL) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);

      if (specY - py > specY - peakPy) {
        peakPx = px;
        peakPy = py;
      }
    }
    ctx.stroke();

    // Draw Wien's Peak Dot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(peakPx, peakPy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`λ_max = ${lambdaMaxNm} nm`, peakPx - 30, peakPy - 10);
  }

  // ==========================================
  // 2. SIMULASI PEGAS (DAMPED HARMONIC OSCILLATOR)
  // ==========================================
  function resetPegas() {
    pegasX = 0.8; // 0.8 meter displacement
    pegasV = 0.0;
    pegasTime = 0;
    pegasHistory = [];
  }

  function loopPegas() {
    if (activeTab !== 'pegas') return;

    const canvas = document.getElementById('canvas-pegas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 360;

    // Velocity-Verlet / Euler-Cromer Physics Step
    const dt = 0.02;
    // Equation of motion: m * d2x/dt2 + c * dx/dt + k * x = 0
    const accel = (-pegasK * pegasX - pegasDamp * pegasV) / pegasMass;
    pegasV += accel * dt;
    pegasX += pegasV * dt;
    pegasTime += dt;

    // Exact Mechanical Energies
    const Ep = 0.5 * pegasK * pegasX * pegasX; // Joules
    const Ek = 0.5 * pegasMass * pegasV * pegasV; // Joules
    const Etotal = Ep + Ek;

    pegasHistory.push({ t: pegasTime, x: pegasX, v: pegasV, Ep, Ek, Etotal });
    if (pegasHistory.length > 250) pegasHistory.shift();

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Render Physical Spring & Mass
    const anchorX = 120;
    const anchorY = 40;
    // Scale: 1 meter = 100 pixels
    const maxPx = anchorY + 160 + pegasX * 90;
    const coils = 12;
    const springRadius = 20;

    // Wall Support
    ctx.fillStyle = '#334155';
    ctx.fillRect(anchorX - 50, 25, 100, 15);

    // Coiled Spring Wire
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    for (let i = 0; i <= coils; i++) {
      const cy = anchorY + (i / coils) * (maxPx - anchorY);
      const cx = anchorX + (i % 2 === 0 ? springRadius : -springRadius);
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(anchorX, maxPx);
    ctx.stroke();

    // Hanging Mass Block
    const blockW = 60;
    const blockH = 50;
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(anchorX - blockW / 2, maxPx, blockW, blockH);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    ctx.strokeRect(anchorX - blockW / 2, maxPx, blockW, blockH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`${pegasMass} kg`, anchorX - 16, maxPx + 30);

    // Energy Bar Gauges
    const gaugeX = 230;
    const gaugeW = 160;
    const maxEnergyDisplay = 40; // Joules scale

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Konservasi Energi (Joules)', gaugeX, 35);

    // Ek Bar
    const ekW = Math.min(gaugeW, (Ek / maxEnergyDisplay) * gaugeW);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(gaugeX, 50, ekW, 14);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Ek: ${Ek.toFixed(2)} J`, gaugeX + gaugeW + 10, 62);

    // Ep Bar
    const epW = Math.min(gaugeW, (Ep / maxEnergyDisplay) * gaugeW);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(gaugeX, 80, epW, 14);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Ep: ${Ep.toFixed(2)} J`, gaugeX + gaugeW + 10, 92);

    // Etotal Bar
    const etW = Math.min(gaugeW, (Etotal / maxEnergyDisplay) * gaugeW);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(gaugeX, 110, etW, 14);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`E_total: ${Etotal.toFixed(2)} J`, gaugeX + gaugeW + 10, 122);

    // Real-Time Position vs Time Graph (Synced 100%)
    const graphX = 230;
    const graphY = 150;
    const graphW_Real = width - graphX - 25;
    const graphH_Real = 170;

    ctx.strokeStyle = '#334155';
    ctx.strokeRect(graphX, graphY, graphW_Real, graphH_Real);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Grafik Real-Time Posisi x(t)', graphX + 10, graphY + 18);

    // Zero Line
    const zeroY = graphY + graphH_Real / 2;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(graphX, zeroY);
    ctx.lineTo(graphX + graphW_Real, zeroY);
    ctx.stroke();

    // Plot exact history
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    pegasHistory.forEach((pt, i) => {
      const px = graphX + (i / 250) * graphW_Real;
      const py = zeroY - pt.x * 50;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    animationFrames['pegas'] = requestAnimationFrame(loopPegas);
  }

  // ==========================================
  // 3. SIMULASI MOMEN INERSIA (BALAP ROLLING)
  // ==========================================
  function resetInersia() {
    miRunning = false;
    miTime = 0;
    miWinners = [];
    miShapes.forEach(s => {
      s.s = 0;
      s.v = 0;
      s.angle = 0;
      s.rank = 0;
    });
    drawInersia();
  }

  function startInersia() {
    resetInersia();
    miRunning = true;
    loopInersia();
  }

  function drawInersia() {
    const canvas = document.getElementById('canvas-inersia');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 360;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Incline slope math
    const rad = (miAngle * Math.PI) / 180;
    const startX = 60;
    const startY = 60;
    const inclineLengthPx = width - 220;
    const endX = startX + inclineLengthPx * Math.cos(rad);
    const endY = startY + inclineLengthPx * Math.sin(rad);

    // Draw Incline Triangle
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(startX, endY);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.stroke();

    // R = 14 px radius of shapes
    const R = 14;
    const g = 9.8;

    miShapes.forEach((shape, idx) => {
      // Acceleration a = (g * sin(theta)) / (1 + beta)
      const accel = (g * Math.sin(rad)) / (1 + shape.beta);

      if (miRunning) {
        shape.v = accel * miTime;
        shape.s = 0.5 * accel * miTime * miTime * 40; // Scale factor for visual slope
        shape.angle = shape.s / R; // Rolling without slipping angle theta = s / R

        // Check Finish Line
        if (shape.s >= inclineLengthPx && shape.rank === 0) {
          miWinners.push(shape.name);
          shape.rank = miWinners.length;
          shape.s = inclineLengthPx;
        }
      }

      const currentDist = Math.min(inclineLengthPx, shape.s);
      const cx = startX + currentDist * Math.cos(rad) - Math.sin(rad) * (R + idx * 2);
      const cy = startY + currentDist * Math.sin(rad) - Math.cos(rad) * (R + idx * 2);

      // Draw Rotating Shape with Spokes
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(shape.angle);

      ctx.fillStyle = shape.color;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();

      // Draw Cross Spokes to visually prove rotation!
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-R + 2, 0); ctx.lineTo(R - 2, 0);
      ctx.moveTo(0, -R + 2); ctx.lineTo(0, R - 2);
      ctx.stroke();

      ctx.restore();

      // Shape Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(shape.name.split(' ')[0], cx - 15, cy - R - 6);

      if (shape.rank > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`Juara ${shape.rank}!`, cx + R + 4, cy);
      }
    });

    // Leaderboard Display
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`Sudut (θ): ${miAngle}° | Waktu: ${miTime.toFixed(2)} s`, width - 190, 30);

    miShapes.forEach((shape, i) => {
      ctx.fillStyle = shape.color;
      ctx.fillRect(width - 200, 50 + i * 24, 12, 12);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`${shape.name} (c=${shape.beta})`, width - 180, 61 + i * 24);
    });
  }

  function loopInersia() {
    if (activeTab !== 'inersia' || !miRunning) return;

    miTime += 0.02;
    drawInersia();

    if (miShapes.every(s => s.rank > 0)) {
      miRunning = false;
    } else {
      animationFrames['inersia'] = requestAnimationFrame(loopInersia);
    }
  }

  // ==========================================
  // 4. LAGRANGIAN & HAMILTONIAN MECHANICS (RK4)
  // ==========================================
  function resetLagrange() {
    lhState = { th1: Math.PI / 3, th2: Math.PI / 4, w1: 0, w2: 0 };
    lhTrail = [];
    lhPhaseHistory = [];
    drawLagrange();
  }

  function getDoublePendulumDerivatives(th1, th2, w1, w2) {
    const g = 9.8, l1 = 1.0, l2 = 1.0, m1 = 2.0, m2 = 1.5;
    const delta = th1 - th2;

    const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
    const num1 = -g * (2 * m1 + m2) * Math.sin(th1) - m2 * g * Math.sin(th1 - 2 * th2) - 2 * Math.sin(delta) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(delta));
    const alpha1 = num1 / den1;

    const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
    const num2 = 2 * Math.sin(delta) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(th1) + w2 * w2 * l2 * m2 * Math.cos(delta));
    const alpha2 = num2 / den2;

    return { dth1: w1, dth2: w2, dw1: alpha1, dw2: alpha2 };
  }

  function rk4Step(dt) {
    const g = 9.8, l1 = 1.0, m1 = 2.0;

    if (lhMode === 'simple') {
      const alpha = (-g / l1) * Math.sin(lhState.th1);
      lhState.w1 += alpha * dt;
      lhState.th1 += lhState.w1 * dt;
    } else {
      // High-precision RK4 integration for Double Pendulum
      const k1 = getDoublePendulumDerivatives(lhState.th1, lhState.th2, lhState.w1, lhState.w2);
      const k2 = getDoublePendulumDerivatives(
        lhState.th1 + 0.5 * dt * k1.dth1, lhState.th2 + 0.5 * dt * k1.dth2,
        lhState.w1 + 0.5 * dt * k1.dw1, lhState.w2 + 0.5 * dt * k1.dw2
      );
      const k3 = getDoublePendulumDerivatives(
        lhState.th1 + 0.5 * dt * k2.dth1, lhState.th2 + 0.5 * dt * k2.dth2,
        lhState.w1 + 0.5 * dt * k2.dw1, lhState.w2 + 0.5 * dt * k2.dw2
      );
      const k4 = getDoublePendulumDerivatives(
        lhState.th1 + dt * k3.dth1, lhState.th2 + dt * k3.dth2,
        lhState.w1 + dt * k3.dw1, lhState.w2 + dt * k3.dw2
      );

      lhState.th1 += (dt / 6) * (k1.dth1 + 2 * k2.dth1 + 2 * k3.dth1 + k4.dth1);
      lhState.th2 += (dt / 6) * (k1.dth2 + 2 * k2.dth2 + 2 * k3.dth2 + k4.dth2);
      lhState.w1 += (dt / 6) * (k1.dw1 + 2 * k2.dw1 + 2 * k3.dw1 + k4.dw1);
      lhState.w2 += (dt / 6) * (k1.dw2 + 2 * k2.dw2 + 2 * k3.dw2 + k4.dw2);
    }
  }

  function drawLagrange() {
    const canvas = document.getElementById('canvas-lagrange');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 360;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    const pivotX = 170;
    const pivotY = 90;
    const l1Px = 100;
    const l2Px = 80;

    const x1 = pivotX + l1Px * Math.sin(lhState.th1);
    const y1 = pivotY + l1Px * Math.cos(lhState.th1);

    let x2 = x1, y2 = y1;
    if (lhMode === 'double') {
      x2 = x1 + l2Px * Math.sin(lhState.th2);
      y2 = y1 + l2Px * Math.cos(lhState.th2);
    }

    lhTrail.push({ x: x2, y: y2 });
    if (lhTrail.length > 100) lhTrail.shift();

    // Phase Space: p_theta vs theta
    const p_theta = 2.0 * 1.0 * lhState.w1; // p = m * L^2 * omega
    lhPhaseHistory.push({ q: lhState.th1, p: p_theta });
    if (lhPhaseHistory.length > 200) lhPhaseHistory.shift();

    // Draw Chaotic Trail
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    lhTrail.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Pendulum Arm
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(x1, y1);
    if (lhMode === 'double') ctx.lineTo(x2, y2);
    ctx.stroke();

    // Bobs
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(x1, y1, 10, 0, Math.PI * 2); ctx.fill();

    if (lhMode === 'double') {
      ctx.fillStyle = '#a855f7';
      ctx.beginPath(); ctx.arc(x2, y2, 8, 0, Math.PI * 2); ctx.fill();
    }

    // Phase Space Graph Plot
    const psX = 360;
    const psY = 40;
    const psW = width - psX - 30;
    const psH = 260;

    ctx.strokeStyle = '#334155';
    ctx.strokeRect(psX, psY, psW, psH);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Ruang Fase (Phase Space: p_θ vs θ)', psX + 10, psY + 20);

    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(psX + psW / 2, psY + 30); ctx.lineTo(psX + psW / 2, psY + psH - 10);
    ctx.moveTo(psX + 10, psY + psH / 2); ctx.lineTo(psX + psW - 10, psY + psH / 2);
    ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    lhPhaseHistory.forEach((pt, idx) => {
      const qPx = psX + psW / 2 + pt.q * 30;
      const pPy = psY + psH / 2 - pt.p * 30;
      if (idx === 0) ctx.moveTo(qPx, pPy);
      else ctx.lineTo(qPx, pPy);
    });
    ctx.stroke();
  }

  function loopLagrange() {
    if (activeTab !== 'lagrange') return;
    rk4Step(0.03);
    drawLagrange();
    animationFrames['lagrange'] = requestAnimationFrame(loopLagrange);
  }

  // ==========================================
  // 5. SIMULASI ELEKTROMAGNETIK (BORIS PUSHER)
  // ==========================================
  function resetEM() {
    emState = { x: 50, y: 180, vx: 40, vy: -10 };
    emTrail = [];
    drawEM();
  }

  function drawEM() {
    const canvas = document.getElementById('canvas-em');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 360;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Magnetic field vector indicator grid (X = into page, Dot = out of page)
    ctx.fillStyle = '#1e293b';
    ctx.font = '14px monospace';
    const symbol = emBz >= 0 ? '⊗' : '⊙';
    for (let bx = 50; bx < width - 30; bx += 70) {
      for (let by = 40; by < height - 30; by += 50) {
        ctx.fillText(`${symbol} B`, bx, by);
      }
    }

    // Electric Field Arrows
    if (Math.abs(emEy) > 0.1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      const dir = emEy > 0 ? 1 : -1;
      for (let ex = 80; ex < width - 40; ex += 120) {
        ctx.beginPath();
        ctx.moveTo(ex, 180 - dir * 40);
        ctx.lineTo(ex, 180 + dir * 40);
        ctx.stroke();
      }
    }

    // Particle Trail
    ctx.strokeStyle = emCharge > 0 ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    emTrail.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Charged Particle
    ctx.fillStyle = emCharge > 0 ? '#ef4444' : '#3b82f6';
    ctx.beginPath();
    ctx.arc(emState.x, emState.y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(emCharge > 0 ? 'q+' : 'q-', emState.x - 7, emState.y + 4);
  }

  function loopEM() {
    if (activeTab !== 'em') return;

    // Boris Algorithm for Lorentz Force Integration
    const dt = 0.05;
    const q_m = emCharge / emMass;

    // Half step E acceleration
    let vx = emState.vx + 0.5 * dt * q_m * emEx;
    let vy = emState.vy + 0.5 * dt * q_m * emEy;

    // Magnetic rotation
    const tB = 0.5 * dt * q_m * emBz;
    const sB = (2 * tB) / (1 + tB * tB);

    const vx_prime = vx + vy * tB;
    const vy_prime = vy - vx * tB;

    vx += vy_prime * sB;
    vy -= vx_prime * sB;

    // Second half step E
    emState.vx = vx + 0.5 * dt * q_m * emEx;
    emState.vy = vy + 0.5 * dt * q_m * emEy;

    emState.x += emState.vx * dt;
    emState.y += emState.vy * dt;

    const width = document.getElementById('canvas-em')?.width || 700;
    const height = 360;

    if (emState.x < 10 || emState.x > width - 10 || emState.y < 10 || emState.y > height - 10) {
      resetEM();
    }

    emTrail.push({ x: emState.x, y: emState.y });
    if (emTrail.length > 250) emTrail.shift();

    drawEM();
    animationFrames['em'] = requestAnimationFrame(loopEM);
  }

  // ==========================================
  // 6. SIMULASI MEKANIKA KLASIK (PROJECTILE DUAL)
  // ==========================================
  function resetProjectile() {
    projRunning = false;
    projTime = 0;
    projRealState = { x: 0, y: 0, vx: 0, vy: 0 };
    projRealTrail = [];
    projIdealTrail = [];
    drawMechanics();
  }

  function startProjectile() {
    projRunning = true;
    projTime = 0;
    const rad = (projAngle * Math.PI) / 180;
    projRealState = {
      x: 0,
      y: 0,
      vx: projV0 * Math.cos(rad),
      vy: projV0 * Math.sin(rad)
    };
    projRealTrail = [];

    // Calculate full Ideal parabola points
    projIdealTrail = [];
    const g = 9.8;
    const tFlight = (2 * projV0 * Math.sin(rad)) / g;
    for (let t = 0; t <= tFlight; t += 0.05) {
      const ix = projV0 * Math.cos(rad) * t;
      const iy = projV0 * Math.sin(rad) * t - 0.5 * g * t * t;
      projIdealTrail.push({ x: ix, y: iy });
    }

    loopProjectile();
  }

  function drawMechanics() {
    const canvas = document.getElementById('canvas-mechanics');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 700;
    const height = canvas.height = 360;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height - 30, width, 30);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(0, height - 30, width, 1);

    const rad = (projAngle * Math.PI) / 180;
    const g = 9.8;
    const rIdeal = (Math.pow(projV0, 2) * Math.sin(2 * rad)) / g;
    const hIdeal = (Math.pow(projV0, 2) * Math.pow(Math.sin(rad), 2)) / (2 * g);

    const scaleX = (width - 100) / Math.max(120, rIdeal * 1.2);
    const scaleY = (height - 90) / Math.max(60, hIdeal * 1.3);

    // Plot Ideal Trajectory (Dashed Gray)
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    projIdealTrail.forEach((pt, i) => {
      const px = 40 + pt.x * scaleX;
      const py = (height - 30) - pt.y * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Real Drag Trajectory (Solid Orange)
    if (projRealTrail.length > 0) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      projRealTrail.forEach((pt, i) => {
        const px = 40 + pt.x * scaleX;
        const py = (height - 30) - pt.y * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Current Ball Position
      const curPx = 40 + projRealState.x * scaleX;
      const curPy = (height - 30) - projRealState.y * scaleY;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(curPx, curPy, 8, 0, Math.PI * 2); ctx.fill();

      // Draw Vector Components vx & vy
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(curPx, curPy);
      ctx.lineTo(curPx + projRealState.vx * 0.8, curPy);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(curPx, curPy);
      ctx.lineTo(curPx, curPy - projRealState.vy * 0.8);
      ctx.stroke();
    }

    // Legend
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`Jangkauan Ideal: ${rIdeal.toFixed(1)} m | Tinggi Maks: ${hIdeal.toFixed(1)} m`, 40, 30);
  }

  function loopProjectile() {
    if (activeTab !== 'mechanics' || !projRunning) return;

    const dt = 0.04;
    const g = 9.8;
    const v = Math.sqrt(projRealState.vx * projRealState.vx + projRealState.vy * projRealState.vy);

    // Quadratic air drag: a_drag = -b * v * v_vector
    const ax = -projDrag * projRealState.vx * v;
    const ay = -g - projDrag * projRealState.vy * v;

    projRealState.vx += ax * dt;
    projRealState.vy += ay * dt;

    projRealState.x += projRealState.vx * dt;
    projRealState.y += projRealState.vy * dt;
    projTime += dt;

    projRealTrail.push({ x: projRealState.x, y: projRealState.y });

    drawMechanics();

    if (projRealState.y <= 0 && projTime > 0.1) {
      projRunning = false;
    } else {
      animationFrames['mechanics'] = requestAnimationFrame(loopProjectile);
    }
  }

  // ==========================================
  // HELPER UTILITIES
  // ==========================================
  function mapRange(val, inMin, inMax, outMin, outMax) {
    return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  function getSpectrumRegion(lambdaNm) {
    if (lambdaNm < 380) return 'Ultraviolet (UV)';
    if (lambdaNm <= 750) return 'Cahaya Tampak (Visible)';
    return 'Inframerah (Infrared)';
  }

  function tempToColor(kelvin) {
    if (kelvin < 3500) return '#ef4444';
    if (kelvin < 5500) return '#f59e0b';
    if (kelvin < 7500) return '#f8fafc';
    return '#38bdf8';
  }

  function wavelengthToRGB(wavelength) {
    let r = 0, g = 0, b = 0;
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380); b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
      g = (wavelength - 440) / (490 - 440); b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
      g = 1; b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510); g = 1;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1; g = -(wavelength - 645) / (645 - 580);
    } else if (wavelength >= 645 && wavelength <= 780) {
      r = 1;
    } else {
      return '#1e293b';
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (window.SimulasiFisika) window.SimulasiFisika.init();
});
