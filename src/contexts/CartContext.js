"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

// ---------- helpers ----------
const STORAGE_KEY = "cart:v2"; // bump if you change shape

function normalizeColorValue(input) {
  if (input == null) return null;
  if (typeof input === "object" && (input.name || input.hex || input.class)) return input;
  if (typeof input === "string" || typeof input === "number") return { name: String(input) };
  return null;
}

function makeCartId({ productId, variantId, colorName, size }) {
  return `${productId}-${variantId || "noVar"}-${colorName || "noColor"}-${size || "noSize"}-${Date.now()}`;
}

function getOption(product, type) {
  if (!Array.isArray(product?.options)) return null;
  const t = type.toLowerCase();
  return (
    product.options.find(
      (o) => o?.type === t || o?.name?.toLowerCase().includes(t)
    ) || null
  );
}

// Find a variant that matches selected color/size; fallback to first enabled
function selectVariant(product, selectedColorTitle, selectedSizeTitle) {
  if (!Array.isArray(product?.variants)) return { variantId: null, sku: null, options: [] };

  const colorOpt = getOption(product, "color");
  const sizeOpt = getOption(product, "size");

  const chosen =
    product.variants.find((v) => {
      if (!v.is_enabled) return false;
      if (!Array.isArray(v.options)) return true;

      const hasColorMatch =
        !selectedColorTitle ||
        !colorOpt ||
        v.options.some((optId) =>
          colorOpt.values?.some((cv) => cv.id === optId && cv.title === selectedColorTitle)
        );

      const hasSizeMatch =
        !selectedSizeTitle ||
        !sizeOpt ||
        v.options.some((optId) =>
          sizeOpt.values?.some((sv) => sv.id === optId && sv.title === selectedSizeTitle)
        );

      return hasColorMatch && hasSizeMatch;
    }) || product.variants.find((v) => v.is_enabled);

  return chosen
    ? { variantId: chosen.id, sku: chosen.sku, options: chosen.options || [] }
    : { variantId: null, sku: null, options: [] };
}

// ---------- reducer ----------
const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CART":
      return { ...state, items: action.payload || [] };

    case "ADD_TO_CART": {
      const p = action.payload;
      const items = [...state.items];
      const idx = items.findIndex(
        (it) =>
          it.productId === p.productId &&
          it.variantId === p.variantId &&
          (it.selectedColor?.name || null) === (p.selectedColor?.name || null) &&
          (it.selectedSize || null) === (p.selectedSize || null)
      );

      if (idx >= 0) {
        items[idx] = { ...items[idx], quantity: items[idx].quantity + p.quantity };
        return { ...state, items };
      }

      return { ...state, items: [...state.items, p] };
    }

    case "REMOVE_FROM_CART":
      return { ...state, items: state.items.filter((it) => it.cartId !== action.payload) };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((it) =>
          it.cartId === action.payload.cartId
            ? { ...it, quantity: Math.max(1, Number(action.payload.quantity) || 1) }
            : it
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
};

