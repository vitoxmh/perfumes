import { requireAdminUser } from "@/lib/auth";
import { logoutUser } from "@/lib/auth-actions";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Panel de administración",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser("/admin");

  return (
    <div className="admin">
      <header className="admin__head">
        <div className="admin__head-inner">
          <p className="admin__brand">PERFUMES<span className="admin__brand-accent">.CL</span> — Panel</p>
          <AdminNav />
          <form action={logoutUser}>
            <button type="submit" className="btn btn--outline btn--compact">
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="admin__body">{children}</div>
    </div>
  );
}
