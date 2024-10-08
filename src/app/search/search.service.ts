import { Injectable } from '@nestjs/common';
import { ParentService } from 'src/common/services/parent.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { GetSearchDto } from './dto/get-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';

/**
 * The method that exists in this class is for searching for the user item and collections sections, 
 * which can be worked on more in the future due to the modularity of the search.
 */
@Injectable()
export class SearchService {
  constructor(private parentService: ParentService) { }

  /**
   * search at 3 entity in my app
   * @param getSearchDto 
   * @returns 
   */
  async search(getSearchDto: GetSearchDto) {
    let { searchItem } = getSearchDto

    if (!searchItem) return this.parentService.Error('searchItem invalid', 400)

    // for like query and case insensitive query
    let itemRegex = { $regex: new RegExp('^.*' + searchItem.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '.*$', 'i') }

    // search in items
    let items = await this.parentService.getNfts(
      { $or: [{ name: itemRegex }, { tags: itemRegex }] },
      [],
      { limit: 5, collection: true }
    );

    // search in collection
    let collections = await this.parentService.getCollectionsWithOption(
      {
        $or: [
          { name: itemRegex },
          { title: itemRegex }
        ]
      }, {},
      { limit: 5 }
    );

    // search in profile
    let profile = await this.parentService.getUsers(
      {
        $or: [
          { name: itemRegex },
          { username: itemRegex }
        ]
      },
      ['address', 'name', 'username', 'avatar'],
      { limit: 5 }
    )

    return {
      items,
      collections,
      profile
    };
  }

}
