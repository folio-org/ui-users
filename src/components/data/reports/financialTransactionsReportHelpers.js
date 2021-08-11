export const EMPTY_HYPERLINK_VALUE = '';

export const getPatronBarcodeHyperlink = (origin, row, noBarcode) => {
  const patronBarcodeLabel = row.patronBarcode || noBarcode;

  return origin && row.patronId
    ? `=HYPERLINK("${origin}/users/preview/${row.patronId}", "${patronBarcodeLabel}")`
    : EMPTY_HYPERLINK_VALUE;
};

export const getItemBarcodeHyperlink = (origin, row) => (
  origin && row.instanceId && row.holdingsRecordId && row.itemId && row.itemBarcode
    ? `=HYPERLINK("${origin}/inventory/view/${row.instanceId}/${row.holdingsRecordId}/${row.itemId}", "${row.itemBarcode}")`
    : EMPTY_HYPERLINK_VALUE
);

export const getLoanPolicyHyperlink = (origin, row) => (
  origin && row.loanPolicyId && row.loanPolicyName
    ? `=HYPERLINK("${origin}/settings/circulation/loan-policies/${row.loanPolicyId}", "${row.loanPolicyName}")`
    : EMPTY_HYPERLINK_VALUE
);

export const getOverduePolicyHyperlink = (origin, row) => (
  origin && row.overdueFinePolicyId && row.overdueFinePolicyName
    ? `=HYPERLINK("${origin}/settings/circulation/fine-policies/${row.overdueFinePolicyId}", "${row.overdueFinePolicyName}")`
    : EMPTY_HYPERLINK_VALUE
);

export const getLostItemPolicyHyperlink = (origin, row) => (
  origin && row.lostItemPolicyId && row.lostItemPolicyName
    ? `=HYPERLINK("${origin}/settings/circulation/lost-item-fee-policy/${row.lostItemPolicyId}", "${row.lostItemPolicyName}")`
    : EMPTY_HYPERLINK_VALUE
);

export const getLoanDetailsHyperlink = (origin, row) => (
  origin && row.patronId && row.loanId
    ? `=HYPERLINK("${origin}/users/${row.patronId}/loans/view/${row.loanId}", "${row.loanId}")`
    : EMPTY_HYPERLINK_VALUE
);
