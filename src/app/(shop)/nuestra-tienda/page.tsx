import Link from "next/link";

const STORES = [
  { name: "Islas en malls", detail: "Encuentra nuestras islas de exhibición en los principales malls de Santiago." },
  { name: "Punto de retiro", detail: "Retira tu pedido online en nuestro punto de retiro coordinando por WhatsApp." },
];

export default function StoresPage() {
  return (
    <div className="page page--narrow info">
      <h1 className="page__title">Nuestras tiendas</h1>
      <div className="info__grid">
        {STORES.map((s) => (
          <div key={s.name} className="info__card">
            <h2 className="info__card-title">{s.name}</h2>
            <p className="info__card-text">{s.detail}</p>
          </div>
        ))}
      </div>
      <p className="info__crosslink">
        ¿Dudas si tu perfume es original? Consulta nuestra guía para{" "}
        <Link href="/detectar-falsos">detectar falsificaciones</Link>.
      </p>
    </div>
  );
}
