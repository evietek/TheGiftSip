import { useState, useEffect, useCallback } from 'react';

export function useAddressData() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/address-data?type=countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data.countries || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching countries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch states for a country
  const fetchStates = useCallback(async (countryCode) => {
    if (!countryCode) {
      setStates([]);
      setCities([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/address-data?type=states&countryCode=${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch states');
      const data = await response.json();
      setStates(data.states || []);
      setCities([]); // Clear cities when country changes
    } catch (err) {
      setError(err.message);
      console.error('Error fetching states:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cities for a country and state
  const fetchCities = useCallback(async (countryCode, stateCode) => {
    if (!countryCode) {
      setCities([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      let url = `/api/address-data?type=cities&countryCode=${countryCode}`;
      if (stateCode) {
        url = `/api/address-data?type=cities-by-state&countryCode=${countryCode}&stateCode=${stateCode}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      setCities(data.cities || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cities:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load countries on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return {
    countries,
    states,
    cities,
    isLoading,
    error,
    fetchStates,
    fetchCities,
    refetchCountries: fetchCountries
  };
}

