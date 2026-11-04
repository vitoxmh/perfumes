export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** 3 cuotas sin interés, igual a precio/3 redondeado a peso */
export function installment(price: number): number {
  return Math.round(price / 3);
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
