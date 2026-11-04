import { TopBar } from "@/components/top-bar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { allBrands } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [brands, user] = await Promise.all([allBrands(), getSessionUser()]);

  return (
    <>
      <TopBar />
      <Header brands={brands} user={user} />
      <main className="app-main">{children}</main>
      <Footer />
    </>
  );
}
