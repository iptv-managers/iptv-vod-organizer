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
import dotenv from "dotenv";
import { cleanName } from "./utils/clean-name.js";
import { isSubtitled } from "./validations/is-subtitled.js";
import { isAdult } from "./validations/is-adult.js";
import { db } from "./utils/database.js";
import { getGenreIds } from "./validations/get-genre.js";
import { getYears } from "./validations/get-years.js";

dotenv.config();

const {
    TMDB_API_KEY, OUTPUT_FILE, TMDB_LANGUAGE,
} = process.env;

const CHUNK_SIZE = 500;
const CONCURRENCY_LIMIT = 30; // Limite de requisições concorrentes

// Aqui a gente salva as categorias existentes para consultar, caso 
// não encontre através dos códigos
let existingCategories = [];

export async function createTMDB() {
    const [rows] = await db.query(
        `SELECT id, category_id, stream_display_name, movie_properties, year, tmdb_id
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

    const limit = pLimit(CONCURRENCY_LIMIT);
    const allResults = [];

    async function fetchFromTMDB(stream) {
        try {
            let tmdbData;

            // 1 - Se já tem TMDB ID, busca direto
            if (stream.tmdb_id) {
                const { data } = await axios.get(
                    `https://api.themoviedb.org/3/movie/${stream.tmdb_id}`,
                    { params: { api_key: TMDB_API_KEY, language: TMDB_LANGUAGE } }
                );
                tmdbData = data;
            }

            // 2 - Se não encontrou pelo ID, busca por nome + ano
            if (!tmdbData) {
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

    // Processa em chunks
    for (let i = 0; i < (rows).length; i += CHUNK_SIZE) {
        const chunk = (rows).slice(i, i + CHUNK_SIZE);
        console.log(`Processando chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} filmes)`);

        const processedChunk = await Promise.all(
            chunk.map((stream) => limit(() => fetchFromTMDB(stream)))
        );

        allResults.push(...processedChunk);
        console.log(`✅ Chunk processado. Total acumulado: ${allResults.length}`);
    }

    // Salva todos os resultados em um único arquivo JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2), 'utf-8');
    console.log(`🎉 Todos os filmes processados! JSON final salvo em: ${OUTPUT_FILE}`);
    await organizeMovies();
    console.log(`🎉 Organização de filmes concluída!`);
    process.exit(1);
}

export async function organizeMovies() {
    if (!fs.existsSync(OUTPUT_FILE)) {
        console.log(`O arquivo não existe.`);
        fs.unlinkSync(OUTPUT_FILE);
    }

    const streams = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    const categories = JSON.parse(fs.readFileSync('./cat-movies.json', 'utf-8'));
    const newCategories = await createCategories(categories);

    for (const stream of streams) {
        const category_ids = [];
        if(isAdult(stream)){
            category_ids.push(newCategories.find(cat => cat.type === 'adult')?.id);
            await updateCategories(stream, category_ids);
            continue; // Se for adulto, não adiciona mais categorias
        }
        if(isSubtitled(stream)) {
            category_ids.push(newCategories.find(cat => cat.type === 'subtitled')?.id);
        }
        category_ids.push(...getGenreIds(stream, newCategories));
        category_ids.push(...getYears(stream, newCategories));

        // Se não preencher os requisitos, adiciona a categoria padrão
        if(category_ids.length === 0) {
            category_ids.push(newCategories.find(cat => cat.type === 'uncategorized')?.id);
        }
        await updateCategories(stream, category_ids);

    }
}

// Deleta todas as categorias de filmes e cria as novas
async function createCategories(allCategories) {
    await db.query(
        `DELETE FROM streams_categories WHERE category_type = 'movie'`
    );
    for (let i = 0; i < allCategories.length; i++) {
        const cat = allCategories[i];
        const [res] = await db.query(
            `INSERT INTO streams_categories (category_name, category_type, cat_order, is_adult)
            VALUES (?, 'movie', ?, ?)`,
            [cat.name, i, cat.is_adult || false]
        );
        console.log('inserted', res.insertId);
        cat.id = res.insertId;
        console.log(cat);
    }
    return allCategories;
}
async function updateCategories(stream, categories) {
    await db.query(
        `UPDATE streams SET category_id = ? WHERE id = ?`,
        [JSON.stringify(categories), stream.id]
    );
    console.log(`Categorias atualizadas para: ${stream.stream_display_name} => [${categories.join(', ')}]`);
}
createTMDB();