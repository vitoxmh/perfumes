"use client";

export function DeleteButton({
  action,
  id,
  name,
}: {
  /** Server action que elimina (se ejecuta con el FormData del formulario padre). */
  action: (formData: FormData) => Promise<void>;
  id: number;
  name: string;
}) {
  return (
    <button
      type="submit"
      formAction={action}
      className="adminform__delete"
      onClick={(e) => {
        if (!window.confirm(`¿Eliminar “${name}”? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      Eliminar
    </button>
  );
}
