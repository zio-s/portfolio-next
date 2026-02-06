import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UsersState, User, ApiResponse, ApiError } from '../types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper: Check if error is an Axios error
function isAxiosError(error: unknown): error is { response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number } } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error
  );
}

// Initial State
const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: ApiError }
>('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<ApiResponse<User[]>>(`${API_URL}/users`);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue({
      message: isAxiosError(error) ? (error.response?.data?.message || 'Failed to fetch users') : 'Failed to fetch users',
      statusCode: isAxiosError(error) ? error.response?.status : undefined,
    });
  }
});

export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: ApiError }
>('users/fetchUserById', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<ApiResponse<User>>(`${API_URL}/users/${id}`);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue({
      message: isAxiosError(error) ? (error.response?.data?.message || 'Failed to fetch user') : 'Failed to fetch user',
      statusCode: isAxiosError(error) ? error.response?.status : undefined,
    });
  }
});

export const createUser = createAsyncThunk<
  User,
  Omit<User, 'id'> & { password: string },
  { rejectValue: ApiError }
>('users/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<ApiResponse<User>>(`${API_URL}/users`, userData);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue({
      message: isAxiosError(error) ? (error.response?.data?.message || 'Failed to create user') : 'Failed to create user',
      statusCode: isAxiosError(error) ? error.response?.status : undefined,
      errors: isAxiosError(error) ? error.response?.data?.errors : undefined,
    });
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; updates: Partial<User> },
  { rejectValue: ApiError }
>('users/updateUser', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await axios.patch<ApiResponse<User>>(`${API_URL}/users/${id}`, updates);
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue({
      message: isAxiosError(error) ? (error.response?.data?.message || 'Failed to update user') : 'Failed to update user',
      statusCode: isAxiosError(error) ? error.response?.status : undefined,
      errors: isAxiosError(error) ? error.response?.data?.errors : undefined,
    });
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/users/${id}`);
    return id;
  } catch (error: unknown) {
    return rejectWithValue({
      message: isAxiosError(error) ? (error.response?.data?.message || 'Failed to delete user') : 'Failed to delete user',
      statusCode: isAxiosError(error) ? error.response?.status : undefined,
    });
  }
});

export const updateUserRole = createAsyncThunk<
  User,
  { id: string; role: 'admin' | 'user' },
  { rejectValue: ApiError }
>('users/updateUserRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    const response = await axios.patch<ApiResponse<User>>(`${API_URL}/users/${id}/role`, { role });
    return response.data.data;
  } catch (error: unknown) {
    return rejectWithValue({
      message: isAxiosError(error) ? (error.response?.data?.message || 'Failed to update user role') : 'Failed to update user role',
      statusCode: isAxiosError(error) ? error.response?.status : undefined,
    });
  }
});

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      });

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user';
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create user';
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((user: User) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user';
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user: User) => user.id !== action.payload);
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete user';
      });

    // Update User Role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((user: User) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user role';
      });
  },
});

// Actions
export const { clearError, setCurrentUser } = usersSlice.actions;

// Selectors
export const selectUsers = (state: { users: UsersState }) => state.users.users;
export const selectCurrentUser = (state: { users: UsersState }) => state.users.currentUser;
export const selectUsersLoading = (state: { users: UsersState }) => state.users.loading;
export const selectUsersError = (state: { users: UsersState }) => state.users.error;

// Memoized Selectors
export const selectUserById = (userId: string) => (state: { users: UsersState }) =>
  state.users.users.find((user) => user.id === userId);

export const selectAdminUsers = (state: { users: UsersState }) =>
  state.users.users.filter((user) => user.role === 'admin');

export const selectRegularUsers = (state: { users: UsersState }) =>
  state.users.users.filter((user) => user.role === 'user');

export default usersSlice.reducer;
