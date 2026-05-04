const formatUptime = minutes => {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.floor(minutes % 60);
  return `${days}d ${hours}h ${mins}m`;
};

const fill = data => {
  const status = data.ambiente.status || "Normal";
  const statusPill = document.getElementById("system-status");
  const statusClass = status.toLowerCase().includes("render") ? "render" : "normal";
  statusPill.className = `status-pill ${statusClass}`;

  document.getElementById("summary-ram").textContent = data.desempenho.memoria.percent;
  document.getElementById("summary-cpu").textContent = `${data.desempenho.cpu_media}%`;
  document.getElementById("summary-uptime").textContent = data.desempenho.uptime;
  document.getElementById("summary-files").textContent = data.projeto.total_arquivos;
  document.getElementById("summary-ip").textContent = data.rede.ip;
  document.getElementById("summary-status").textContent = status;
  document.getElementById("system-status").textContent = status;

  document.getElementById("sys-host").textContent = data.sistema.hostname;
  document.getElementById("sys-platform").textContent = data.sistema.plataforma;
  document.getElementById("sys-release").textContent = data.sistema.release;
  document.getElementById("sys-type").textContent = data.sistema.tipo;
  document.getElementById("sys-arch").textContent = data.sistema.arquitetura;
  document.getElementById("sys-endian").textContent = data.sistema.endianness;
  document.getElementById("sys-node").textContent = data.sistema.node;

  document.getElementById("user-name").textContent = data.usuario.username;
  document.getElementById("user-home").textContent = data.usuario.homedir;
  document.getElementById("user-temp").textContent = data.usuario.tempdir;
  document.getElementById("user-shell").textContent = data.usuario.shell;
  document.getElementById("user-uid").textContent = data.usuario.uid;
  document.getElementById("user-gid").textContent = data.usuario.gid;

  document.getElementById("mem-total").textContent = data.desempenho.memoria.total;
  document.getElementById("mem-used").textContent = data.desempenho.memoria.used;
  document.getElementById("mem-free").textContent = data.desempenho.memoria.free;
  document.getElementById("mem-per-cpu").textContent = data.desempenho.memoria.por_cpu;
  document.getElementById("mem-progress").style.width = data.desempenho.memoria.percent;

  document.getElementById("cpu-cores").textContent = data.desempenho.cpu_cores;
  document.getElementById("cpu-model").textContent = data.desempenho.cpu_modelo;
  document.getElementById("cpu-load").textContent = data.desempenho.load_avg.join(" | ");

  const coresList = document.getElementById("cpu-cores-list");
  coresList.innerHTML = "";
  data.desempenho.cpu_usage.forEach((usage, index) => {
    const item = document.createElement("div");
    item.innerHTML = `<div class="stat-row"><span>Core ${index}</span><strong>${usage}%</strong></div><div class="cpu-bar"><span style="width:${usage}%"></span></div>`;
    coresList.appendChild(item);
  });

  document.getElementById("net-ip").textContent = data.rede.ip;

  const interfacesEl = document.getElementById("net-interfaces");
  interfacesEl.innerHTML = "";
  data.rede.interfaces.forEach(net => {
    const div = document.createElement("div");
    div.className = "interface-item";
    div.innerHTML = `<strong>${net.name}</strong> ${net.family} • ${net.address}`;
    interfacesEl.appendChild(div);
  });

  const filesBody = document.getElementById("files-list");
  filesBody.innerHTML = "";
  data.projeto.arquivos.forEach(file => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${file.name}</td><td>${file.type}</td><td>${file.size}</td>`;
    filesBody.appendChild(tr);
  });

  document.getElementById("time-uptime").textContent = data.desempenho.uptime;
  document.getElementById("time-zone").textContent = data.tempo.timezone;
  document.getElementById("time-iso").textContent = data.tempo.iso;

  document.getElementById("app-pid").textContent = data.aplicacao.pid;
  document.getElementById("app-dir").textContent = data.aplicacao.dir;
  document.getElementById("app-mem").textContent = data.aplicacao.memory;
  document.getElementById("app-path").textContent = data.aplicacao.execPath;

  document.getElementById("env-status").textContent = status;
  document.getElementById("env-port").textContent = data.ambiente.porta;
  document.getElementById("env-node").textContent = data.ambiente.modo;
  document.getElementById("env-aws").textContent = data.ambiente.cloud;
};

const loadDashboard = async () => {
  try {
    const response = await fetch("/api");
    const data = await response.json();
    fill(data);
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
};

window.addEventListener("load", () => {
  loadDashboard();
  setInterval(loadDashboard, 15000);
});
