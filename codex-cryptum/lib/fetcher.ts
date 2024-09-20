export const fetcher = async (url: string, headers?: HeadersInit) => {
    const res = await fetch(url, { headers });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'An error occurred while fetching the data.');
    }
  
    return res.json();
  };