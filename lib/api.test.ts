// @ts-nocheck
// We'll use @ts-nocheck for this example to avoid TS compilation errors
// in the testing environment if types are not perfectly aligned or mocks are tricky.
// In a real project, you'd want to ensure type safety.

import { fetchAllPaginatedData, apiRequest } from './api'; // apiRequest is imported to be mocked

// Mock the apiRequest function
jest.mock('./api', () => ({
  ...jest.requireActual('./api'), // Import and retain default exports/behavior
  apiRequest: jest.fn(), // Mock apiRequest specifically
}));

describe('fetchAllPaginatedData', () => {
  const mockEndpoint = '/test-endpoint';
  const PAGE_SIZE = 100; // As defined in fetchAllPaginatedData

  beforeEach(() => {
    // Clear mock call history before each test
    (apiRequest as jest.Mock).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('should fetch multiple pages of data', async () => {
    const mockDataPage1 = [{ id: 1 }, { id: 2 }];
    const mockDataPage2 = [{ id: 3 }, { id: 4 }];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockDataPage1) // First call
      .mockResolvedValueOnce(mockDataPage2) // Second call
      .mockResolvedValueOnce([]); // Third call (empty, end of data)

    const initialParams = { search: 'test' };
    const results = await fetchAllPaginatedData(mockEndpoint, initialParams);

    expect(apiRequest).toHaveBeenCalledTimes(3);
    expect(apiRequest).toHaveBeenNthCalledWith(1, mockEndpoint, { ...initialParams, page: 1, page_size: PAGE_SIZE });
    expect(apiRequest).toHaveBeenNthCalledWith(2, mockEndpoint, { ...initialParams, page: 2, page_size: PAGE_SIZE });
    expect(apiRequest).toHaveBeenNthCalledWith(3, mockEndpoint, { ...initialParams, page: 3, page_size: PAGE_SIZE });
    expect(results).toEqual([...mockDataPage1, ...mockDataPage2]);
  });

  test('should fetch a single page of data', async () => {
    const mockDataPage1 = [{ id: 1 }, { id: 2 }, { id: 3 }];

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockDataPage1) // First call
      .mockResolvedValueOnce([]); // Second call (empty)

    const results = await fetchAllPaginatedData(mockEndpoint);

    expect(apiRequest).toHaveBeenCalledTimes(2);
    expect(apiRequest).toHaveBeenNthCalledWith(1, mockEndpoint, { page: 1, page_size: PAGE_SIZE });
    expect(apiRequest).toHaveBeenNthCalledWith(2, mockEndpoint, { page: 2, page_size: PAGE_SIZE });
    expect(results).toEqual(mockDataPage1);
  });

  test('should return an empty array when no data is available', async () => {
    (apiRequest as jest.Mock).mockResolvedValueOnce([]); // First call (empty)

    const results = await fetchAllPaginatedData(mockEndpoint);

    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith(mockEndpoint, { page: 1, page_size: PAGE_SIZE });
    expect(results).toEqual([]);
  });

  test('should return accumulated data if an API error occurs during paging', async () => {
    const mockDataPage1 = [{ id: 1 }, { id: 2 }];
    const apiError = new Error('API Failed');

    (apiRequest as jest.Mock)
      .mockResolvedValueOnce(mockDataPage1) // First call
      .mockRejectedValueOnce(apiError); // Second call fails

    const results = await fetchAllPaginatedData(mockEndpoint);

    expect(apiRequest).toHaveBeenCalledTimes(2);
    expect(apiRequest).toHaveBeenNthCalledWith(1, mockEndpoint, { page: 1, page_size: PAGE_SIZE });
    expect(apiRequest).toHaveBeenNthCalledWith(2, mockEndpoint, { page: 2, page_size: PAGE_SIZE });
    expect(results).toEqual(mockDataPage1); // Should return data from before the error
    expect(console.error).toHaveBeenCalledWith(`Error fetching page 2 for ${mockEndpoint}:`, apiError);
  });

  test('should handle initialParams correctly', async () => {
    const initialParams = { category: 'news', limit: 10 };
    (apiRequest as jest.Mock).mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([]);

    await fetchAllPaginatedData(mockEndpoint, initialParams);

    expect(apiRequest).toHaveBeenNthCalledWith(1, mockEndpoint, {
      ...initialParams,
      page: 1,
      page_size: PAGE_SIZE,
    });
  });
});
