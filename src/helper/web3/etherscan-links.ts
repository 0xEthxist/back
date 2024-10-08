

export const nftEtherscanLink = (contract_address, tokenId) => `${process.env.EHTER_SCAN}/nft/${contract_address}/${tokenId}`
export const trxEtherscanLink = (transactionHash) => `${process.env.EHTER_SCAN}/tx/${transactionHash}`