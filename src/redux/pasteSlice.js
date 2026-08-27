import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import * as solutionsApi from '../api/solutions';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Fetch all solutions for the authenticated user from the backend.
 * Replaces the localStorage bootstrap from V1.
 */
export const fetchSolutions = createAsyncThunk(
  'paste/fetchSolutions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await solutionsApi.fetchSolutions();
      return data.data; // array of solution documents
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Create a new solution via the backend API.
 * The backend assigns _id, userId, createdAt, updatedAt.
 */
export const createPasteThunk = createAsyncThunk(
  'paste/create',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await solutionsApi.createSolution(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Update an existing solution via the backend API.
 */
export const updatePasteThunk = createAsyncThunk(
  'paste/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const data = await solutionsApi.updateSolution(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Delete a solution via the backend API.
 */
export const deletePasteThunk = createAsyncThunk(
  'paste/delete',
  async (id, { rejectWithValue }) => {
    try {
      await solutionsApi.deleteSolution(id);
      return id; // return id so the reducer can remove it from state
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const pasteSlice = createSlice({
  name: 'paste',
  initialState: {
    pastes: [],       // solution documents from the backend
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * Clear all pastes from Redux state (called on logout).
     * No longer writes to localStorage.
     */
    resetPaste: (state) => {
      state.pastes = [];
    },
  },
  extraReducers: (builder) => {
    // ── fetchSolutions ──────────────────────────────────────────────────────
    builder
      .addCase(fetchSolutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSolutions.fulfilled, (state, action) => {
        state.loading = false;
        state.pastes = action.payload;
      })
      .addCase(fetchSolutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to load solutions.');
      });

    // ── createPasteThunk ────────────────────────────────────────────────────
    builder
      .addCase(createPasteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPasteThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pastes.unshift(action.payload); // add to front (newest first)
        toast.success('Paste created!');
      })
      .addCase(createPasteThunk.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Failed to create paste.');
      });

    // ── updatePasteThunk ────────────────────────────────────────────────────
    builder
      .addCase(updatePasteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePasteThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.pastes.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) state.pastes[idx] = action.payload;
        toast.success('Paste updated!');
      })
      .addCase(updatePasteThunk.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Failed to update paste.');
      });

    // ── deletePasteThunk ────────────────────────────────────────────────────
    builder
      .addCase(deletePasteThunk.fulfilled, (state, action) => {
        state.pastes = state.pastes.filter((p) => p._id !== action.payload);
        toast.success('Paste deleted!');
      })
      .addCase(deletePasteThunk.rejected, (state, action) => {
        toast.error(action.payload || 'Failed to delete paste.');
      });
  },
});

export const { resetPaste } = pasteSlice.actions;

// Keep legacy action name exports so existing component imports don't break
// during migration — they now dispatch thunks instead of sync actions.
export { createPasteThunk as addToPastes };
export { updatePasteThunk as updatePastes };
export { deletePasteThunk as removeFromPastes };

export default pasteSlice.reducer;