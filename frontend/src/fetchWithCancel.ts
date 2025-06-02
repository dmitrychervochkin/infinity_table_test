let currentAbort: AbortController | null = null;

export const fetchWithCancel = async (url: string) => {
  if (currentAbort) {
    currentAbort.abort();
  }

  currentAbort = new AbortController();

  const res = await fetch(url, { signal: currentAbort.signal });
  return await res.json();
};