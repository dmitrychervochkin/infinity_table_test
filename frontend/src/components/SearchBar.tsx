import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { setSearchQuery } from '../features/itemsSlice';

const SearchBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setSearchQuery(value.trim()));
    }, 300);
  
    return () => clearTimeout(timeout);
  }, [value, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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