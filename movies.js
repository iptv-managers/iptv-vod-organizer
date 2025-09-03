/**
 * Só execute esse script a primeira vez, depois use o nosso sincronizador, onde ele ja faz apenas nos filmes 
 * recentemente adicionados pelo sincronizador
 * 
 * Esse codigo ele pega os itens do banco de dados do XUI, apaga todas as categorias, 
 * e ordena todos os filmes de acordo com as categorias presentes no array
 * é necessário que uma API do TMDB, e também que as informações estejam contidas no banco de dados do XUI corretamente
 * 
 * 
 * types disponiveis
 *      - year - A categoria representa um ano em especifico
 *      - genre - A categoria representa um genero em especifico
 *      - collection - A categoria representa uma colecao de filmes
 *      - streaming - A categoria representa um streaming em especifico. Apenas alguns disponiveis
 */

import axios from "axios";
import fs from "fs";
import pLimit from "p-limit";
import { cleanName } from "./utils/clean-name.js";
import { isSubtitled } from "./validations/is-subtitled.js";
import { isAdult } from "./validations/is-adult.js";
import { getGenreIds } from "./validations/get-genre.js";
import { getYears } from "./validations/get-years.js";
import { getDatabase } from "./utils/database.js";

const CHUNK_SIZE = 500;
const CONCURRENCY_LIMIT = 30; // Limite de requisições concorrentes

let hasCache = false;

// Aqui a gente salva as categorias existentes para consultar, caso 
// não encontre através dos códigos
let existingCategories = [];
const limit = pLimit(CONCURRENCY_LIMIT);

export async function createMoviesTMDB() {
    const db = await getDatabase();
    const { OUTPUT_FILE } = process.env;

    const [rows] = await db.query(
        `SELECT id, category_id, stream_display_name, stream_source, movie_properties, year, tmdb_id
        FROM streams
        WHERE type = 2`
    );
    console.log(`Total de filmes encontrados: ${(rows).length}`);

    // Consultampos as categorias existentes no banco de dados
    const [cats] = await db.query(
        `SELECT id, category_name, is_adult
        FROM streams_categories
        WHERE category_type = 'movie'`
    );
    existingCategories = cats;

    const allResults = [];

    // Processa em chunks
    for (let i = 0; i < (rows).length; i += CHUNK_SIZE) {
        const chunk = (rows).slice(i, i + CHUNK_SIZE);
        console.log(`Processando chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} filmes)`);

        const processedChunk = await Promise.all(
            chunk.map((stream) => limit(() => fetchFromTMDB(stream, existingCategories)))
        );

        allResults.push(...processedChunk);
        console.log(`✅ Chunk processado. Total acumulado: ${allResults.length}`);
    }

    // Salva todos os resultados em um único arquivo JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2), 'utf-8');
    console.log(`🎉 Todos os filmes processados! JSON final salvo em: ${OUTPUT_FILE}`);


    const streams = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    const categories = JSON.parse(fs.readFileSync('./cat-movies.json', 'utf-8'));
    await organizeMovies(streams, categories, true);

    console.log(`🎉 Organização de filmes concluída!`);
}

