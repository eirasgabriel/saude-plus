const { spawn } = require("child_process");

const npmCli = process.env.npm_execpath;

function createNpmCommand(args) {
  if (npmCli) {
    return {
      command: process.execPath,
      args: [npmCli, ...args],
      options: { shell: false },
    };
  }

  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    options: { shell: process.platform === "win32" },
  };
}

const processes = [
  {
    name: "backend",
    args: ["--prefix", "backend", "start"],
  },
  {
    name: "frontend",
    args: ["--prefix", "frontend", "run", "iniciar"],
  },
];

const children = [];
let stopping = false;

for (const processConfig of processes) {
  const { command, args, options } = createNpmCommand(processConfig.args);
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: "inherit",
    windowsHide: false,
    ...options,
  });

  children.push(child);

  child.on("error", (error) => {
    if (stopping) return;
    console.error(`[${processConfig.name}] nao foi possivel iniciar: ${error.message}`);
    stopAll(1);
  });

  child.on("exit", (code, signal) => {
    if (stopping || signal) return;
    if (code && code !== 0) {
      console.error(`[${processConfig.name}] encerrou com codigo ${code}.`);
      stopAll(code);
    }
  });
}

function stopAll(code = 0) {
  stopping = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
