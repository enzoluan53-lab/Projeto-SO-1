const express = require("express");
const cors = require("cors");
const os = require("os");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

function formatUptime(minutes) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.floor(minutes % 60);
  return `${days}d ${hours}h ${mins}m`;
}

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percent = ((used / total) * 100).toFixed(0);

  return {
    total: `${(total / 1024 / 1024 / 1024).toFixed(2)} GB`,
    used: `${(used / 1024 / 1024 / 1024).toFixed(2)} GB`,
    free: `${(free / 1024 / 1024 / 1024).toFixed(2)} GB`,
    percent: `${percent}%`,
    por_cpu: `${((used / os.cpus().length) / 1024 / 1024 / 1024).toFixed(2)} GB`
  };
}

function countFiles(dir = ".") {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(entryPath);
    } else {
      count++;
    }
  }

  return count;
}

function listProjectFiles(dir = ".") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.map(entry => {
    const stats = fs.statSync(path.join(dir, entry.name));
    return {
      name: entry.name,
      type: entry.isDirectory() ? "Dir" : "Arquivo",
      size: entry.isDirectory() ? "-" : `${(stats.size / 1024).toFixed(2)} KB`
    };
  });
}

app.get("/api", (req, res) => {
  const cpus = os.cpus();
  const interfaces = os.networkInterfaces() || {};
  const ipv4 = Object.values(interfaces)
    .flat()
    .find(net => net.family === "IPv4" && !net.internal);
  const userInfo = os.userInfo();
  const memory = getMemoryUsage();
  const uptimeMinutes = os.uptime() / 60;
  const loadAvg = os.loadavg();

  const data = {
    sistema: {
      hostname: os.hostname(),
      plataforma: os.platform(),
      arquitetura: os.arch(),
      tipo: os.type(),
      release: os.release(),
      endianness: os.endianness(),
      node: process.version
    },
    usuario: {
      username: userInfo.username,
      homedir: userInfo.homedir,
      tempdir: os.tmpdir(),
      shell: userInfo.shell || "-",
      uid: userInfo.uid,
      gid: userInfo.gid
    },
    desempenho: {
      cpu_modelo: cpus[0]?.model || "N/A",
      cpu_cores: cpus.length,
      cpu_media: Number(loadAvg[0].toFixed(0)),
      cpu_usage: cpus.map(() => Math.floor(Math.random() * 40) + 20),
      load_avg: loadAvg.map(val => val.toFixed(2)),
      memoria: memory,
      uptime: formatUptime(uptimeMinutes)
    },
    rede: {
      ip: ipv4?.address || "N/A",
      interfaces: Object.entries(interfaces).flatMap(([name, nets]) =>
        nets.map(net => ({
          name,
          address: net.address,
          family: net.family
        }))
      )
    },
    projeto: {
      total_arquivos: countFiles(),
      arquivos: listProjectFiles()
    },
    tempo: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      iso: new Date().toISOString()
    },
    aplicacao: {
      pid: process.pid,
      dir: process.cwd(),
      memory: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      execPath: process.execPath
    },
    ambiente: {
      status: process.env.RENDER ? "Executando no Render" : "Local",
      porta: process.env.PORT || 3000,
      modo: process.env.NODE_ENV || "development",
      cloud: process.env.RENDER ? "Sim" : "Não"
    }
  };

  res.json(data);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
