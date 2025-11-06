// client/src/store/__tests__/postsReducer.test.js
import postsReducer from '../slices/postsSlice';
import { 
  fetchPostsStart, 
  fetchPostsSuccess, 
  fetchPostsFailure,
  createPostSuccess,
  updatePostSuccess,
  deletePostSuccess
} from '../slices/postsSlice';

const initialState = {
  items: [],
  loading: false,
  error: null,
  currentPost: null
};

describe('postsReducer', () => {
  it('should return initial state', () => {
    expect(postsReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle fetchPostsStart', () => {
    const action = fetchPostsStart();
    const state = postsReducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchPostsSuccess', () => {
    const mockPosts = [{ id: 1, title: 'Test Post' }];
    const action = fetchPostsSuccess(mockPosts);
    const state = postsReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.items).toEqual(mockPosts);
    expect(state.error).toBeNull();
  });

  it('should handle fetchPostsFailure', () => {
    const error = 'Failed to fetch posts';
    const action = fetchPostsFailure(error);
    const state = postsReducer({ ...initialState, loading: true }, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(error);
    expect(state.items).toEqual([]);
  });

  it('should handle createPostSuccess', () => {
    const newPost = { id: 2, title: 'New Post' };
    const action = createPostSuccess(newPost);
    const state = postsReducer({ ...initialState, items: [{ id: 1, title: 'Old Post' }] }, action);

    expect(state.items).toHaveLength(2);
    expect(state.items[1]).toEqual(newPost);
  });
});