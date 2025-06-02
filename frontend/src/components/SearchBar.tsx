import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { setSearchQuery, fetchInitialData, resetItems } from '../features/itemsSlice';
import { debounce } from '../utils';
const SearchBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState('');

  const handleSearch = debounce((text: string) => {
    dispatch(resetItems());
    dispatch(setSearchQuery(text));
    dispatch(fetchInitialData());
  }, 400);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    handleSearch(val);
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Поиск..."
        style={{ padding: '8px', width: '100%' }}
      />
    </div>
  );
};

export default SearchBar;