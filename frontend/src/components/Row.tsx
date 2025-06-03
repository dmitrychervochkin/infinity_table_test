import { useDispatch } from "react-redux";
import { selectItem } from "../features/itemsSlice";
import type { Item } from "../types";

interface RowProps {
  item: Item;
  index: number;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onTouchDrop: () => void;
}
  
  const Row: React.FC<RowProps> = ({ item, index, onDragStart, onDragOver, onDrop, onTouchDrop }) => {
    const dispatch = useDispatch();
  
    const handleSelect = () => {
      dispatch(selectItem(item.id));
      fetch(`https://infinity-table-server.onrender.com/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
    };

    const handleTouchStart = () => {
      onDragStart(); 
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();
    };
    
    const handleTouchEnd = () => {
      onTouchDrop(); 
    };
  
    return (
      <div
        draggable="true"
        data-index={index}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'none',
          margin: '7px 5px',
          padding: '10px',
          background: item.selected ? '#d1d0f4' : 'white',
          outline: item.selected ? '2px solid blue' : 'none',
          borderRadius: '5px',
          borderBottom: '1px solid #eee',
          cursor: 'grab',
        }}
        onClick={handleSelect}
      >
        <input type="checkbox" checked={item.selected} readOnly />
        <span style={{ marginLeft: '10px' }}>{item.label}</span>
    </div>
    );
  };
  
  export default Row;