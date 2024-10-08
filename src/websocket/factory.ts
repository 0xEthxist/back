import { Injectable, Logger } from "@nestjs/common";
import { CollectionService } from "src/app/collection/collection.service";
import { CollectionType } from "src/schemas/category.schema";
// import { MintService } from "src/app/mint/mint.service";
import instance from "./instance";
const contractName = 'secondary_factory';

@Injectable()
export class FactoryServiceWs {

    private socketInstance: any;

    constructor(
        private collectionService: CollectionService,
    ) { }

    onModuleInit() {
        this.createListener()
    }

    createListener() {
        this.socketInstance = instance(contractName, process.env.secondary_factory);
        Logger.log('create factory listener')
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
                case 'CollectionCreated':
                    var { owner, createdCollection, typeAndVersion, name, symbol, catWeb2 } = returnValues
                    this.collectionService.createCollection({
                        contract_address: createdCollection,
                        name,
                        symbol,
                        owner,
                        catWeb2,
                        type: CollectionType.normal,
                        scResponse: events
                    })
                    break;

                case 'LazyCollectionCreated':
                    var { owner, createdCollection, version, name, symbol, catWeb2, maximumSupply } = returnValues
                    this.collectionService.createCollection({
                        contract_address: createdCollection,
                        name,
                        symbol,
                        owner,
                        catWeb2,
                        type: CollectionType.lazy,
                        scResponse: events
                    })
                    break; 

                default:
                    break;
            }



        });

    }
}