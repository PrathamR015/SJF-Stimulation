const processes = [];
let gantt = [];
let events = [];
let ctx, chartCtx;
let playing = false;
let speed = 1;
let animationProgress = 0;
let animationFrame = null;
let scale = 50; 

const colorPool = [
  "#004aad", "#ff9933", "#2b9f2b", "#8e44ad", "#e74c3c", "#16a085",
  "#f1c40f", "#d35400", "#2980b9", "#7f8c8d"
];

function nextColor(i) {
  return colorPool[i % colorPool.length];
}

document.getElementById("add-process").addEventListener("click", () => {
  const pid = document.getElementById("pid").value.trim() || `P${processes.length + 1}`;
  const burst = parseInt(document.getElementById("burst").value, 10);
  const arrival = parseInt(document.getElementById("arrival").value, 10);

  if (!pid || isNaN(burst) || isNaN(arrival) || burst <= 0 || arrival < 0) {
    alert("Please enter valid process details!");
    return;
  }

  if (processes.some(p => p.pid === pid)) {
    alert("Process ID already exists!");
    return;
  }

  processes.push({ pid, burst, arrival, color: nextColor(processes.length) });
  updateTable();
  document.getElementById("pid").value = "";
  document.getElementById("burst").value = "";
  document.getElementById("arrival").value = "";
});

document.getElementById("clear-processes").addEventListener("click", () => {
  if (!confirm("Clear all processes?")) return;
  processes.length = 0;
  gantt.length = 0;
  events.length = 0;
  resetUI();
});

document.getElementById("start-btn").addEventListener("click", () => {
  if (processes.length === 0) {
    alert("Add at least one process first!");
    return;
  }
  simulateSJF();
});

document.getElementById("reset-btn").addEventListener("click", () => {
  if (!confirm("Reset simulation (keeps processes)?")) return;
  gantt.length = 0;
  events.length = 0;
  playing = false;
  cancelAnimationFrame(animationFrame);
  animationProgress = 0;
  drawStaticFrame(0);
  clearStats();
});

document.getElementById("play").addEventListener("click", () => {
  if (!playing && gantt.length > 0) {
    playing = true;
    animate();
  }
});

document.getElementById("pause").addEventListener("click", () => {
  playing = false;
});

document.getElementById("step-forward").addEventListener("click", () => {
  if (gantt.length === 0) return;
  const totalEnd = gantt[gantt.length - 1].end;
  animationProgress = Math.min(animationProgress + 0.5, totalEnd);
  drawStaticFrame(animationProgress);
});

document.getElementById("step-back").addEventListener("click", () => {
  if (gantt.length === 0) return;
  animationProgress = Math.max(animationProgress - 0.5, 0);
  drawStaticFrame(animationProgress);
});

document.getElementById("speed").addEventListener("input", e => {
  speed = parseFloat(e.target.value);
});

document.getElementById("scale-input").addEventListener("input", e => {
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val) && val >= 20 && val <= 200) {
    scale = val;
    drawStaticFrame(animationProgress);
  }
});

