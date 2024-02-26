import * as canvasUtilsmodule from './canvasUtils';
import { imageSrc } from './data/imageSrc';

jest.mock('./createObjectURL', () => ({
  createObjectURL: jest.fn(() => 'mocked-url-for-blob'),
}));

describe('getRotatedImage', () => {
  it('should rotate image by 90 degrees', async () => {
    const mockImage = new Image();
    mockImage.width = 100;
    mockImage.height = 200;
    jest.spyOn(canvasUtilsmodule, 'createImage').mockResolvedValueOnce(mockImage);

    const mockCanvas = document.createElement('canvas');
    const mockCtx = mockCanvas.getContext('2d');
    jest.spyOn(document, 'createElement').mockReturnValueOnce(mockCanvas);
    jest.spyOn(mockCanvas, 'getContext').mockReturnValue(mockCtx);

    const image = await canvasUtilsmodule.createImage(imageSrc);
    const result = await canvasUtilsmodule.getRotatedImage(image, 90);

    expect(result).toContain('mocked-url-for-blob');
  });
});
