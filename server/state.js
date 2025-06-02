const ITEMS_TOTAL = 1_000_000;

const items = Array.from({ length: ITEMS_TOTAL }, (_, i) => ({
  id: i + 1,
  label: `Элемент ${i + 1}`
}));

const selectionState = {}; 
const sortOrder = []; 

module.exports = {
  ITEMS_TOTAL,
  items,
  selectionState,
  sortOrder
};