const getRenewalPatronBlocksFromPatronBlocks = (patronBlocks) => (
  patronBlocks.filter((patronBlock) => patronBlock.renewals === true || patronBlock.blockRenewals === true)
);

export default getRenewalPatronBlocksFromPatronBlocks;