function updateTable() {
  const tbody = document.querySelector("#process-table tbody");
  tbody.innerHTML = "";
  processes.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.pid}</td>
      <td>${p.burst}</td>
      <td>${p.arrival}</td>
      <td><span class="color-swatch" style="background:${p.color}"></span></td>
    `;
    tbody.appendChild(row);
  });
}

function simulateSJF() {
  gantt = [];
  events = [];
  animationProgress = 0;
  playing = false;
  cancelAnimationFrame(animationFrame);
  clearStats();

  const procs = processes.map(p => ({ ...p }));
  const completed = [];
  let time = 0;
  const ready = [];
  const sortedByArrival = [...procs].sort((a, b) => a.arrival - b.arrival);

  logEvent(`Simulation started with ${procs.length} processes.`);

  if (sortedByArrival[0].arrival > 0) {
    logEvent(`CPU idle until t=${sortedByArrival[0].arrival}`);
    time = sortedByArrival[0].arrival;
  }

  while (completed.length < procs.length) {
    sortedByArrival.forEach(p => {
      if (!ready.includes(p) && !completed.includes(p) && p.arrival <= time) {
        ready.push(p);
        logEvent(`t=${time} → Process ${p.pid} arrived`);
      }
    });

    if (ready.length > 0) {
      ready.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
      const current = ready.shift();
      const startTime = Math.max(time, current.arrival);
      current.start = startTime;
      current.finish = startTime + current.burst;
      current.waiting = current.start - current.arrival;
      current.turnaround = current.finish - current.arrival;
      current.response = current.start - current.arrival;

      gantt.push({
        pid: current.pid,
        start: current.start,
        end: current.finish,
        color: current.color
      });

      logEvent(`t=${current.start} → ${current.pid} started (burst=${current.burst})`);
      time = current.finish;
      logEvent(`t=${current.finish} → ${current.pid} completed`);
      completed.push(current);
    } else {
      const nextArrival = sortedByArrival.find(p => !completed.includes(p) && !ready.includes(p));
      if (nextArrival) {
        logEvent(`t=${time} → CPU idle until t=${nextArrival.arrival}`);
        time = nextArrival.arrival;
      } else {
        time++;
      }
    }
  }

  calculateStats();
  populateProcStats();
  populateLegend();
  drawStaticFrame(0);
  drawBarChart();
  updateEventLogUI();
}

function logEvent(text) {
  events.push({ t: Date.now(), text });
}

function updateEventLogUI() {
  const logDiv = document.getElementById("log-entries");
  logDiv.innerHTML = "";
  events.forEach(e => {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = e.text;
    logDiv.appendChild(entry);
  });
  logDiv.scrollTop = logDiv.scrollHeight;
}

function calculateStats() {
  const statsMap = {};
  let totalWT = 0, totalTAT = 0, busyTime = 0;

  processes.forEach(p => {
    const exec = gantt.find(g => g.pid === p.pid);
    if (!exec) return;
    const finish = exec.end;
    const start = exec.start;
    const turnaround = finish - p.arrival;
    const waiting = start - p.arrival;
    const response = start - p.arrival;
    statsMap[p.pid] = { start, finish, waiting, turnaround, response };
    totalWT += waiting;
    totalTAT += turnaround;
    busyTime += (exec.end - exec.start);
  });

  const totalTime = gantt[gantt.length - 1].end;
  const idleTime = Math.max(0, totalTime - busyTime);
  const cpuUtil = (busyTime / totalTime) * 100;
  const throughput = processes.length / totalTime;

  document.getElementById("avgWaiting").textContent = (totalWT / processes.length).toFixed(2) + " units";
  document.getElementById("avgTurnaround").textContent = (totalTAT / processes.length).toFixed(2) + " units";
  document.getElementById("cpuUtil").textContent = cpuUtil.toFixed(2) + " %";
  document.getElementById("throughput").textContent = throughput.toFixed(3) + " processes/unit";
  document.getElementById("idleTime").textContent = idleTime.toFixed(2) + " units";
  document.getElementById("totalTime").textContent = totalTime + " units";

  window._simStats = { statsMap, totalTime, busyTime, idleTime };
}

function populateProcStats() {
  const tbody = document.querySelector("#proc-stats tbody");
  tbody.innerHTML = "";
  const { statsMap } = window._simStats || {};
  processes.forEach(p => {
    const s = statsMap[p.pid] || {};
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.pid}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td>${s.start ?? "—"}</td>
      <td>${s.finish ?? "—"}</td>
      <td>${s.waiting ?? "—"}</td>
      <td>${s.turnaround ?? "—"}</td>
      <td>${s.response ?? "—"}</td>`;
    tbody.appendChild(row);
  });
}

