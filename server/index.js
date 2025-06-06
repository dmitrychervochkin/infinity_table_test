const express = require('express');
const cors = require('cors');
const { ITEMS_TOTAL, items, selectionState, sortOrder } = require('./state');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/items', (req, res) => {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 20;
  const normalize = str => str.toLowerCase().replace(/\s+/g, '');
  const search = normalize(req.query.search || '');

  let filtered = search
    ? items.filter(item => normalize(item.label).includes(search))
    : [...items];

  filtered.sort((a, b) => a.sortOrder - b.sortOrder); // <-- Сортировка по порядку

  const pageItems = filtered.slice(offset, offset + limit).map(item => ({
    ...item,
    selected: !!selectionState[item.id],
  }));

  res.json(pageItems);
});

app.post('/sort', (req, res) => {
  const ids = req.body?.ids;

  if (!Array.isArray(ids)) {
    console.error('Неверный формат данных:', req.body);
    return res.status(400).send('Invalid payload');
  }

  ids.forEach((id, index) => {
    const item = items.find(item => item.id === id);
    if (item) {
      item.order = index;
    }
  });

  res.send({ status: 'ok' });
});

app.post('/items/by-ids', (req, res) => {
  const { ids } = req.body;
  const result = ids
    .map(id => items.find(item => item.id === id))
    .filter(Boolean)
    .map(item => ({ ...item, selected: !!selectionState[item.id] }));
  res.json(result);
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
    const idSet = new Set(ids);
    const rest = sortOrder.filter(id => !idSet.has(id));
    sortOrder.length = 0;
    sortOrder.push(...ids, ...rest);
  }

  res.json({ ok: true });
});

app.get('/state', (req, res) => {
  res.json({ selectionState, sortOrder });
});

app.listen(3000, () => console.log('🔥 Server running on http://localhost:3000'));