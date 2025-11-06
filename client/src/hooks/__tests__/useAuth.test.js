// client/src/hooks/__tests__/useAuth.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useAuth from '../useAuth';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (initialState) => 
  configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: initialState
    }
  });

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useAuth', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com'
  };

  it('should return auth state and actions', () => {
    const store = createMockStore({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper,
      initialProps: { store }
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should handle login action', async () => {
    const store = createMockStore({
      user: null,
      isAuthenticated: false,
      loading: false
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper,
      initialProps: { store }
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    // Check if login action was dispatched
    const state = store.getState();
    expect(state.auth.loading).toBe(false);
  });
});