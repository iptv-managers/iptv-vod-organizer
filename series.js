/**
 * Esse script é feito para sincronização total do banco de dados.
 * TODO: Necessário função correta para sincronizar apenas complementares.
 * 
 * Esse codigo ele pega os itens do banco de dados do XUI, apaga todas as categorias, 
 * e ordena todos os filmes de acordo com as categorias presentes no array
 * é necessário que uma API do TMDB, e também que as informações estejam contidas no banco de dados do XUI corretamente
 * Caso algo dê errado no meio do processo, seu servidor não será afetado, rollback ativo no mysql
 * 
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
import { isTurkishNovela } from "./validations/is-turkish-novela.js";
import { isBrazilianNovela } from "./validations/is-brazilian-novela.js";
import { isDorama } from "./validations/is-dorama.js";
import { isAnime } from "./validations/is-anime.js";
import { getNetworksIds } from "./validations/get-networks.js";
import { updateProgress } from "./utils/update-progress.js";

const CHUNK_SIZE = 500;
const CONCURRENCY_LIMIT = 30; // Limite de requisições concorrentes
const allItensToUpdate = [];

// Aqui a gente salva as categorias existentes para consultar, caso 
// não encontre através dos códigos
let existingCategories = [];
let categoryIdsToDelete = [];
const limit = pLimit(CONCURRENCY_LIMIT);
const OUTPUT_FILE = 'series.json';

export async function createSeriesTMDB() {
    const db = await getDatabase();

    const [rows] = await db.query(
        `SELECT id, category_id, title, genre, release_date, year, tmdb_id
        FROM streams_series`
    );
    console.log(`Total de séries encontrados: ${(rows).length}`);

    // Consultampos as categorias existentes no banco de dados
    const [cats] = await db.query(
        `SELECT id, category_name, is_adult
        FROM streams_categories
        WHERE category_type = 'series'`
    );
    existingCategories = cats;

    const allResults = [];

    // Processa em chunks
    for (let i = 0; i < (rows).length; i += CHUNK_SIZE) {
        const chunk = (rows).slice(i, i + CHUNK_SIZE);
        console.log(`Processando chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} séries)`);

        const processedChunk = await Promise.all(
            chunk.map((stream) => limit(() => fetchFromTMDB(stream, existingCategories)))
        );

        allResults.push(...processedChunk);
        console.log(`✅ Chunk processado. Total acumulado: ${allResults.length}`);
    }

    // Salva todos os resultados em um único arquivo JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2), 'utf-8');
    console.log(`🎉 Todos as séries organizas! JSON final salvo em: ${OUTPUT_FILE}`);
    console.log(`Começando a preparar e inserir no DB`);

    const streams = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    const categories = JSON.parse(fs.readFileSync('./cat-series.json', 'utf-8'));
    await organizeSeries(streams, categories, true);
    await updateCategories(true, categories);

    console.log(`🎉 Organização de séries concluída!`);
}

async function fetchFromTMDB(stream, existingCategories, silent = false) {
    try {
        const {
            TMDB_API_KEY, TMDB_LANGUAGE,
        } = process.env;

        let tmdbData;
        if(!stream || (!stream.title && !stream.tmdb_id)) {
            console.log(stream);
            return;
        }
        if (stream.tmdb_id) {
            // Se já tem o ID, busca direto
            const { data } = await axios.get(
                `https://api.themoviedb.org/3/tv/${stream.tmdb_id}`,
                { params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE } }
            );
            tmdbData = data;
        } else {
            // 2 - Se não encontrou pelo ID, busca por nome + ano
            const query = stream.title;
            const { data } = await axios.get(
                `https://api.themoviedb.org/3/search/tv`,
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
                // Achamos o TMDB, agora fazemos uma segunda chamada para organizar com as infos completas
                const { data: result } = await axios.get(
                    `https://api.themoviedb.org/3/tv/${data.results[0].id}`,
                    { params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE } }
                );
                tmdbData = result;
            }
        }

        if (!tmdbData) {
            // Se não tem o data, procura pelo nome apenas
            const { data } = await axios.get(
                `https://api.themoviedb.org/3/search/tv`,
                { 
                    params: { 
                        api_key: TMDB_API_KEY, 
                        language: TMDB_LANGUAGE,
                        query: cleanName(stream.title)
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

        const existingCategoryNames = JSON.parse(stream.category_id || "[]")
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
            `Erro TMDB: ${stream.title} (${stream.tmdb_id || "sem id"})`,
            err.message
        );

        return {
            ...stream,
            tmdb: null,
        };
    }
}
export async function organizeSeries(streams, categories, pushCeateCategories = true, silent = false) {
    if(pushCeateCategories) {
        categories = await createCategories(categories);
    }
    for (const stream of streams) {
        const category_ids = [];
        if(isAdult(stream)){
            category_ids.push(categories.find(cat => cat.type === 'adult')?.id);
            allItensToUpdate.push({
                id: stream.id,
                category_ids: JSON.stringify(category_ids)
            });
            continue; // Se for adulto, não adiciona mais categorias
        }
        if(isSubtitled(stream)) {
            category_ids.push(categories.find(cat => cat.type === 'subtitled')?.id);
        }
        if(isTurkishNovela(stream)) {
            category_ids.push(categories.find(cat => cat.type === 'novelasturcas')?.id);
        }
        if(isBrazilianNovela(stream)) {
            category_ids.push(categories.find(cat => cat.type === 'novelasbr')?.id);
        }
        if(isDorama(stream)) {
            category_ids.push(categories.find(cat => cat.type === 'doramas')?.id);
        }
        if(isAnime(stream)) {
            category_ids.push(categories.find(cat => cat.type === 'animes')?.id);
        }
        category_ids.push(...getGenreIds(stream, categories));
        category_ids.push(...getNetworksIds(stream, categories));
        category_ids.push(...getYears(stream, categories));

        // Se não preencher os requisitos, adiciona a categoria padrão
        if(category_ids.length === 0) {
            category_ids.push(categories.find(cat => cat.type === 'uncategorized')?.id);
        }
        allItensToUpdate.push({
            id: stream.id,
            category_ids: JSON.stringify(category_ids)
        });
    }
}

// Deleta todas as categorias de filmes e cria as novas
async function createCategories(allCategories) {
  const db = await getDatabase();
  const connection = await db.getConnection(); // se usar pool

  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
    `SELECT id FROM streams_categories WHERE category_type = 'series'`
    );
    categoryIdsToDelete = rows.map(row => row.id);

    // Reinsere as categorias
    for (let i = 0; i < allCategories.length; i++) {
      const cat = allCategories[i];
      const [res] = await connection.query(
        `INSERT INTO streams_categories (category_name, category_type, cat_order, is_adult)
         VALUES (?, 'series', ?, ?)`,
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
        `SELECT id, category_name FROM streams_categories WHERE category_type = 'series'`);
    
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
async function updateCategories(silent = false) {
  const db = await getDatabase();
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    if (categoryIdsToDelete.length > 0) {
        await connection.query(
            `DELETE FROM streams_categories WHERE id IN (?)`,
            [categoryIdsToDelete]
        );
    }
    let current = 0;
    for (const item of allItensToUpdate) {
        await connection.query(
            `UPDATE streams_series SET category_id = ? WHERE id = ?`,
            [item.category_ids, item.id]
        );

        current++;
        updateProgress(current, allItensToUpdate.length);
    }
    await connection.commit();
    if (!silent) {
      console.log(
        `✅ Categorias atualizadas!`
      );
    }
  } catch (err) {
    await connection.rollback();
    console.error("❌ Erro ao atualizar categorias:", err.message);
  } finally {
    connection.release?.(); 
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
        categories = JSON.parse(fs.readFileSync('./cat-series.json', 'utf-8'));
    }
    
    // Filtramos series que nao contenham nomes e que podem vir
    // com bug da tabela do cliente, afinal filmes sem nomes não existem rs
    streams = streams.filter((row) => {
        return row.title
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

    await organizeSeries(allResults, mappedCategories, false, silent);
    console.log(`🎉 Organização de filmes concluída!`);
}
