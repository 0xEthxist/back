import { Injectable } from '@nestjs/common';
import { SetHomeCollection } from 'src/app/home/dto/set-home-collection.dto';
import { ParentService } from 'src/common/services/parent.service';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { CategoryDocument } from 'src/schemas/category.schema';
import { payloadAdmin } from '../admin/interface/payload-jwt';
import { AdminParentService } from '../parent/admin-parent.service';
import { changeHomeCollectionDto } from './dto/change-home-collection.dto';

@Injectable()
export class CollectionsService {
    constructor(
        private dataServices: IDataServices,
        private parentService: ParentService,
        private adminParentService: AdminParentService
    ) { }

    /**
     * 
     * @param query 
     * @returns 
     */
    async getAllCollection(admin: payloadAdmin) {

        let projectionField = {};

        // get collection data
        let collections = await this.parentService.getCollectionsWithOption({}, {}, {}, projectionField);

        return {
            collections
        }
    }


    /**
     * change sort Collections in home page
     * @param query 
     * @returns 
     */
    async changeHomeCollection(body: changeHomeCollectionDto, admin: payloadAdmin) {
        let { homeCollections } = body;
        let projectionField = {};

        // update home collection priority
        for (let i = 0; i < homeCollections.length; i++) {
            let collectionData = homeCollections[i]
            await this.dataServices.category.updateOne({ _id: collectionData.id }, {
                priority: collectionData.priority
            })

        }


    }


    /**
     * set and remove collection home
     * @param setHomeCollection 
     * @param admin 
     * @returns 
     */
    async setAndRemoveHomeCollection(setHomeCollection: SetHomeCollection, admin: payloadAdmin) {
        let { collectionId } = setHomeCollection;

        if (!collectionId)
            return this.parentService.Error('collectionId required!', 400)

        let collectionQuery: CategoryDocument;
        if (collectionQuery = await this.parentService.catModel.findOne({ _id: collectionId })) {
            if (collectionQuery.inHome)
                collectionQuery.inHome = false;
            else
                collectionQuery.inHome = true;

            await collectionQuery.save();

        }

        return {
            collectionQuery
        }
    }

}
