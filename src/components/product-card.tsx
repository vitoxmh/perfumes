"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product, Brand } from "@/db/schema";
import { formatCLP } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { ProductPlaceholder } from "./product-placeholder";

export type ProductView = {
  product: Product;
  brand: Brand;
};

export function ProductImage({ item }: { item: ProductView }) {
  if (item.product.imageUrl) {
    return (
      <img
        src={item.product.imageUrl}
        alt={item.product.name}
        className="product-card__img"
        loading="lazy"
      />
    );
  }
  return (
    <ProductPlaceholder
      slug={item.product.slug}
      name={item.product.name}
      className="placeholder--fill"
    />
  );
}

export function ProductCard({ item }: { item: ProductView }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const { product, brand } = item;

  const addToCart = () => {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: brand.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="product-card">
      <span className="product-card__flag product-card__flag--new">Nuevo</span>
      {product.compareAtPrice ? (
        <span className="product-card__flag product-card__flag--sale">
          {`-${Math.round((1 - product.price / product.compareAtPrice) * 100)}%`}
        </span>
      ) : null}

      <Link href={`/producto/${product.slug}`} className="product-card__media">
        <div className="product-card__media-frame">
          <ProductImage item={item} />
        </div>
      </Link>

      <div className="product-card__info">
        <p className="product-card__installments">
          <strong>{formatCLP(product.price / 3)}</strong> 3 cuotas sin interés
        </p>
        <Link href={`/producto/${product.slug}`} className="product-card__name">
          {product.name}
        </Link>
        {product.rating ? (
          <p className="product-card__rating">
            {"★".repeat(Math.round(Number(product.rating)))}
            <span className="product-card__rating-count">({product.ratingCount})</span>
          </p>
        ) : null}
        <div className="product-card__row">
          <p className="product-card__price">{formatCLP(product.price)}</p>
          <button
            onClick={addToCart}
            aria-label={`Añadir ${product.name} al carrito`}
            className={`product-card__add ${added ? "product-card__add--added" : ""}`}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </article>
  );
}
