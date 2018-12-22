export default function (list, string) {
  return list.length > 2
    ? `${list[0]}, ${list[1]}...`
    : `${string.substring(0, string.length - 2)}`;
}
