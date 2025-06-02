const express = require('express');
const cors = require('cors');
const { ITEMS_TOTAL, items, selectionState, sortOrder } = require('./state');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/items', (req, res) => {
    const offset = parseInt(req.query.offset, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = (req.query.search || '').toLowerCase();
  
    console.log('--- Request ---');
    console.log('Offset:', offset);
    console.log('Limit:', limit);
    console.log('Search:', search);
  
    let filtered = search
      ? items.filter(item => item.label.toLowerCase().includes(search))
      : items;
  
    console.log('Total items:', items.length);
    console.log('Filtered items:', filtered.length);
  
    if (sortOrder.length) {
      const orderMap = new Map();
      sortOrder.forEach((id, idx) => orderMap.set(id, idx));
      filtered.sort((a, b) => {
        const aPos = orderMap.has(a.id) ? orderMap.get(a.id) : Number.MAX_SAFE_INTEGER;
        const bPos = orderMap.has(b.id) ? orderMap.get(b.id) : Number.MAX_SAFE_INTEGER;
        return aPos - bPos;
      });
    }
  
    const pageItems = filtered.slice(offset, offset + limit).map(item => ({
      ...item,
      selected: !!selectionState[item.id]
    }));
  
    console.log('Items returned:', pageItems.length);
    console.log('----------------');
  
    res.json(pageItems);
  });

app.post('/select', (req, res) => {
  const { id } = req.body;
  if (selectionState[id]) {
    delete selectionState[id];
  } else {
    selectionState[id] = true;
  }
  res.json({ ok: true });
});

app.post('/sort', (req, res) => {
  const { ids } = req.body;
  if (Array.isArray(ids)) {
    sortOrder.length = 0;
    sortOrder.push(...ids);
  }
  res.json({ ok: true });
});

app.get('/state', (req, res) => {
  res.json({ selectionState, sortOrder });
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));