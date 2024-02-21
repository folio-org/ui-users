import { getRadianAngle, rotateSize, getCroppedImg, getRotatedImage } from './canvasUtils';
import { imageSrc } from './data/imageSrc';

describe('canvasUtils', () => {
  test('getRadianAngle', () => {
    expect(getRadianAngle(180)).toEqual(Math.PI);
  });

  test('rotateSize', () => {
    expect(rotateSize(10, 10, 10)).toEqual({ width: 11.584559306791382, height: 11.584559306791382 });
  });

  test('getRotatedImage', () => {
    expect(getRotatedImage(imageSrc, 0)).resolves.toBe(imageSrc);
  });

  test('getCroppedImg', () => {
    const pixelCrop = {
      'width': 474,
      'height': 474,
      'x': 0,
      'y': 9
    };

    expect(getCroppedImg(imageSrc, pixelCrop, 45)).resolves.toBe(expect.objectContaining({
      size: 16660,
      type: 'image/jpeg'
    }));
  });
});
