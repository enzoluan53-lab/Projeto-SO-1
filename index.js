const express = require("express");
const cors = require("cors");
const os = require("os");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

function getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    return {
        total: (total / 1024 / 1024).toFixed(2) + " MB",
        used: (used / 1024 / 1024).toFixed(2) + " MB",
        free: (free / 1024 / 1024).toFixed(2) + " MB",
        percent: ((used / total) * 100).toFixed(2) + "%"
    };
}

function countFiles(dir = ".") {
    let count = 0;
    const files = fs.readdirSync(dir);

    for (let file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            count += countFiles(filePath);
        } else {
            count++;
        }
    }

    return count;
}

app.get("/", (req, res) => {
    const cpus = os.cpus();
    const ipAddress = Object.values(os.networkInterfaces())
        .flat()
        .find(i => i.family === "IPv4" && !i.internal)?.address;

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

        desempenho: {
            cpu_modelo: cpus[0]?.model || "N/A",
            cpu_cores: cpus.length,
            load_avg: os.loadavg(),
            memoria: getMemoryUsage(),
            uptime: (os.uptime() / 60).toFixed(2) + " minutos"
        },

        rede: {
            ip: ipAddress || "N/A"
        },

        projeto: {
            total_arquivos: countFiles()
        },

        ambiente: {
            modo: process.env.NODE_ENV || "development",
            porta: process.env.PORT || 3000,
            cloud: process.env.RENDER ? "Render" : "Local"
        }
    };

    res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
