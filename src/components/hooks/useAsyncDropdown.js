import { useState, useRef, useCallback } from 'react';

const PAGE_SIZE = 4;

const useAsyncDropdown = ({ fetchUrl, searchUrl }) => {
  const [search,  setSearch]  = useState('');
  const [items,   setItems]   = useState([]);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shown,   setShown]   = useState(false);
  const debounceRef = useRef(null);

  const fetchPage = useCallback(async (pg, append = false) => {
    setLoading(true);
    try {
      const res  = await fetch(`${fetchUrl}&page=${pg}&limit=${PAGE_SIZE}`);
      const json = await res.json();
      if (!json.success) return;
      setItems(prev => append ? [...prev, ...json.results] : json.results);
      setHasMore(json.hasMore);
      setPage(pg);
      setShown(true);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl]);

  const handleSearch = useCallback(async (q) => {
    setSearch(q);
    clearTimeout(debounceRef.current);

    if (!q) {
      setItems([]);
      setHasMore(false);
      setShown(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${searchUrl}&search=${encodeURIComponent(q)}&limit=20`);
        const json = await res.json();
        if (!json.success) return;
        setItems(json.results);
        setHasMore(false);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [searchUrl]);

  const loadMore = useCallback(() => {
    fetchPage(shown ? page + 1 : 1, shown);
  }, [fetchPage, shown, page]);

  const reset = useCallback(() => {
    clearTimeout(debounceRef.current);
    setSearch('');
    setItems([]);
    setPage(1);
    setHasMore(false);
    setLoading(false);
    setShown(false);
  }, []);

  return {
    search, items, page, hasMore, loading, shown,
    handleSearch, fetchPage, loadMore, reset,
  };
};

export default useAsyncDropdown;