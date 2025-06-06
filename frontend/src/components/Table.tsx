import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import Row from './Row';
import {
  fetchInitialData,
  reorderItems,
  resetItems,
  toggleShowSelectedOnly,
} from '../features/itemsSlice';

const Table = () => {
  const { items, loading, hasMore, searchQuery, showSelectedOnly, selectedItems } = useSelector(
    (state: RootState) => state.items
  );
  const dispatch = useDispatch<AppDispatch>();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const displayedItems = showSelectedOnly
  ? selectedItems
  : items;

  useEffect(() => {
    dispatch(resetItems());
  }, [searchQuery, dispatch]);

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
  }, [loading, hasMore, dispatch]);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchInitialData());
    }
  }, [items.length, dispatch]);

  useEffect(() => {
    dispatch(resetItems());
    dispatch(fetchInitialData());
  }, [searchQuery, showSelectedOnly]);

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
  
    const draggedItem = displayedItems[draggedIndex];
    const targetItem = displayedItems[dropIndex];
  
    if (!draggedItem || !targetItem) return;
  
    const fullList = [...items];
    const fromIndex = fullList.findIndex(i => i.id === draggedItem.id);
    const toIndex = fullList.findIndex(i => i.id === targetItem.id);
  
    if (fromIndex === -1 || toIndex === -1) return;
  
    const updated = [...fullList];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
  
    dispatch(reorderItems(updated));
  
    fetch(`https://infinity-table-server.onrender.com/sort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: updated.map(i => i.id) }),
    });
  
    setDraggedIndex(null);
  };

  return (
    <>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '0 10px 5px 15px',
        }}
      >
        <input
          type="checkbox"
          checked={showSelectedOnly}
          onChange={() => dispatch(toggleShowSelectedOnly())}
        />
        {' '}Показывать только выбранные
      </label>

      <div data-column="exercises" style={{ height: '700px', overflowY: 'auto' }}>
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
        {loading && !showSelectedOnly && (
          <p style={{ textAlign: 'center', padding: '10px' }}>Загружаем...</p>
        )}
      </div>
    </>
  );
};

export default Table;