async function fetchFromTMDB(stream, existingCategories, silent = false) {
    try {
        const {
            TMDB_API_KEY, TMDB_LANGUAGE,
        } = process.env;

        if(!hasCache) {
            await getCachesTMDB(stream);
        }
        let tmdbData;
        if(!stream || (!stream.stream_display_name && !stream.tmdb_id)) {
            console.log(stream);
            return;
        }
        if (stream.tmdb_id) {
            // Se já tem o ID, busca direto
            const { data } = await axios.get(
                `https://api.themoviedb.org/3/movie/${stream.tmdb_id}`,
                { params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE } }
            );
            tmdbData = data;
        } else {
            // 2 - Se não encontrou pelo ID, busca por nome + ano
            const query = stream.stream_display_name;
            const { data } = await axios.get(
                `https://api.themoviedb.org/3/search/movie`,
                {
                params: {
                    api_key: TMDB_API_KEY,
                    query: cleanName(query),
                    year: stream.year || undefined,
                    language: TMDB_LANGUAGE,
                },
                }
            );

            if (data.results && data.results.length > 0) {
                tmdbData = data.results[0];
            }
        }

        if (!tmdbData) {
            // Se não tem o data, procura pelo apenas
            const { data } = await axios.get(
                `https://api.themoviedb.org/3/search/movie`,
                { 
                    params: { 
                        api_key: TMDB_API_KEY, 
                        language: TMDB_LANGUAGE,
                        query: cleanName(stream.stream_display_name)
                    } 
                }
            );

            if (data.results && data.results.length > 0) {
                const firstResult = data.results[0];
                
                // Se quiser buscar os detalhes completos:
                const { data: details } = await axios.get(
                    `https://api.themoviedb.org/3/${firstResult.media_type}/${firstResult.id}`,
                    { params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE } }
                );

                tmdbData = details;
            }
        }

        if (!tmdbData && silent === false) {
            console.warn(
                `⚠️ Não foi possível encontrar dados para: ${stream.stream_display_name} (${stream.tmdb_id || "sem id"})`
            );
        }
        const existingCategoryNames = (JSON.parse(stream.category_id || "[]"))
            .map((catId) => {
                const cat = existingCategories.find((c) => c.id === catId);
                return cat ? cat.category_name : null;
            })
            .filter(Boolean)
            .join(", ");
        
        return {
            ...{category_names: existingCategoryNames},
            ...stream,
            tmdb: tmdbData,
        };
    } catch (err) {
        if(err?.message?.toString().includes('401')) {
            console.error("❌ ============================================================= ❌ ");
            console.error("Erro de autenticação com a TMDB. Verifique sua chave API.");
            console.error("❌ ============================================================= ❌ ");
            process.exit(1);
        }
        console.error(
            `Erro TMDB: ${stream.stream_display_name} (${stream.tmdb_id || "sem id"})`,
            err.message
        );

        return {
            ...stream,
            tmdb: null,
        };
    }
}
export async function organizeMovies(streams, categories, pushCeateCategories = true, silent = false) {
    if(pushCeateCategories) {
        categories = await createCategories(categories);
    }

    for (const stream of streams) {
        const category_ids = [];
        if(isAdult(stream)){
            category_ids.push(categories.find(cat => cat.type === 'adult')?.id);
            await updateCategories(stream, category_ids, silent);
            continue; // Se for adulto, não adiciona mais categorias
        }
        if(isSubtitled(stream)) {
            category_ids.push(categories.find(cat => cat.type === 'subtitled')?.id);
        }
        category_ids.push(...getGenreIds(stream, categories));
        category_ids.push(...getYears(stream, categories));

        // Se não preencher os requisitos, adiciona a categoria padrão
        if(category_ids.length === 0) {
            category_ids.push(categories.find(cat => cat.type === 'uncategorized')?.id);
        }
        await updateCategories(stream, category_ids, silent);

    }
}

// Deleta todas as categorias de filmes e cria as novas
async function createCategories(allCategories) {
  const db = await getDatabase();
  const connection = await db.getConnection(); // se usar pool

  try {
    await connection.beginTransaction();

    // Apaga as categorias antigas
    await connection.query(
      `DELETE FROM streams_categories WHERE category_type = 'movie'`
    );

    // Reinsere as categorias
    for (let i = 0; i < allCategories.length; i++) {
      const cat = allCategories[i];
      const [res] = await connection.query(
        `INSERT INTO streams_categories (category_name, category_type, cat_order, is_adult)
         VALUES (?, 'movie', ?, ?)`,
        [cat.name, i, cat.is_adult || false]
      );
      cat.id = res.insertId;
    }

    // Só confirma se tudo deu certo
    await connection.commit();

    return allCategories;
  } catch (err) {
    // Reverte tudo em caso de erro
    await connection.rollback();
    console.error("❌ Erro ao recriar categorias:", err.message);
    throw err;
  } finally {
    connection.release?.(); // se for pool
  }
}

/**
 * Função para se utilizar quando todas as categorias ja contenham no banco de dados
 * ela só compara os nomes e atualiza os IDs das categorias
 * @param {*} allCategories 
 */
