export function cleanName(name) {
    if(!name || name == '') return '';
    // Remove acentos e caracteres especiais
    name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    name = name.replace(/[^a-zA-Z0-9\s]/g, "");

    // Remove tags legendadas
    name = name.toLowerCase().trim().replace("[l]", "");

    // Remove tags legendadas
    name = name.toLowerCase().trim().replace("[leg]", "");

    // Remove tags legendadas
    name = name.toLowerCase().trim().replace("(leg)", "");

    // Remove tags 4K
    name = name.toLowerCase().trim().replace("[4k]", "");

    // Remove tags 4K
    name = name.toLowerCase().trim().replace("(4k)", "");

    // Remove tags 4K
    name = name.toLowerCase().trim().replace(" 4k", "");

    // Remove tags hdr
    name = name.toLowerCase().trim().replace("[hdr]", "");

    // Remove tags 4K
    name = name.toLowerCase().trim().replace("[hybrid]", "");

    // Remove tags legendadas
    name = name.trim().replace("(LENGENDADO)", "");

    // Remove espaços extras
    name = name.trim().replace(/\s+/g, " ");

    // Converte para minúsculas
    return name.toLowerCase();
}