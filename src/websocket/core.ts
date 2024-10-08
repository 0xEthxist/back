import { Injectable, Logger } from "@nestjs/common";
import { AdminListenerService } from "src/admin/admin/listener/admin-listener.service";
import { MintService } from "src/app/mint/mint.service";
import { NftService } from "src/app/nft/nft.service";
import { ProfileService } from "src/app/profile/profile.service";
import { ParentService } from "src/common/services/parent.service";
import instance from "./instance";
const contractName = 'core';

@Injectable()
export class CoreServiceWs {

    private socketInstance: any;

    constructor(
        private mintService: MintService,
        private profileService: ProfileService,
        private nftService: NftService,
        private adminService: AdminListenerService
    ) { }

    onModuleInit() {
        this.createListener()
    }

    createListener() {
        this.socketInstance = instance(contractName, process.env.core);
        Logger.log('create core listener')
        this.listener();
    }

    listener() {
        this.socketInstance.events.allEvents((err, events) => {
            if (err) {
                Logger.error('error in core listener', err);
                this.createListener()
                return;
            }

            Logger.log(`in ${events.event} listener`);

            let { returnValues } = events;

            switch (events.event) {
                case 'NFTminted':
                    var { collection, NFTid, CID, NFTdb } = returnValues
                    this.mintService.mintUpdate({
                        contract_address: collection,
                        tokenId: NFTid,
                        nftId: NFTdb,
                        scResponse: events
                    })
                    break;

                case 'PermissionGranted':
                    var { user, grantedPermission } = returnValues;
                    this.profileService.givingKyc({
                        name: 'behrouz',
                        pass: '!@#123qwe',
                        address: user
                    })
                    break;

                case 'PermissionRevoked':
                    var { user, revokedPermission } = returnValues;
                    this.profileService.PermissionRevoked({
                        name: 'behrouz',
                        pass: '!@#123qwe',
                        address: user
                    })
                    break;

                case 'LazyNFTpassedPrimaryMarket':
                    var { collection, NFTid, CID, buyer, NFTdb } = returnValues;
                    this.mintService.lazyMintBuy({
                        contract_address: collection,
                        tokenId: NFTid,
                        nftId: NFTdb,
                        cid: CID,
                        buyer,
                        scResponse: events
                    })
                    break;

                case 'NFTtransferred':
                    var { NFTid, collection, to, from } = returnValues;

                    this.nftService.burnAndTransfer({

                        contract_address: collection,
                        tokenId: NFTid,

                        owner: to,
                        lastOwner: from,
                        scResponse: events
                    })
                    break;

                case 'AdminAdded':
                    var { newAdmin, accessLevel } = returnValues;

                    this.adminService.adminAdded({
                        accessLevel,
                        newAdmin,
                        scResponse: events
                    })
                    break;

                /**
                 * when owner removed one of the admins
                 */
                case 'AdminRemoved':
                    var { removedAdmin, accessLevel } = returnValues;

                    this.adminService.adminRemoved({
                        accessLevel,
                        removedAdmin,
                        scResponse: events
                    })
                    break;

                default:
                    break;
            }



        });

    }
}