// ---------- provider ----------
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // load on mount (migrate old shape if needed)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = Array.isArray(parsed)
          ? parsed.map((it) => {
              const { price, ...rest } = it || {};
              return { ...rest, quantity: Math.max(1, Number(rest.quantity) || 1) };
            })
          : [];
        dispatch({ type: "LOAD_CART", payload: sanitized });
      } else {
        const legacy = localStorage.getItem("cart");
        if (legacy) {
          const parsed = JSON.parse(legacy);
          const migrated = Array.isArray(parsed)
            ? parsed.map((it) => {
                const { price, id, ...rest } = it || {};
                return {
                  ...rest,
                  productId: rest.printifyProductId || id,
                  quantity: Math.max(1, Number(rest.quantity) || 1),
                };
              })
            : [];
          dispatch({ type: "LOAD_CART", payload: migrated });
          localStorage.removeItem("cart");
        }
      }
    } catch (e) {}
  }, []);

  // save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (e) {}
  }, [state.items]);

  // ---------- API ----------
  const addToCart = (product, selectedColorInput, selectedSizeInput, quantity = 1) => {
    const colorNormalized =
      selectedColorInput && typeof selectedColorInput === "object"
        ? selectedColorInput
        : selectedColorInput
        ? { name: String(selectedColorInput) }
        : null;

    let desiredColorTitle = colorNormalized?.name || null;
    let desiredSizeTitle = selectedSizeInput != null ? String(selectedSizeInput) : null;

    const colorOpt = getOption(product, "color");
    const sizeOpt = getOption(product, "size");

    const maybeNumColor = Number(desiredColorTitle);
    if (colorOpt && Number.isFinite(maybeNumColor)) {
      const cv = colorOpt.values?.find((v) => v.id === maybeNumColor);
      if (cv) desiredColorTitle = cv.title;
    }
    const maybeNumSize = Number(desiredSizeTitle);
    if (sizeOpt && Number.isFinite(maybeNumSize)) {
      const sv = sizeOpt.values?.find((v) => v.id === maybeNumSize);
      if (sv) desiredSizeTitle = sv.title;
    }

    if (Number.isFinite(Number(selectedSizeInput)) && sizeOpt) {
      const variantById = product.variants?.find((v) => v.id === Number(selectedSizeInput));
      if (variantById?.options?.length) {
        const sv = sizeOpt.values?.find((v) => variantById.options.includes(v.id));
        if (sv) desiredSizeTitle = sv.title;
      }
    }

    const { variantId, sku, options: variantOptionIds } =
      selectVariant(product, desiredColorTitle, desiredSizeTitle);

    if (!variantId) {
      console.warn("No enabled variant available for this selection.");
      return;
    }

    if (sizeOpt) {
      const isValidSizeTitle = sizeOpt.values?.some((v) => v.title === desiredSizeTitle);
      if (!isValidSizeTitle) {
        const sv = sizeOpt.values?.find(
          (v) => Array.isArray(variantOptionIds) && variantOptionIds.includes(v.id)
        );
        if (sv) desiredSizeTitle = sv.title;
      }
    }
    if (colorOpt) {
      const isValidColorTitle = colorOpt.values?.some((v) => v.title === desiredColorTitle);
      if (!isValidColorTitle) {
        const cv = colorOpt.values?.find(
          (v) => Array.isArray(variantOptionIds) && variantOptionIds.includes(v.id)
        );
        if (cv) desiredColorTitle = cv.title;
      }
    }

    if (sizeOpt && !desiredSizeTitle) {
      const firstEnabled = product.variants?.find((v) => v.is_enabled);
      if (firstEnabled?.options?.length) {
        const sv = sizeOpt.values?.find((v) => firstEnabled.options.includes(v.id));
        if (sv) desiredSizeTitle = sv.title;
      }
    }

    const selectedColor = desiredColorTitle
      ? (() => {
          const cv = colorOpt?.values?.find((v) => v.title === desiredColorTitle);
          return { name: desiredColorTitle, hex: cv?.colors?.[0] || null, class: null };
        })()
      : null;

    const imageUrl =
      typeof product.images?.[0] === "string"
        ? product.images[0]
        : product.images?.[0]?.src || "/placeholder-product.jpg";

    const variantTitle = desiredSizeTitle || null;

    const payload = {
      cartId: makeCartId({
        productId: product.id,
        variantId,
        colorName: desiredColorTitle || null,
        size: desiredSizeTitle || null,
      }),
      productId: String(product.id), // ensure string for API
      variantId: Number(variantId),  // ensure number for API
      sku,
      quantity: Math.max(1, Number(quantity) || 1),

      // display-only fields
      title: product.title || product.name || "Product",
      variantTitle,
      image: imageUrl,
      category: product.category || "Product",
      selectedColor,
      selectedSize: desiredSizeTitle,
    };

    dispatch({ type: "ADD_TO_CART", payload });
  };

  const removeFromCart = (cartId) =>
    dispatch({ type: "REMOVE_FROM_CART", payload: cartId });

  const updateQuantity = (cartId, quantity) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { cartId, quantity } });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const getTotalItems = () =>
    state.items.reduce((n, it) => n + (Number(it.quantity) || 0), 0);

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ---------- hook ----------
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
