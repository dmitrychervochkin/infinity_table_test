export const fetchItems = async (offset: number, limit: number, search: string = '') => {
    const query = new URLSearchParams({ offset: offset.toString(), limit: limit.toString(), search });
    const res = await fetch(`https://infinity-table-server.onrender.com/items?${query.toString()}`);
    return await res.json();
  };