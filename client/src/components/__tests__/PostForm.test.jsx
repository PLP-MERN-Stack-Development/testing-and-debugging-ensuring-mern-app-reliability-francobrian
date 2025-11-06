// client/src/components/__tests__/PostForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import PostForm from '../PostForm';
import postsReducer from '../../store/slices/postsSlice';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (initialState) => 
  configureStore({
    reducer: {
      posts: postsReducer,
      auth: authReducer
    },
    preloadedState: initialState
  });

const mockStore = createMockStore({
  auth: {
    user: { id: '1', username: 'testuser' },
    isAuthenticated: true
  },
  posts: {
    loading: false,
    error: null
  }
});

const renderWithProviders = (component, store = mockStore) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('PostForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with all fields', () => {
    renderWithProviders(<PostForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    renderWithProviders(<PostForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create post/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/content is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    renderWithProviders(<PostForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Post Title' }
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'This is the test post content' }
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'tech' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Post Title',
        content: 'This is the test post content',
        category: 'tech'
      });
    });
  });

  it('displays loading state', () => {
    const loadingStore = createMockStore({
      auth: { user: { id: '1' }, isAuthenticated: true },
      posts: { loading: true, error: null }
    });

    renderWithProviders(<PostForm onSubmit={mockOnSubmit} />, loadingStore);

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  it('displays error message', () => {
    const errorStore = createMockStore({
      auth: { user: { id: '1' }, isAuthenticated: true },
      posts: { loading: false, error: 'Failed to create post' }
    });

    renderWithProviders(<PostForm onSubmit={mockOnSubmit} />, errorStore);

    expect(screen.getByText(/failed to create post/i)).toBeInTheDocument();
  });
});