import { Injectable, Logger } from "@nestjs/common";
import { timer } from "rxjs";
import { ParentService } from "src/common/services/parent.service";
import tools from "src/helper/tools";
import { Nft, NotifLevel, OfferStatus } from "src/schemas/nft.schema";
import { NotifEvent } from "src/schemas/user_kyc.schema";
import { notificationOption } from "../interface/user.interface";
import { NotifAuctionUsers } from "./interface/notification.interface";

@Injectable()
export class NotificationService {

    constructor(private parentService: ParentService) { }

    onModuleInit() {
        Logger.log('run notif module');

        // this.notifUnfinishedActions()

    }

    async notification(inputs: notificationOption): Promise<void> {

        // return;
        let { event, message, address, targetUser, targetUserAddress, link, linkObject } = inputs;


        switch (event) {

            // when item listed (fix , auction)
            case NotifEvent.list:
            case NotifEvent.mint:
            case NotifEvent.createCollection:
                // check exists user
                let user = await this.parentService.getUser({ address });
                if (!user)
                    return;

                let name = this.parentService.Tools.getUiName(user);

                // message
                if (!message && event == NotifEvent.list) message = `${name} list new NFT`;
                else if (!message && event == NotifEvent.mint) message = `${name} mint new NFT`;
                else if (!message && event == NotifEvent.createCollection) message = `${name} create new collection`;

                // send notif to all followers
                for (let i = 0; i < user.followers.length; i++) {
                    const followerAddress = user.followers[i].address;
                    let follower = await this.parentService.getUser({ address: followerAddress });
                    if (!follower) continue;
                    follower.notif.push({
                        address,
                        event,
                        message,
                        seen: false,
                        time: this.parentService.Tools.get_now_time(),
                        ...(link) && { link },
                        ...(linkObject) && { linkObject }
                    })
                    await follower.save();
                }
                break;

            default:
                if (!targetUser)
                    targetUser = await this.parentService.getUser({ address: targetUserAddress })

                targetUser.notif.push({
                    address,
                    event,
                    message,
                    seen: false,
                    time: this.parentService.Tools.get_now_time(),
                    ...(link) && { link },
                    ...(linkObject) && { linkObject }

                })
                await targetUser.save()
                break;
        }

    }

    async notifUnfinishedActions() {
        await this.parentService.Tools.sleep(2500)
        let activeAuctions = await this.parentService.nftAuctions({
            time_end: this.parentService.Tools.get_now_time()
        });

        activeAuctions.map(activeAuctionnft => {
            let untilEndTime = (+activeAuctionnft.listed.time_end - this.parentService.Tools.get_now_time()) * 1000;
            Logger.warn('end', untilEndTime)
            timer(untilEndTime)
                .subscribe(data => {
                    this.NotificationOfAuctionUsers({
                        message: `"${activeAuctionnft.name}" auction has been over.`,
                        auctionData: activeAuctionnft,
                        event: NotifEvent.auctionEnd
                    })

                })

            if (this.parentService.Tools.get_now_time() < +activeAuctionnft.listed.time_start) {
                let untilStartTime = (+activeAuctionnft.listed.time_start - this.parentService.Tools.get_now_time()) * 1000;
                Logger.warn('start', untilStartTime)
                timer(untilStartTime)
                    .subscribe(data => {
                        this.NotificationOfAuctionUsers({
                            message: `Your auction has been started`,
                            auctionData: activeAuctionnft,
                            event: NotifEvent.auctionStart
                        })
                    })

            }

        })


    }

    NotificationOfAuctionUsers(data: NotifAuctionUsers) { // users include the owner and all bidder
        let { auctionData, message, event } = data;

        // send notif to owner of item
        this.notification({
            message,
            event,
            targetUserAddress: auctionData.owner
        })

        // send notif to bidders 
        auctionData.listed.suggestions.forEach(bid => {
            this.notification({
                message,
                event,
                targetUserAddress: bid.address
            })
        })
    }


    /**
     * This method checks every 24 hours which offer is ready to send a notification to the owner of the item
     */
    async notif_offers_queue() {
        let nowTime = tools.get_now_time();

        /**
         * get active offers provided that the end level of notification has not been reached
         */
        let nftActiveOffers = await this.parentService.getNfts({
            offers: {
                status: OfferStatus.active,
                notifLevel: { $ne: NotifLevel.end }
            }
        })

        /**
         * loop on all active nft offers
         * check notif level
         */
        nftActiveOffers.forEach((nft: Nft) => {
            let activeOffer = nft.offers.slice(-1)[0];
            if (activeOffer.notifLevel == NotifLevel.d3)
                if (+activeOffer.create_time + (3 * 24 * 60 * 60) > nowTime)
                    this.notification({
                        targetUserAddress: nft.owner,
                        event: NotifEvent.makeOffer,
                        message: `3 days has passed since @user made an offer on your NFT.`
                    })
        });

        /** 
         * sleep method for 12h 
         * Daily calling of the method
         * */
        await tools.sleep(43200);
        await this.notif_offers_queue();
    }

}