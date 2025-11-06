// server/src/middleware/__tests__/validation.test.js
const { validatePost } = require('../validation');
const Post = require('../../models/Post');

jest.mock('../../models/Post');

describe('validatePost Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Post',
        content: 'This is test content',
        category: '507f1f77bcf86cd799439011'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next for valid post data', () => {
    validatePost(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 for missing title', () => {
    req.body.title = '';

    validatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Title is required and must be at least 3 characters long'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 for short content', () => {
    req.body.content = 'short';

    validatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Content must be at least 10 characters long'
    });
  });

  it('should return 400 for duplicate slug', async () => {
    Post.findOne.mockResolvedValue({ slug: 'test-post' });
    req.body.title = 'Test Post';

    await validatePost(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'A post with this title already exists'
    });
  });
});