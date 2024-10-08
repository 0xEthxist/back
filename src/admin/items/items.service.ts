import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { methodsQuery } from 'src/common/services/interface/query.interface';
import { ParentService } from 'src/common/services/parent.service';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { Nft } from 'src/schemas/nft.schema';
import { payloadAdmin } from '../admin/interface/payload-jwt';
import { AdminParentService } from '../parent/admin-parent.service';
import { GetAllItems } from './dto/show-items.dto';
import { ToggleInShow } from './dto/toggle-in-interface.dto';

@Injectable()
export class ItemsService {

    constructor(
        private dataServices: IDataServices,
        private parentService: ParentService,
        private adminParentService: AdminParentService
    ) { }


    /**
     * get all items with pagination or no
     * @param query 
     * @returns 
     */
    async getAllItems(query: GetAllItems, admin: payloadAdmin) {
        let { limit, page, search } = query;
        let projectionField = [
            '_id',
            'name',
            'image',
            'image_cid',
            'uri',
            'uri_cid',
            'status',
            'show',
            'owner',
            'creator',
            'price',
            'category',
            'category_web2_id',
            'nft_path',
            'time_create',
            'time_listed',
            'time_sold',
            'collaborators',
            'offers',
            'tokenId',
            'image_original',
            'listed'
        ];

        let getNftMethod: methodsQuery = {
            collection: true,
            sort: { _id: -1 }
        };

        // implement search on get items query 
        let filter: FilterQuery<Nft> = {};
        if (search)
            filter.$or = [{ name: this.parentService.Tools.regexLikeQuery(search) }, { owner: search }];

        if (limit && page)
            getNftMethod.pagination = {
                limit,
                page,
                sort: { _id: -1 },
                queryModel: this.parentService.nftModel,
                filter,
                projection: projectionField
            }

        // get collection data
        let result = await this.parentService.getNfts({}, projectionField, getNftMethod);


        if (limit && page)
            return { ...result };

        return {
            nfts: result
        }
    }


    /**
     * This method is built to display or not display the item on the interface
     * @param query 
     * @returns 
     */
    async toggleInInterface(body: ToggleInShow, admin: payloadAdmin) {
        let { itemId } = body;

        // get nft from db
        let nft = await this.parentService.getNft({ _id: itemId });

        // check show state
        let newShowState = nft.show === true ? false : true;

        // update nft doc
        nft.show = newShowState;

        await nft.save();

        return {
            nft
        }
    }

}
