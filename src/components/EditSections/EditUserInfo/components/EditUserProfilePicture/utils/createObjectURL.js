// eslint-disable-next-line import/prefer-default-export
export function createObjectURL(blob) {
  return global.URL.createObjectURL(blob);
}
