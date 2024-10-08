import { statusMessage } from "src/common/services/interface/conditions";
import { Nft, NftActions } from "src/schemas/nft.schema";

export const isListedLastAction = (nft_path: Nft["nft_path"]): boolean => {
    if (
        nft_path.length > 0 &&
        (nft_path.slice(-1)[0].action == NftActions.fix || nft_path.slice(-1)[0].action == NftActions.auction)
    )
        return true;

    return false;

}

export const nftNotFound = (nftDB: Nft, address: string): boolean => {
    if (
        !nftDB ||
        (address && !nftDB.show && nftDB.owner.toLowerCase() != address.toLowerCase()) ||
        (!address && !nftDB.show)
    )
        return true;

    return false;

}

export const requireLazyBuy = (nftDB: Nft, address: string) => {
    if (
        isShareholder(nftDB.collaborators, address)
    )
        // throw 400
        return { status: false, message: `You are one of the shareholders of item: ${nftDB.name}` };

    return { status: true };

}

export const isShareholder = (collaborators: Nft['collaborators'], address: string): boolean => {
    if (
        collaborators.find(collaborator => collaborator.address.toLowerCase() == address.toLowerCase())
    )
        return true;

    return false;

}