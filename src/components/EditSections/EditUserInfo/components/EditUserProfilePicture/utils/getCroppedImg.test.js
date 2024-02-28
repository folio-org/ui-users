import * as canvasUtilsmodule from './canvasUtils';
import { imageSrc } from './data/imageSrc';

jest.mock('./canvasUtils', () => ({
  __esModule: true,
  ...jest.requireActual('./canvasUtils'),
  createImage: jest.fn(),
  getRadianAngle: jest.fn(),
  rotateSize: jest.fn(),
}));

describe('getCroppedImg', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCroppedImg', async () => {
    const pixelCrop = { x: 10, y: 20, width: 50, height: 80 };
    const mockImage = new Image();
    mockImage.width = 100;
    mockImage.height = 200;

    const mockCanvas = document.createElement('canvas');
    const mockCtx = mockCanvas.getContext('2d');
    const mockCroppedCanvas = document.createElement('canvas');
    const mockCroppedCtx = mockCroppedCanvas.getContext('2d');

    jest.spyOn(canvasUtilsmodule, 'createImage').mockResolvedValueOnce(mockImage);
    jest.spyOn(canvasUtilsmodule, 'getRadianAngle').mockReturnValueOnce(0);
    jest.spyOn(canvasUtilsmodule, 'rotateSize').mockReturnValueOnce({ width: 100, height: 200 });

    jest.spyOn(document, 'createElement').mockReturnValueOnce(mockCanvas).mockReturnValueOnce(mockCroppedCanvas);
    jest.spyOn(mockCanvas, 'getContext').mockReturnValue(mockCtx);
    jest.spyOn(mockCroppedCanvas, 'getContext').mockReturnValue(mockCroppedCtx);

    const image = await canvasUtilsmodule.createImage(imageSrc);
    const result = await canvasUtilsmodule.getCroppedImg(image, pixelCrop, 0, { horizontal: false, vertical: false });

    expect(result).toBeInstanceOf(Blob);
  });
});
