import { useEffect } from 'react';
import Table from './components/Table';
import SearchBar from './components/SearchBar';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { fetchInitialData } from './features/itemsSlice';
import './App.css';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  return (
    <div>
      <h1>Infinity Table Test</h1>
      <SearchBar />
      <Table />
    </div>
  );
};

export default App;