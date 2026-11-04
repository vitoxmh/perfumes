const TIPS = [
  {
    title: "Verifica el sello de seguridad",
    detail: "Cada caja original incluye un sello de garantía con códigos que debes confirmar antes de comprar.",
  },
  {
    title: "Revisa la calidad de impresión",
    detail: "Las cajas originales usan colores nítidos, tipografía definida y acabados superiores.",
  },
  {
    title: "Compara el lote y el espray",
    detail: "El número de lote de la caja debe coincidir con la base del frasco; el dispensador debe ser firme y uniforme.",
  },
  {
    title: "Desconfía de precios muy bajos",
    detail: "Si el precio es demasiado bueno para ser cierto, probablemente se trata de una imitación.",
  },
];

export default function DetectFakesPage() {
  return (
    <div className="page page--narrow info">
      <h1 className="page__title">Detectar falsificaciones</h1>
      <p className="page__lead">
        Consejos rápidos para comprar perfumes árabes originales con confianza.
      </p>
      <ol>
        {TIPS.map((tip, i) => (
          <li key={tip.title} className="info__tip">
            <span className="info__tip-number">{i + 1}</span>
            <div>
              <p className="info__tip-title">{tip.title}</p>
              <p className="info__tip-text">{tip.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
