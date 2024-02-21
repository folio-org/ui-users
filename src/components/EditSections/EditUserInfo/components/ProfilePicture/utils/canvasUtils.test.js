import { getRadianAngle, rotateSize } from './canvasUtils';

describe('canvasUtils', () => {
  test('getRadianAngle', () => {
    expect(getRadianAngle(180)).toEqual(Math.PI);
  });

  test('rotateSize', () => {
    expect(rotateSize(10, 10, 10)).toEqual({ width: 11.584559306791382, height: 11.584559306791382 });
  });
});
