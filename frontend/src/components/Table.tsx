import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import Row from './Row';
import { fetchInitialData, reorderItems, toggleShowSelectedOnly } from '../features/itemsSlice';

const Table = () => {
    const { items, loading, hasMore, searchQuery, showSelectedOnly } = useSelector((state: RootState) => state.items);
  const dispatch = useDispatch<AppDispatch>();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const displayedItems = showSelectedOnly ? items.filter(item => item.selected) : items;

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
  
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        dispatch(fetchInitialData());
      }
    });
  
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  
  }, [loading, hasMore, dispatch, searchQuery]);

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, movedItem);

    setDraggedIndex(null);
    dispatch(reorderItems(newItems));

    fetch(`${import.meta.env.REACT_APP_API_URL}/sort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newItems.map(i => i.id) }),
    });
  };
  console.log(import.meta.env.REACT_APP_API_URL);
  return (
    <>
    <label style={{ display: 'flex',alignItems: 'center', gap: '10px', margin: '0 10px 5px 15px' }}>
      <input
        type="checkbox"
        checked={showSelectedOnly}
        onChange={() => dispatch(toggleShowSelectedOnly())}
      />
      {' '}Показывать только выбранные
    </label>

    <div style={{ height: '700px', overflowY: 'auto'}}>
      {displayedItems.map((item, index) => (
        <Row
          key={item.id}
          item={item}
          index={index}
          onDragStart={() => onDragStart(index)}
          onDragOver={onDragOver}
          onDrop={() => onDrop(index)}
        />
      ))}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && !showSelectedOnly && <p style={{ textAlign: 'center', padding: '10px' }}>Загружаем...</p>}
    </div>
  </>
  );
};

export default Table;