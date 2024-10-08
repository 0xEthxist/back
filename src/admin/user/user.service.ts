import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ParentService } from 'src/common/services/parent.service';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { AdminPermisionMethod } from 'src/schemas/admin.schema';
import { User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';
import { payloadAdmin } from '../admin/interface/payload-jwt';
import { AdminParentService } from '../parent/admin-parent.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUser } from './dto/get-all-user.dto';
import { MakeLazyPermisionPost } from './dto/make-lazy-permision-post.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private dataServices: IDataServices,
    private parentService: ParentService,
    private adminParentService: AdminParentService
  ) { }

  /**
   * get all users
   * log showUser for admin
   * @param admin 
   */
  async findAll(getAllUser: GetAllUser, admin: payloadAdmin) {
    let { all, limit, page, search } = getAllUser;
    let nowTime = this.parentService.Tools.get_now_time();

    if (all)
      var users = await this.dataServices.user_kyc.getAll();
    else {

      // implement search on get users query 
      let filter: FilterQuery<User_kyc> = {};
      if (search)
        filter.$or = [{ address: search }, { username: this.parentService.Tools.regexLikeQuery(search) }];

      var paginationUsers = await this.parentService.pagination<User_kyc, User_kycDocument>({
        queryModel: this.parentService.userModel,
        page,
        limit,
        filter
      });

    } 
    // log for viewer
    this.adminParentService.setAdminLog({
      adminId: admin._id,
      name: AdminPermisionMethod.showUsers,
      action: all ? 'show all users' : `show page: ${page} and limit: ${limit}`
    })

    return { users, ...paginationUsers }
  }

  /**
   * add 1 permision for create lazy collection
   * @param makeLazyPermisionPost 
   * @param admin 
   */
  async makeLazyPermision(makeLazyPermisionPost: MakeLazyPermisionPost, admin: payloadAdmin) {
    let { address, count } = makeLazyPermisionPost;

    await this.parentService.userModel.updateOne({ address: this.parentService.Tools.regexCaseInsensitive(address) }, {
      'permision.collection.lazyCollection': count
    });

    return {
      message: 'make lazy permision'
    }

  }
}
