export function cleanName(name) {
    if(!name || name == '') return '';
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

    // Remove tags legendadas
    name = name.trim().replace("(LEG)", "");

    // Remove tags legendadas
    name = name.trim().replace("[LEG]", "");

    // Remove tags legendadas
    name = name.trim().replace("[L]", "");

    // Remove tags cinema
    name = name.trim().replace("(CAM)", "");

    // Remove tags cinema
    name = name.trim().replace("[CAM]", "");

    // Remove espaços extras
    name = name.trim().replace(/\s+/g, " ");
    
    // Remove acentos e caracteres especiais
    name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    name = name.replace(/[^a-zA-Z0-9\s]/g, "");

    // Converte para minúsculas
    return name.toLowerCase();
}