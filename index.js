import inquirer from "inquirer";
import { createTMDB } from "./movies.js";

async function mainMenu() {
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
      createTMDB();
      break;
    case "series":
      console.log("\n👉 Você escolheu organizar categorias de SÉRIES.\nAinda não está pronta essa função.");
      break;
    case "sair":
      console.log("\n👋 Saindo da aplicação...\n");
      process.exit(0);
  }
}

mainMenu();