import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface Item {
  id: number;
  label: string;
  selected: boolean;
  sortOrder: number;
}

interface ItemsState {
  items: Item[];
  selectedItems: Item[]; 
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  showSelectedOnly: boolean;
}

const initialState: ItemsState = {
  items: [],
  selectedItems: [], 
  loading: false,
  error: null,
  hasMore: true,
  searchQuery: '',
  showSelectedOnly: false
};

let abortController: AbortController | null = null;

export const fetchInitialData = createAsyncThunk(
  'items/fetch',
  async (_, { getState }) => {
    if (abortController) abortController.abort();
    abortController = new AbortController();

    const state = getState() as RootState;
    const offset = state.items.items.length;
    const query = state.items.searchQuery;

    const url = `https://infinity-table-server.onrender.com/items?offset=${offset}&limit=20&search=${query}`;

    const res = await fetch(url, { signal: abortController.signal });
    return await res.json();
  }
);


const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    resetItems(state) {
      state.items = [];
      state.hasMore = true;
    },
    reorderItems(state, action: PayloadAction<Item[]>) {
      state.items = action.payload;
      state.items.sort((a, b) => a.sortOrder - b.sortOrder);
      state.selectedItems = state.items.filter(i => i.selected);
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    selectItem(state, action: PayloadAction<number>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.selected = !item.selected;
    
        if (item.selected) {
          const alreadyIn = state.selectedItems.find(i => i.id === item.id);
          if (!alreadyIn) state.selectedItems.push({ ...item });
        } else {
          state.selectedItems = state.selectedItems.filter(i => i.id !== item.id);
        }
      }
    },
    toggleShowSelectedOnly(state) {
      state.showSelectedOnly = !state.showSelectedOnly;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, state => {
        state.loading = true;
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        if (action.payload.length === 0) {
          state.hasMore = false;
        } else {
          const existingIds = new Set(state.items.map(item => item.id));
          const filtered = action.payload.filter((item: Item) => !existingIds.has(item.id));
          state.items.push(...filtered);
          state.items = Array.from(new Map(state.items.map(i => [i.id, i])).values());
        }
        state.loading = false;
      });
    }
});

export const { setSearchQuery, selectItem, reorderItems, resetItems, toggleShowSelectedOnly } = itemsSlice.actions;
export default itemsSlice.reducer;