import { GlobalErrorHandler } from './error-handler.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;

  beforeEach(() => {
    handler = new GlobalErrorHandler();
  });

  it('should handle Error instances', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError(new Error('test error'));

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle non-Error values', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handler.handleError('string error');

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', 'string error');
    consoleSpy.mockRestore();
  });

  it('should not throw when handling errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => handler.handleError(null)).not.toThrow();
    expect(() => handler.handleError(undefined)).not.toThrow();
    expect(() => handler.handleError(42)).not.toThrow();

    consoleSpy.mockRestore();
  });
});
