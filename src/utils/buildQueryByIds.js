const buildQueryByIds = (ids) => {
  const query = ids
    .map(id => `id==${id}`)
    .join(' or ');

  return query || '';
};

export default buildQueryByIds;
