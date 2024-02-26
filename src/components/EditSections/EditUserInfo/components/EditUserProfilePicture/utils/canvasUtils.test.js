import { getRadianAngle, rotateSize, createImage } from './canvasUtils';
import { imageSrc } from './data/imageSrc';

describe('canvasUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRadianAngle', () => {
    const result = getRadianAngle(180);
    expect(result).toEqual(Math.PI);
  });
  it('rotateSize', () => {
    expect(rotateSize(10, 10, 10)).toEqual({ width: 11.584559306791382, height: 11.584559306791382 });
  });
  it('createImage', async () => {
    const expectedResult = <img crossOrigin="anonymous" src={imageSrc} alt="create" />;
    expect(createImage(imageSrc)).resolves.toEqual(expectedResult);
  });
});
