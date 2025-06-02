import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { fetchWithCancel } from '../fetchWithCancel';

interface Item {
  id: number;
  label: string;
  selected: boolean;
}

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  showSelectedOnly: boolean;
}

const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  searchQuery: '',
  showSelectedOnly: false
};

export const fetchInitialData = createAsyncThunk(
  'items/fetch',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const offset = state.items.items.length;
    const query = state.items.searchQuery;

    const url = `https://infinity-table-server.onrender.com/items?offset=${offset}&limit=20&search=${query}`;
    const data = await fetchWithCancel(url);
    return data;
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
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    selectItem(state, action: PayloadAction<number>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.selected = !item.selected;
    },
    reorderItems(state, action: PayloadAction<Item[]>) {
      state.items = action.payload;
    },
    toggleShowSelectedOnly(state) {
      state.showSelectedOnly = !state.showSelectedOnly;
    },
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
        }
        state.loading = false;
      });
    }
});

export const { setSearchQuery, selectItem, reorderItems, resetItems, toggleShowSelectedOnly } = itemsSlice.actions;
export default itemsSlice.reducer;