function populateLegend() {
  const legend = document.getElementById("legend");
  legend.innerHTML = "<strong>Legend:</strong>";
  processes.forEach(p => {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<span class="color-swatch" style="background:${p.color}"></span> ${p.pid}`;
    legend.appendChild(item);
  });
}

function clearStats() {
  ["avgWaiting", "avgTurnaround", "cpuUtil", "throughput", "idleTime", "totalTime"]
    .forEach(id => document.getElementById(id).textContent = "—");
  document.querySelector("#proc-stats tbody").innerHTML = "";
  document.getElementById("legend").innerHTML = "";
  document.getElementById("log-entries").innerHTML = "";
  const canvas = document.getElementById("barChart");
  const cctx = canvas.getContext("2d");
  cctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetUI() {
  updateTable();
  clearStats();
  const canvas = document.getElementById("ganttCanvas");
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("progress").value = 0;
  document.getElementById("time-display").textContent = "t=0";
}

function animate() {
  if (!playing) return;
  const totalEnd = gantt[gantt.length - 1].end;
  if (animationProgress >= totalEnd) {
    playing = false;
    return;
  }
  animationProgress += 0.02 * speed;
  drawStaticFrame(animationProgress);
  animationFrame = requestAnimationFrame(animate);
}

function drawStaticFrame(currentTime) {
  const canvas = document.getElementById("ganttCanvas");
  const ctx = canvas.getContext("2d");
  const totalEnd = gantt.length ? gantt[gantt.length - 1].end : 0;
  const neededWidth = 120 + totalEnd * scale;
  if (canvas.width !== neededWidth) {
    canvas.width = Math.min(Math.max(neededWidth, 600), 2000);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Arial";
  const startX = 60;
  const barY = 60;
  const barHeight = 50;

  ctx.fillStyle = "#222";
  ctx.fillText("Time →", 10, barY + barHeight / 2 + 6);

  gantt.forEach(p => {
    const startXPos = startX + p.start * scale;
    const fullWidth = (p.end - p.start) * scale;
    let drawWidth;
    if (currentTime >= p.end) {
      drawWidth = fullWidth;
      ctx.fillStyle = p.color;
    } else if (currentTime > p.start && currentTime < p.end) {
      drawWidth = (currentTime - p.start) * scale;
      ctx.fillStyle = shadeColor(p.color, 10);
    } else {
      drawWidth = 0;
      ctx.fillStyle = "#f0f0f0";
    }

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.strokeRect(startXPos, barY, fullWidth, barHeight);
    if (drawWidth > 0) {
      ctx.fillRect(startXPos, barY, drawWidth, barHeight);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(p.pid, startXPos + fullWidth / 2, barY + barHeight / 2 + 6);
    } else {
      ctx.fillStyle = "#777";
      ctx.textAlign = "center";
      ctx.fillText(p.pid, startXPos + fullWidth / 2, barY + barHeight / 2 + 6);
    }
  });

  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  for (let t = 0; t <= totalEnd; t++) {
    const x = startX + t * scale;
    ctx.fillText(t, x, barY + barHeight + 20);
    ctx.beginPath();
    ctx.moveTo(x, barY + barHeight);
    ctx.lineTo(x, barY + barHeight + 8);
    ctx.stroke();
  }

  const pointerX = startX + Math.min(currentTime, totalEnd) * scale;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(pointerX, barY - 10);
  ctx.lineTo(pointerX, barY + barHeight + 10);
  ctx.stroke();
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText(`t=${Math.min(currentTime, totalEnd).toFixed(2)}`, pointerX + 6, barY - 14);

  const progress = document.getElementById("progress");
  const percent = totalEnd > 0 ? (Math.min(currentTime, totalEnd) / totalEnd) * 100 : 0;
  progress.value = percent;
  document.getElementById("time-display").textContent = `t=${Math.min(currentTime, totalEnd).toFixed(2)}`;
}

function shadeColor(hex, percent) {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = Math.round((t - (f >> 16)) * p) + (f >> 16);
  const G = Math.round((t - (f >> 8 & 0x00FF)) * p) + (f >> 8 & 0x00FF);
  const B = Math.round((t - (f & 0x0000FF)) * p) + (f & 0x0000FF);
  return `rgb(${R},${G},${B})`;
}

function drawBarChart() {
  const canvas = document.getElementById("barChart");
  chartCtx = canvas.getContext("2d");
  chartCtx.clearRect(0, 0, canvas.width, canvas.height);
  const { statsMap } = window._simStats || {};
  if (!statsMap) return;

  const labels = processes.map(p => p.pid);
  const waiting = processes.map(p => statsMap[p.pid]?.waiting ?? 0);
  const turnaround = processes.map(p => statsMap[p.pid]?.turnaround ?? 0);

  const pad = 30;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const maxVal = Math.max(...waiting, ...turnaround, 1);

  chartCtx.strokeStyle = "#333";
  chartCtx.beginPath();
  chartCtx.moveTo(pad, pad);
  chartCtx.lineTo(pad, pad + h);
  chartCtx.lineTo(pad + w, pad + h);
  chartCtx.stroke();

  const barGroupWidth = w / labels.length;
  const barWidth = Math.min(30, barGroupWidth * 0.35);

  labels.forEach((lab, i) => {
    const xBase = pad + i * barGroupWidth + (barGroupWidth - 2 * barWidth) / 2;
    const hWait = (waiting[i] / maxVal) * (h - 20);
    chartCtx.fillStyle = "#2b9f2b";
    chartCtx.fillRect(xBase, pad + h - hWait, barWidth, hWait);
    const hTat = (turnaround[i] / maxVal) * (h - 20);
    chartCtx.fillStyle = "#004aad";
    chartCtx.fillRect(xBase + barWidth + 6, pad + h - hTat, barWidth, hTat);
    chartCtx.fillStyle = "#000";
    chartCtx.textAlign = "center";
    chartCtx.fillText(lab, xBase + barWidth, pad + h + 14);
  });

  chartCtx.fillStyle = "#000";
  chartCtx.textAlign = "left";
  chartCtx.fillText("Waiting (green)", pad + 5, 12);
  chartCtx.fillText("Turnaround (blue)", pad + 140, 12);
}

window.addEventListener("load", () => {
  drawStaticFrame(0);
  updateTable();
});
