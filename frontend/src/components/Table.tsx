import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import Row from './Row';
import {
  fetchInitialData,
  reorderItems,
  resetItems,
  setSelectedItems,
  toggleShowSelectedOnly,
} from '../features/itemsSlice';

const Table = () => {
  const { items, loading, hasMore, searchQuery, showSelectedOnly } = useSelector(
    (state: RootState) => state.items
  );
  const dispatch = useDispatch<AppDispatch>();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const displayedItems = showSelectedOnly
    ? items.filter(item => item.selected)
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
    if (showSelectedOnly) {
      const selectedIds = Object.entries(
        (window as any).selectionState || {}
      )
        .filter(([_, val]) => val)
        .map(([id]) => Number(id));
  
      if (selectedIds.length === 0) {
        dispatch(resetItems());
        return;
      }
  
      fetch('https://infinity-table-server.onrender.com/items/by-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
        .then(res => res.json())
        .then(data => {
          dispatch(resetItems());
          dispatch(setSelectedItems(data));
        });
    } else {
      dispatch(resetItems());
      dispatch(fetchInitialData());
    }
  }, [showSelectedOnly]);

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

    fetch(`https://infinity-table-server.onrender.com/sort`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newItems.map(i => i.id) }),
    });
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

      <div style={{ height: '700px', overflowY: 'auto' }}>
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