async function mapCategories(categories) {
    const db = await getDatabase();
    const existinCategories = await db.query(
        `SELECT id, category_name FROM streams_categories WHERE category_type = 'movie'`);
    
    for (const cat of categories) {
        const existingCat = existinCategories[0].find(c => c.category_name === cat.name);
        if (existingCat) {
            cat.id = existingCat.id;
        } else {
            console.warn(`Categoria não encontrada: ${cat.name}`);
            cat.id = null; // Ou trate de outra forma se necessário
        }
    }
    return categories.filter(cat => cat.id !== null); // Filtra categorias sem ID
}
async function updateCategories(stream, categories, silent = false) {
  const db = await getDatabase();
  const connection = await db.getConnection(); // se for pool

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE streams SET category_id = ? WHERE id = ?`,
      [JSON.stringify(categories), stream.id]
    );

    await connection.commit();

    if (!silent) {
      console.log(
        `✅ Categorias atualizadas para: ${stream.stream_display_name} => [${categories.join(", ")}]`
      );
    }
  } catch (err) {
    await connection.rollback();
    console.error("❌ Erro ao atualizar categorias:", err.message);
  } finally {
    connection.release?.(); // se for pool
  }
}

/**
 * Apenas as utilize, caso as categorias já estejam mapeadas e criadas
 * @param {*} streams Envie apenas o registro do banco de dados do XUi
 */

/**
    Exemplo de stream que deve ser enviado para a função categorizeMovies
  [{
    "id": 12868,
    "category_id": "",
    "stream_display_name": "O nome do seu filme",
    "movie_properties": "{\"kinopoisk_url\":\"\",\"tmdb_id\":\"\",\"name\":\"XXX A Darker Shade\",\"o_name\":\"XXX A Darker Shade\",\"cover_big\":\"\",\"movie_image\":\"\",\"release_date\":\"\",\"episode_run_time\":\"\",\"youtube_trailer\":\"\",\"director\":\"\",\"actors\":\"\",\"cast\":\"\",\"description\":\"\",\"plot\":\"\",\"age\":\"\",\"mpaa_rating\":\"\",\"rating_count_kinopoisk\":0,\"country\":\"\",\"genre\":\"\",\"backdrop_path\":[\"\"],\"duration_secs\":5520,\"duration\":\"01:32:00\",\"video\":[],\"audio\":[],\"bitrate\":0,\"rating\":\"0\"}",
    "year": null,
    "tmdb_id": null
  },]
 */
export async function categorizeMovies(streams, categories, silent = false) {
    if(!categories || categories.length === 0) { 
        categories = JSON.parse(fs.readFileSync('./cat-movies.json', 'utf-8'));
    }
    
    // Filtramos filmes e series que nao contenham nomes e que podem vir
    // com bug da tabela do cliente, afinal filmes sem nomes não existem rs
    streams = streams.filter((row) => {
        return row.stream_display_name
    });
        
    const mappedCategories = await mapCategories(categories);
    const allResults = [];

    // Processa em chunks
    for (let i = 0; i < streams.length; i += CHUNK_SIZE) {
        const chunk = streams.slice(i, i + CHUNK_SIZE);
        if(silent === false) {
            console.log(`Processando chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} filmes)`);
        }

        const processedChunk = await Promise.all(
            chunk.map((stream) => limit(() => fetchFromTMDB(stream, mappedCategories, silent)))
        );

        allResults.push(...processedChunk);
        if(silent === false) {
            console.log(`✅ Chunk processado. Total acumulado: ${allResults.length}`);
        }
    }

    await organizeMovies(allResults, mappedCategories, false, silent);
    console.log(`🎉 Organização de filmes concluída!`);
}

export async function getCachesTMDB(args) {
    if(hasCache === false && process.env.DISABLE_GLOBAL_CACHE !== 'false') {
      const response = await axios.post("http://cache.xui-managers.site/global-cache", args, { responseType: "arraybuffer", timeout: 50000 }).catch(() => {});
      const dbPath = "./prisma/tmdb_cache.db";
      /*
      //TODO
      if(response?.data) {
        try {
          await fs.access(dbPath);
          //TODO bd already exist, make functions to merge it
        } catch (error) {
          await fs.writeFile(dbPath, response.data);
          await new Promise((resolve) => {
            setTimeout(() => resolve(), 2000);
          });
        }
      } else {
        await execAsync("npx prisma db push");
      }*/
      hasCache = true;
    }
}