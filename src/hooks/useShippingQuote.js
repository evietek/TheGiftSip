import { useState, useEffect, useCallback, useRef } from 'react';

export function useShippingQuote(items, addressData) {
  const [shippingQuote, setShippingQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Check if address is complete enough for shipping calculation
  const isAddressComplete = useCallback(() => {
    return addressData?.address && 
           addressData?.city && 
           addressData?.state && 
           addressData?.zipCode && 
           addressData?.country;
  }, [addressData]);

  // Fetch shipping quote from API
  const fetchShippingQuote = useCallback(async (signal) => {
    if (!items || items.length === 0 || !isAddressComplete()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/printify/shipping-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            title: item.title,
            quantity: item.quantity,
            weight: item.weight || 0.5 // Default weight if not specified
          })),
          country: addressData.country,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shipping quote');
      }

      const data = await response.json();
      setShippingQuote(data.shipping);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }
      
      console.error('Shipping quote error:', err);
      setError(err.message);
      setShippingQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [items, addressData, isAddressComplete]);

  // Debounced version of fetchShippingQuote
  const debouncedFetchQuote = useCallback(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fetchShippingQuote(abortControllerRef.current.signal);
    }, 500); // 500ms debounce
  }, [fetchShippingQuote]);

  // Retry function
  const retryQuote = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchShippingQuote();
  }, [fetchShippingQuote]);

  // Effect to trigger quote fetch when dependencies change
  useEffect(() => {
    if (isAddressComplete() && items && items.length > 0) {
      debouncedFetchQuote();
    } else {
      // Clear quote if address is incomplete
      setShippingQuote(null);
      setError(null);
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetchQuote, isAddressComplete, items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    shippingQuote,
    isLoading,
    error,
    retryQuote,
    retryCount,
    isAddressComplete: isAddressComplete()
  };
}

