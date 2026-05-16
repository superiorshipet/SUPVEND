import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '@/api/endpoints';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await notificationAPI.getAll(params);
    return data.data || data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await notificationAPI.markAsRead(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationAPI.markAllAsRead();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    isLoading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const result = action.payload;
        state.items = result.notifications || result;
        state.unreadCount = Array.isArray(state.items)
          ? state.items.filter((n) => !n.isRead).length
          : 0;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.isLoading = false; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find((n) => n._id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
