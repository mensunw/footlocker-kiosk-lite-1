'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ProductGrid.module.css';

interface Product {
  image: string;
  name: string;
  price: string;
}

interface ProductGridProps {
  dataPath: string;
  variant?: 'V1' | 'V2';
  columns?: number;
  rows?: number;
  animationType?: 'stagger' | 'wave' | 'fade';
  titleText?: string;
  className?: string;
}

export default function ProductGrid({
  dataPath,
  variant = 'V1',
  columns = 2,
  rows = 3,
  animationType = 'stagger',
  titleText = 'New Arrivals',
  className = ''
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(dataPath);
        const data = await response.json();
        setProducts(data.slice(0, columns * rows));
        setTimeout(() => setIsLoaded(true), 100);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, [dataPath, columns, rows]);

  const getAnimationDelay = (index: number) => {
    switch (animationType) {
      case 'stagger':
        return index * 0.2;
      case 'wave':
        const row = Math.floor(index / columns);
        const col = index % columns;
        return (row + col) * 0.15;
      default:
        return 0.1;
    }
  };

  return (
    <div className={`${styles.productGrid} ${styles[`variant${variant}`]} ${className}`}>
      {titleText && (
        <h2 className={styles.title}>{titleText}</h2>
      )}

      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {products.map((product, index) => (
          <div
            key={index}
            className={`${styles.productCard} ${isLoaded ? styles.visible : ''}`}
            style={{
              animationDelay: `${getAnimationDelay(index)}s`
            }}
          >
            <div className={styles.imageContainer}>
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className={styles.productImage}
              />
            </div>

            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>{product.price}</p>
            </div>

            <div className={styles.overlay}>
              <span className={styles.shopNow}>SHOP NOW</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}