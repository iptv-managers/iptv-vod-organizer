import inquirer from "inquirer";
import chalk from "chalk";
import { createMoviesTMDB } from "./movies.js";
import { createSeriesTMDB } from "./series.js";

function showBanner() {
  console.log(chalk.greenBright(`
 __   __  __   __  ___          _______  __   __  __    _  _______ 
|  |_|  ||  | |  ||   |        |       ||  | |  ||  |  | ||       |
|       ||  | |  ||   |  ____  |  _____||  |_|  ||   |_| ||       |
|       ||  |_|  ||   | |____| | |_____ |       ||       ||       |
 |     | |       ||   |        |_____  ||_     _||  _    ||      _|
|   _   ||       ||   |         _____| |  |   |  | | |   ||     |_ 
|__| |__||_______||___|        |_______|  |___|  |_|  |__||_______|
  `));
  console.log(chalk.yellowBright("               🟢 XUI-SYNC - Organizador de VOD 🟢\n"));
  console.log(chalk.yellowBright("                    🟢 www.xui-managers.site 🟢\n"));
  console.log(chalk.yellowBright("               🟢 http://github.com/xui-managers 🟢\n"));
}

async function mainMenu() {
  showBanner();

  const { escolha } = await inquirer.prompt([
    {
      type: "list",
      name: "escolha",
      message: "O que você deseja fazer?",
      choices: [
        { name: "📽️  Organizar categorias de filmes", value: "filmes" },
        { name: "📺  Organizar categorias de séries", value: "series" },
        { name: "❌  Fechar aplicação", value: "sair" }
      ]
    }
  ]);

  switch (escolha) {
    case "filmes":
      await createMoviesTMDB();
      break;
    case "series":
      await createSeriesTMDB();
      break;
    case "sair":
      console.log("\n👋 Saindo da aplicação...\n");
      process.exit(0);
  }
}

mainMenu();
