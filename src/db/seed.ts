import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { brands, products } from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "Falta DATABASE_URL. Créala en https://neon.tech, guárdala en .env.local y vuelve a ejecutar: npm run db:seed"
  );
  process.exit(1);
}

const db = drizzle(neon(url), {});

const BRANDS = [
  { slug: "lattafa", name: "Lattafa" },
  { slug: "lattafa-pride", name: "Lattafa Pride" },
  { slug: "lattafa-rave", name: "Lattafa Rave" },
  { slug: "lattafa-asdaaf", name: "Lattafa Asdaaf" },
  { slug: "niche-emarati", name: "Niche Emarati" },
] as const;

/** slug, name, brand, gender, kind, sizeMl, price, compareAt, tags */
type SeedRow = [
  string, string, string, string, string, number | null, number, number | null, string[],
];

const PRODUCTS: SeedRow[] = [
  ["lattafa-yara-edp-100-ml", "Lattafa Yara EDP 100 ML", "lattafa", "mujer", "perfume", 100, 22900, 26900, []],
  ["lattafa-yara-candy-edp-100-ml", "Lattafa Yara Candy EDP 100 ML", "lattafa", "mujer", "perfume", 100, 21900, null, []],
  ["lattafa-yara-elixir-edp-100-ml", "Lattafa Yara Elixir EDP 100 ML", "lattafa", "mujer", "perfume", 100, 26900, null, []],
  ["lattafa-yara-tous-edp-100-ml", "Lattafa Yara Tous EDP 100 ML", "lattafa", "mujer", "perfume", 100, 25900, null, []],
  ["lattafa-yara-desodorante-corporal-200-ml", "Lattafa Yara Desodorante Corporal 200 ML", "lattafa", "mujer", "deodorant-corporal", 200, 3490, null, []],
  ["lattafa-asad-edp-100-ml", "Lattafa Asad EDP 100 ML", "lattafa", "hombre", "perfume", 100, 22900, null, []],
  ["lattafa-asad-elixir-edp-100-ml", "Lattafa Asad Elixir EDP 100 ML", "lattafa", "hombre", "perfume", 100, 27900, null, []],
  ["lattafa-asad-bourbon-edp-100-ml", "Lattafa Asad Bourbon EDP 100 ML", "lattafa", "hombre", "perfume", 100, 27900, null, []],
  ["lattafa-asad-desodorante-corporal-200-ml", "Lattafa Asad Desodorante Corporal 200 ML", "lattafa", "hombre", "deodorant-corporal", 200, 3490, null, []],
  ["lattafa-mayar-edp-100-ml", "Lattafa Mayar EDP 100 ML", "lattafa", "mujer", "perfume", 100, 26900, null, []],
  ["lattafa-mayar-cherry-intense-edp-100-ml", "Lattafa Mayar Cherry Intense EDP 100 ML", "lattafa", "mujer", "perfume", 100, 34900, null, []],
  ["lattafa-mayar-natural-intense-edp-100-ml", "Lattafa Mayar Natural Intense EDP 100 ML", "lattafa", "mujer", "perfume", 100, 33900, null, []],
  ["lattafa-eclaire-edp-100-ml", "Lattafa Eclaire EDP 100 ML", "lattafa", "mujer", "perfume", 100, 28900, null, []],
  ["lattafa-khamrah-qahwa-edp-100-ml", "Lattafa Khamrah Qahwa EDP 100 ML", "lattafa", "unisex", "perfume", 100, 34900, null, []],
  ["lattafa-khamrah-waha-edp-100-ml", "Lattafa Khamrah Qahwa Waha EDP 100 ML", "lattafa", "unisex", "perfume", 100, 32900, null, []],
  ["lattafa-opulent-dubai-edp-100-ml", "Lattafa Opulent Dubai EDP 100 ML", "lattafa", "unisex", "perfume", 100, 18900, null, []],
  ["lattafa-najdia-intense-edp-100-ml", "Lattafa Najdia Intense EDP 100 ML", "lattafa", "hombre", "perfume", 100, 29900, null, []],
  ["lattafa-qaed-al-fursan-edp-90-ml", "Lattafa Qaed Al Fursan EDP 90 ML", "lattafa", "hombre", "perfume", 90, 26900, null, []],
  ["lattafa-angham-edp-100-ml", "Lattafa Angham EDP 100 ML", "lattafa", "mujer", "perfume", 100, 28900, null, []],
  ["lattafa-haya-edp-100-ml", "Lattafa Haya EDP 100 ML", "lattafa", "mujer", "perfume", 100, 27900, null, []],
  ["lattafa-sehr-edp-100-ml", "Lattafa Sehr EDP 100 ML", "lattafa", "mujer", "perfume", 100, 26900, null, []],
  ["lattafa-layaan-edp-100-ml", "Lattafa Layaan EDP 100 ML", "lattafa", "mujer", "perfume", 100, 25900, null, []],
  ["lattafa-fakhar-women-edp-100-ml", "Lattafa Fakhar Women EDP 100 ML", "lattafa", "mujer", "perfume", 100, 24900, null, []],
  ["lattafa-fahad-edp-80-ml", "Lattafa Fahad EDP 80 ML", "lattafa", "hombre", "perfume", 80, 31900, null, []],
  ["lattafa-jouri-edp-100-ml", "Lattafa Jouri Rose EDP 100 ML", "lattafa", "mujer", "perfume", 100, 31900, null, []],
  ["lattafa-the-kingdom-edp-set-3-pcs", "Lattafa The Kingdom EDP Set 3 Pcs", "lattafa", "set", "perfume", null, 31900, null, ["set"]],
  ["lattafa-teriaq-edp-set-3-pcs", "Lattafa Teriaq EDP Set 3 Pcs", "lattafa", "set", "perfume", null, 34900, null, ["set"]],
  ["lattafa-ana-abiyedh-passion-edp-60-ml", "Lattafa Ana Abiyedh Passion EDP 60 ML", "lattafa", "unisex", "perfume", 60, 19900, null, []],
  ["lattafa-ana-abiyedh-edp-60-ml", "Lattafa Ana Abiyedh EDP 60 ML", "lattafa", "unisex", "perfume", 60, 18900, null, []],
  ["lattafa-badee-al-oud-amethyts-fusion-edp-100-ml", "Lattafa Badee Al Oud Amethyst Fusion EDP 100 ML", "lattafa", "unisex", "perfume", 100, 32900, null, []],
  ["lattafa-eternal-vanille-edp-100-ml", "Lattafa Eternal Vanille EDP 100 ML", "lattafa", "mujer", "perfume", 100, 34900, null, []],
  ["lattafa-queen-of-roses-edp-100-ml", "Lattafa Queen Of Roses EDP 100 ML", "lattafa", "mujer", "perfume", 100, 38900, null, []],
  ["lattafa-pride-love-in-paris-edp-100-ml", "Lattafa Pride Love In Paris EDP 100 ML", "lattafa-pride", "mujer", "perfume", 100, 25900, null, []],
  ["lattafa-pride-new-york-the-city-of-dreams-edp-100-ml", "Lattafa Pride New York The City Of Dreams EDP 100 ML", "lattafa-pride", "unisex", "perfume", 100, 25900, null, []],
  ["lattafa-pride-london-the-city-of-contrast-edp-100-ml", "Lattafa Pride London The City Of Contrast EDP 100 ML", "lattafa-pride", "hombre", "perfume", 100, 25900, null, []],
  ["lattafa-rave-now-women-edp-100-ml", "Lattafa Rave Now Women EDP 100 ML", "lattafa-rave", "mujer", "perfume", 100, 19900, null, []],
  ["lattafa-rave-now-men-edp-100-ml", "Lattafa Rave Now Men EDP 100 ML", "lattafa-rave", "hombre", "perfume", 100, 19900, null, []],
  ["lattafa-perfume-mist-yara-250-ml", "Lattafa Perfume Mist Yara 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-yara-tous-250-ml", "Lattafa Perfume Mist Yara Tous 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-teriaq-250-ml", "Lattafa Perfume Mist Teriaq 250 ML", "lattafa", "unisex", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-layaan-250-ml", "Lattafa Perfume Mist Layaan 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-sehr-250-ml", "Lattafa Perfume Mist Sehr 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-eclaire-250-ml", "Lattafa Perfume Mist Eclaire 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-angham-250-ml", "Lattafa Perfume Mist Angham 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-haya-250-ml", "Lattafa Perfume Mist Haya 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-perfume-mist-fakhar-women-250-ml", "Lattafa Perfume Mist Fakhar Women 250 ML", "lattafa", "mujer", "body-mist", 250, 6900, null, []],
  ["lattafa-asdaaf-atlantis-coral-edp-100-ml", "Lattafa Asdaaf Atlantis Coral EDP 100 ML", "lattafa-asdaaf", "mujer", "perfume", 100, 13900, null, []],
  ["lattafa-asdaaf-silver-musk-edp-100-ml", "Lattafa Asdaaf Silver Musk EDP 100 ML", "lattafa-asdaaf", "unisex", "perfume", 100, 16900, null, []],
  ["lattafa-asdaaf-golden-women-edp-100-ml", "Lattafa Asdaaf Gold Women EDP 100 ML", "lattafa-asdaaf", "mujer", "perfume", 100, 17900, null, []],
  ["lattafa-asdaaf-deodorant-ambiental-300-ml", "Lattafa Asdaaf Deodorante Ambiental 300 ML", "lattafa-asdaaf", "unisex", "deodorant-ambiental", 300, 8900, null, []],
  ["niche-emarati-the-royal-edp-100-ml", "Niche Emarati The Royal EDP 100 ML", "niche-emarati", "hombre", "perfume", 100, 36900, null, []],
  ["niche-emarati-rose-avenue-edp-100-ml", "Niche Emarati Rose Avenue EDP 100 ML", "niche-emarati", "mujer", "perfume", 100, 36900, null, []],
  ["niche-emarati-oud-legacy-edp-100-ml", "Niche Emarati Oud Legacy EDP 100 ML", "niche-emarati", "unisex", "perfume", 100, 39900, null, []],
];

const DESCRIPTIONS: Record<string, string> = {
  perfume:
    "Eau de Parfum de larga duración, con auténtica esencia árabe. Perfecto para un uso diario elegante o para ocasiones especiales.",
  "body-mist":
    "Bruma perfumada ligera y refrescante, ideal para reaplicar durante el día y mantener tu fragancia favorita todo el tiempo.",
  "deodorant-corporal":
    "Desodorante corporal con la fragancia de tu línea favorita, frescura y protección durante todo el día.",
  "deodorant-ambiental":
    "Ambientador en aerosol con esencia árabe, perfuma y transforma cada espacio de tu hogar con duración prolongada.",
};

const NOTES: Record<string, string[]> = {
  "lattafa-yara-edp-100-ml": ["Caramelo", "Vainilla", "Jazmín", "Aprikose"],
  "lattafa-yara-candy-edp-100-ml": ["Nubes de azúcar", "MnM", "Caramelo", "Leche"],
  "lattafa-yara-elixir-edp-100-ml": ["Vainilla", "Oud", "Musk", "Ylang"],
  "lattafa-asad-edp-100-ml": ["Café", "Tabaco", "Únicos especiados", "Ámbar"],
  "lattafa-khamrah-qahwa-edp-100-ml": ["Canela", "Nuez", "Café", "Caramelo"],
  "lattafa-mayar-edp-100-ml": ["Piña", "Frutal", "Cítrico dulce"],
  "lattafa-eclaire-edp-100-ml": ["Leche de almendras", "Vainilla", "Dulce"],
  "lattafa-fahad-edp-80-ml": ["Cítricos", "Especias", "Madera", "Almizcle"],
};

// Clasificación por temporada (misma lógica aproximada que la tienda original:
// fragancias frescas -> primavera, cálidas/dulces de mayor densidad -> invierno)
const SPRING_WOMEN = new Set([
  "lattafa-yara-edp-100-ml",
  "lattafa-layaan-edp-100-ml",
  "lattafa-mayar-edp-100-ml",
  "lattafa-haya-edp-100-ml",
  "lattafa-rave-now-women-edp-100-ml",
  "lattafa-asdaaf-atlantis-coral-edp-100-ml",
  "lattafa-perfume-mist-yara-250-ml",
]);
const SPRING_MEN = new Set([
  "lattafa-najdia-intense-edp-100-ml",
  "lattafa-rave-now-men-edp-100-ml",
  "lattafa-qaed-al-fursan-edp-90-ml",
  "lattafa-pride-london-the-city-of-contrast-edp-100-ml",
]);
const WINTER = new Set([
  "lattafa-khamrah-qahwa-edp-100-ml",
  "lattafa-khamrah-waha-edp-100-ml",
  "lattafa-asad-edp-100-ml",
  "lattafa-asad-elixir-edp-100-ml",
  "lattafa-asad-bourbon-edp-100-ml",
  "lattafa-najdia-intense-edp-100-ml",
  "lattafa-qaed-al-fursan-edp-90-ml",
  "lattafa-eternal-vanille-edp-100-ml",
  "niche-emarati-oud-legacy-edp-100-ml",
  "lattafa-badee-al-oud-amethyts-fusion-edp-100-ml",
]);

const NEW_SLUGS = new Set([
  "lattafa-asdaaf-atlantis-coral-edp-100-ml",
  "lattafa-badee-al-oud-amethyts-fusion-edp-100-ml",
  "lattafa-eternal-vanille-edp-100-ml",
  "lattafa-queen-of-roses-edp-100-ml",
  "lattafa-pride-love-in-paris-edp-100-ml",
  "lattafa-pride-new-york-the-city-of-dreams-edp-100-ml",
  "lattafa-pride-london-the-city-of-contrast-edp-100-ml",
  "lattafa-jouri-edp-100-ml",
  "lattafa-ana-abiyedh-passion-edp-60-ml",
  "lattafa-the-kingdom-edp-set-3-pcs",
  "lattafa-teriaq-edp-set-3-pcs",
  "lattafa-fahad-edp-80-ml",
]);

const WANTED_SLUGS = new Set([
  "lattafa-ana-abiyedh-passion-edp-60-ml",
  "lattafa-fahad-edp-80-ml",
  "lattafa-jouri-edp-100-ml",
  "lattafa-khamrah-qahwa-edp-100-ml",
  "lattafa-mayar-cherry-intense-edp-100-ml",
  "lattafa-najdia-intense-edp-100-ml",
  "lattafa-opulent-dubai-edp-100-ml",
  "lattafa-qaed-al-fursan-edp-90-ml",
]);

const POPULAR_SLUGS = new Set([
  "lattafa-yara-edp-100-ml",
  "lattafa-yara-desodorante-corporal-200-ml",
  "lattafa-asad-bourbon-edp-100-ml",
  "lattafa-mayar-edp-100-ml",
  "lattafa-eclaire-edp-100-ml",
  "lattafa-rave-now-women-edp-100-ml",
  "lattafa-asad-edp-100-ml",
  "lattafa-asad-elixir-edp-100-ml",
  "lattafa-yara-elixir-edp-100-ml",
  "lattafa-yara-candy-edp-100-ml",
  "lattafa-opulent-dubai-edp-100-ml",
  "lattafa-asad-desodorante-corporal-200-ml",
]);

const RATINGS: Record<string, [string, number]> = {
  "lattafa-yara-edp-100-ml": ["4.50", 12],
  "lattafa-mayar-edp-100-ml": ["5.00", 9],
  "lattafa-asad-edp-100-ml": ["5.00", 15],
  "lattafa-yara-candy-edp-100-ml": ["5.00", 8],
  "lattafa-perfume-mist-eclaire-250-ml": ["5.00", 5],
};

async function main() {
  const brandRows = await db
    .insert(brands)
    .values(BRANDS.map((b) => ({ slug: b.slug, name: b.name })))
    .returning();
  const brandIdBySlug = new Map(brandRows.map((b) => [b.slug, b.id]));

  const rows = PRODUCTS.map(
    ([slug, name, brandSlug, gender, kind, sizeMl, price, compareAt, setTags]) => {
      const tags = [...setTags];
      if (SPRING_WOMEN.has(slug)) tags.push("de-primavera-mujer");
      if (SPRING_MEN.has(slug)) tags.push("de-primavera-hombre");
      if (WINTER.has(slug)) tags.push("de-invierno");
      const rating = RATINGS[slug]?.[0];
      return {
        slug,
        name,
        brandId: brandIdBySlug.get(brandSlug)!,
        gender,
        kind,
        sizeMl,
        price,
        compareAtPrice: compareAt,
        description: `${name}. ${DESCRIPTIONS[kind]}`,
        notes: NOTES[slug] ?? null,
        tags,
        imageUrl: null,
        rating: rating ?? null,
        ratingCount: RATINGS[slug]?.[1] ?? 0,
        isNew: NEW_SLUGS.has(slug),
        isWanted: WANTED_SLUGS.has(slug),
        isPopular: POPULAR_SLUGS.has(slug),
        stock: 20,
        createdAt: new Date(),
      };
    }
  );

  // Réplica del orden de la página principal: lo más nuevo aparece con menor created_at
  rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  await db.insert(products).values(rows);
  console.log(`Seed OK: ${brandRows.length} marcas y ${rows.length} productos.`);
}

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    if (String(err).includes('relation "brands" does not exist')) {
      console.error("Faltan tablas. Ejecuta primero: npm run db:push");
    }
    console.error(err);
    process.exit(1);
  });
