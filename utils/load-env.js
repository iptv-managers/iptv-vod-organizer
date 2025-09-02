import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadEnv() {
  return new Promise((resolve,) => {
  // 1️⃣ Primeiro tenta o projeto principal
  const mainEnvPath = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(mainEnvPath)) {
    dotenv.config({ path: mainEnvPath, override: true });
    console.log("🔹 Carregando .env do projeto principal:", mainEnvPath);
    resolve();
  } else {
      const localEnvPath = path.resolve(__dirname, ".env");
      console.log("⚡ Nenhum .env principal encontrado. Usando .env interno:", localEnvPath);
      dotenv.config({ path: localEnvPath, override: true });
      resolve();
    }
  })
}

