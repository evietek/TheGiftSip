import { useState, useEffect, useCallback, useRef } from "react";

export function useShippingQuote(items, addressData) {
  const [shippingQuote, setShippingQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const isAddressComplete = useCallback(() => {
    return (
      addressData?.address &&
      addressData?.city &&
      addressData?.state &&
      addressData?.zipCode &&
      addressData?.country
    );
  }, [addressData]);

  const fetchShippingQuote = useCallback(
    async (signal) => {
      if (!Array.isArray(items) || items.length === 0 || !isAddressComplete()) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/printify/shipping-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // IMPORTANT: send Printify IDs if present (still include titles for fallback classification)
            items: items.map((it) => ({
              product_id: it.productId,       // used when you add live quoting later
              variant_id: it.variantId,
              quantity: it.quantity,
              title: it.title,
              variant_title: it.variantTitle || it.selectedSize || "",
            })),
            // Use flat fields; route also accepts nested address
            country: addressData.country,
            countryCode: addressData.countryCode, // lets the API use “GB” directly
            address: addressData.address,
            city: addressData.city,
            state: addressData.state,
            zip: addressData.zipCode,         // <-- send "zip" (route accepts zipCode too)
          }),
          signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch shipping quote");
        }

        const data = await response.json();
        setShippingQuote(data.shipping);
        setRetryCount(0);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Shipping quote error:", err);
        setError(err.message);
        setShippingQuote(null);
      } finally {
        setIsLoading(false);
      }
    },
    [items, addressData, isAddressComplete]
  );

  const debouncedFetchQuote = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    abortControllerRef.current = new AbortController();
    debounceTimeoutRef.current = setTimeout(() => {
      fetchShippingQuote(abortControllerRef.current.signal);
    }, 500);
  }, [fetchShippingQuote]);

  const retryQuote = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    fetchShippingQuote();
  }, [fetchShippingQuote]);

  useEffect(() => {
    if (isAddressComplete() && Array.isArray(items) && items.length > 0) {
      debouncedFetchQuote();
    } else {
      setShippingQuote(null);
      setError(null);
    }
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [debouncedFetchQuote, isAddressComplete, items]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    shippingQuote,
    isLoading,
    error,
    retryQuote,
    retryCount,
    isAddressComplete: isAddressComplete(),
  };
}
