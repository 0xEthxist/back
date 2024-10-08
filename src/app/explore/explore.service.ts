import { Injectable } from '@nestjs/common';
import { getNftOptionWithCollection } from 'src/common/services/interface/nft.interface';
import { paginationParams } from 'src/common/services/interface/query.interface';
import { ParentService } from 'src/common/services/parent.service';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { Category } from 'src/schemas/category.schema';
import { Nft } from 'src/schemas/nft.schema';
import { CreateExploreDto } from './dto/create-explore.dto';
import { ExploreCollectionDto } from './dto/explore-collection.dto';
import { getExploreDto } from './dto/get-explore.dto';
import { filterExplore } from './helper/filter';
import { filterExploreCollections } from './helper/filter-explore-collections';

/** 
 * In this service, we have methods to handle coding parts, explore items and collections, 
 * which include many filters and types of sorts in both parts, which I have handled with helper methods. 
 */
@Injectable()
export class ExploreService {
  constructor(
    private parentService: ParentService
  ) { }

  /**
   * explore items
   * @param query 
   * @returns 
   */
  async findAll(query: getExploreDto) {

    let { page, limit } = query,
      projectionField = [
        '_id',
        'name',
        'image',
        'image_cid',
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

    var { getNftOption, getNftMethod } = filterExplore(query);
    getNftMethod.pagination = {
      limit,
      page,
      queryModel: this.parentService.nftModel,
      filter: getNftOption,
      projection: projectionField,
      sort: getNftMethod.sort
    }

    let result = await this.parentService.getNfts(getNftOption, projectionField, getNftMethod);

    let collections = await this.parentService.nftModel.aggregate([
      {
        $match: getNftOption,
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }]);

    return {
      ...result,
      headerData: {
        artWorks: result.count,
        collections: collections
      }
    }
  }


  /**
   * explore collections
   * @param query 
   * @returns 
   */
  async exploreCollections(query: ExploreCollectionDto) {

    let { page, limit } = query,
      projectionField = {};

    var { getCollectionOption, getCollectionMethod } = filterExploreCollections(query);

    getCollectionMethod.pagination = {
      limit,
      page,
      queryModel: this.parentService.catModel,
      filter: getCollectionOption,
      projection: projectionField,
      sort: getCollectionMethod.sort
    }

    // get collection data
    let result = await this.parentService.getCollectionsWithOption(getCollectionOption, { owner_data: true }, getCollectionMethod, projectionField);

    return {
      ...result,
      headerData: {
        collections: result.count
      }
    };
  }

}
