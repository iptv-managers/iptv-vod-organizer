import inquirer from "inquirer";
import { createMoviesTMDB } from "./movies.js";
import { createSeriesTMDB } from "./series.js";

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
      createMoviesTMDB();
      break;
    case "series":
      createSeriesTMDB();
      break;
    case "sair":
      console.log("\n👋 Saindo da aplicação...\n");
      process.exit(0);
  }
}

mainMenu();