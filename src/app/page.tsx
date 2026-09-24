import { CatalogHome } from "@/components/catalog-home";
import { catalog as fallbackCatalog } from "@/data/catalog";
import { fetchDizipalCatalog } from "@/lib/dizipal";

export const revalidate = 300;

export default async function Home() {
  const items = await fetchDizipalCatalog().catch(() => fallbackCatalog);
  return <CatalogHome items={items.length ? items : fallbackCatalog} />;
}
