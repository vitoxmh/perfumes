"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroBanner } from "@/lib/queries";

/** Slides por defecto mientras no existan banners en el panel. */
const DEFAULT_SLIDES: HeroBanner[] = [
  {
    title: "Amethyst Fusion",
    subtitle: "Nueva colección Badee Al Oud",
    cta: "Descúbrela",
    href: "/producto/lattafa-badee-al-oud-amethyts-fusion-edp-100-ml",
    imageUrl: null,
  },
  {
    title: "Primavera 2026",
    subtitle: "Fragancias frescas para mujer y hombre",
    cta: "Ver selección",
    href: "/categoria/de-primavera-mujer",
    imageUrl: null,
  },
  {
    title: "Khamrah Waha",
    subtitle: "Dulzura de café y especias árabes",
    cta: "Comprar",
    href: "/producto/lattafa-khamrah-waha-edp-100-ml",
    imageUrl: null,
  },
];

/** Cada imagen propia de un banner alterna un diseño de fondo temático. */
const MODIFIERS = ["hero__slide--amethyst", "hero__slide--spring", "hero__slide--khamrah"];

export function HeroCarousel({ slides }: { slides?: HeroBanner[] }) {
  const list = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % list.length), 5000);
    return () => clearInterval(timer);
  }, [list.length]);

  // Si cambian los banners (p. ej. tras guardar en el panel), reiniciamos al primero.
  useEffect(() => {
    setIndex(0);
  }, [list]);

  return (
    <section className="hero">
      <div className="hero__stage">
        {list.map((slide, i) => (
          <div
            key={`${i}-${slide.title}`}
            className={`hero__slide ${
              slide.imageUrl
                ? "hero__slide--image"
                : MODIFIERS[i % MODIFIERS.length]
            }`}
            style={
              slide.imageUrl
                ? { backgroundImage: `url("${slide.imageUrl}")` }
                : undefined
            }
            aria-hidden={i !== index}
          >
            {slide.subtitle ? <p className="hero__subtitle">{slide.subtitle}</p> : null}
            <h2 className="hero__title">{slide.title}</h2>
            <Link
              href={slide.href || "/categoria/perfumes-arabes"}
              tabIndex={i === index ? 0 : -1}
              className="hero__cta"
            >
              {slide.cta || "Ver más"}
            </Link>
          </div>
        ))}

        <div className="hero__dots">
          {list.map((s, i) => (
            <button
              key={`${s.title}-${i}`}
              onClick={() => setIndex(i)}
              aria-label={`Ir al slide ${i + 1}`}
              className={`hero__dot ${i === index ? "hero__dot--active" : ""}`}
            />
          ))}
        </div>

        <button
          onClick={() => setIndex((i) => (i - 1 + list.length) % list.length)}
          aria-label="Slide anterior"
          className="hero__arrow hero__arrow--prev"
        >
          ‹
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % list.length)}
          aria-label="Siguiente slide"
          className="hero__arrow hero__arrow--next"
        >
          ›
        </button>
      </div>
    </section>
  );
}
