const countFetchedItems = (allPages) =>
  allPages.reduce((sum, page) => sum + (page?.userAuditItems?.length ?? 0), 0);

const isCursorStuck = (currentLastItem, prevPage) => {
  const prevLastItem = prevPage?.userAuditItems?.at(-1);

  return Boolean(prevLastItem && currentLastItem.eventId === prevLastItem.eventId);
};

/**
 * Determines the cursor for the next page of audit data.
 * Returns undefined when all records have been fetched or when the cursor
 * is stuck (the same last item appears on two consecutive pages due to
 * timestamp collision at a page boundary).
 */
export const getNextPageParam = (lastPage, allPages) => {
  const totalRecords = lastPage?.totalRecords ?? 0;
  const items = lastPage?.userAuditItems ?? [];

  if (!items.length) return undefined;
  if (countFetchedItems(allPages) >= totalRecords) return undefined;

  const lastItem = items.at(-1);
  const prevPage = allPages.length > 1 ? allPages.at(-2) : null;

  if (prevPage && isCursorStuck(lastItem, prevPage)) return undefined;

  return lastItem.eventTs;
};
