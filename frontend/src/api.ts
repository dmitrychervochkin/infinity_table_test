export const fetchItems = async (offset: number, limit: number, search: string = '') => {
    const query = new URLSearchParams({ offset: offset.toString(), limit: limit.toString(), search });
    const res = await fetch(`${process.env.PORT}/items?${query.toString()}`);
    return await res.json();
  };