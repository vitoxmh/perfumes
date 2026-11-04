export function TopBar() {
  const items = [
    "Despachos a todo Chile 📍",
    "Retiro en tienda disponible",
    "Paga con débito o crédito hasta 3 cuotas",
  ];

  // Repeticiones por mitad: cada mitad del track debe cubrir
  // el ancho del viewport para un loop sin huecos ni cortes.
  const REPEATS = 4;

  return (
    <div className="topbar">
      <div className="topbar__track">
        {[0, 1].map((half) =>
          Array.from({ length: REPEATS }, (_, rep) =>
            items.map((text, i) => (
              <span
                key={`${half}-${rep}-${i}`}
                className="topbar__item"
                aria-hidden={half === 1}
              >
                {text}
              </span>
            )),
          ),
        )}
      </div>
    </div>
  );
}
