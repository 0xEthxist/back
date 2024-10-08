
import { Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { MarketHandelerOption } from 'src/app/nft/interface/market-handeler-option.interface';
import { NftOffers, NftStatus } from 'src/schemas/nft.schema';
import { httpInstance } from '../create-instance';

// create instance from market contract
const contractInstance = () => {
    return httpInstance('market', process.env.market);
}

export const getMarket = async (option: geterMarketOption, marketHandeler: Function) => {

    if (!option.contract_address) {

        option.contract_address = process.env.CONTRACT_ADDRESS;
    }


    let { contract_address, tokenId, offers } = option;

    try {
        let contract = contractInstance();
        let marketData = await contract.methods.getTokenInfo(contract_address, tokenId).call();

        let marketHandelerInput: MarketHandelerOption;
        let encodeType = [],
            auctionTuple = "tuple(uint96 baseValue,uint160 duration,uint256 startTime,uint96 latestBidAmount,address tokenBidder) AuctionInfo";
        marketHandelerInput['tokenId'] = tokenId;
        marketHandelerInput['contract_address'] = contract_address;

        /**
         * 0 => out of market;
         * 1 => fixed;
         * 2 => reserve;
         * 3 => fix and reserve;
         * 4 => auction;
         * 5 => auction with bid;
         */

        switch (+marketData.tokenStatus) {
            case 1:
                encodeType = ["uint256 price"];
                var dataDecode = ethers.utils.defaultAbiCoder.decode(encodeType, marketData.marketData);
                marketHandelerInput['status'] = NftStatus.fix
                marketHandelerInput.data.fixPrice = dataDecode.price;
                break;

            case 3:
                encodeType = ["uint256 price", auctionTuple];
                var dataDecode = ethers.utils.defaultAbiCoder.decode(encodeType, marketData.marketData);
                marketHandelerInput['status'] = NftStatus.fixAndReserve;

                marketHandelerInput.data.fixPrice = dataDecode.price;

                marketHandelerInput.data.baseValue = dataDecode.AuctionInfo.baseValue;
                marketHandelerInput.data.duration = dataDecode.AuctionInfo.duration;
                break;

            case 2:
            case 4:
            case 5:
                encodeType = [auctionTuple];
                var dataDecode = ethers.utils.defaultAbiCoder.decode(encodeType, marketData.marketData);
                marketHandelerInput.data.baseValue = dataDecode.AuctionInfo.baseValue;
                marketHandelerInput.data.duration = dataDecode.AuctionInfo.duration;
                if (+marketData.tokenStatus > 3) {
                    marketHandelerInput['status'] = NftStatus.auction;
                    marketHandelerInput.data.startTime = dataDecode.AuctionInfo.startTime;
                } else
                    marketHandelerInput['status'] = NftStatus.reserve;

            case 5:
                if (+marketData.tokenStatus == 5) {
                    marketHandelerInput.data.bidValue = dataDecode.AuctionInfo.latestBidAmount.toNumber();
                    marketHandelerInput.data.bidder = dataDecode.AuctionInfo.tokenBidder.toNumber();
                }
                break;

            default:
                break;
        }

        // checking offer data
        marketData.OfferData.wantedPrice == '0' ?
            marketHandelerInput.offerData = null :
            marketHandelerInput.offerData.offerer = marketData.OfferData.offerer,
            marketHandelerInput.offerData.wantedPrice = marketData.OfferData.wantedPrice;



        await marketHandeler(marketHandelerInput, offers);

        return marketData.status;

    } catch (error) {
        Logger.log('err in get getMarket from contract : ' + error);

        return false;

    }

}



export interface geterMarketOption {
    contract_address: string,
    tokenId: any,
    offers: NftOffers[]
}