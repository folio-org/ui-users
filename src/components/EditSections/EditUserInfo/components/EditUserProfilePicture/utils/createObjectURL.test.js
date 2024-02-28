import { createObjectURL } from './createObjectURL';

describe('createObjectURL function', () => {
  test('it should return a valid URL for a given blob', () => {
    const mockCreateObjectURL = jest.fn(() => 'mockedURL');
    global.URL.createObjectURL = mockCreateObjectURL;
    const mockBlob = new Blob(['mockContent'], { type: 'text/plain' });
    const result = createObjectURL(mockBlob);

    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(result).toBe('mockedURL');
  });
});
