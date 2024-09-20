export const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        return res.json().then((error) => Promise.reject(error));
      }
      return res.json();
    })
    .catch((error) => {
      console.error('Fetcher error:', error);
      throw error;
    });