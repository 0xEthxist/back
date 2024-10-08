import { Global, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationService } from 'src/common/services/notification/notification.service';
import { ParentService } from 'src/common/services/parent.service';
import Tools from 'src/helper/tools';
import alchemyWeb3 from 'src/providers/alchemy-web3';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Listed, ListedStatus, Listedtype } from 'src/schemas/listed.schema';
import { Nft, NftDocument, NftStatus, OfferStatus } from 'src/schemas/nft.schema';
import { NotifEvent, User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { FollowProfileDto } from './dto/follow-profile.dto';
import { GetProfiletDto } from './dto/get-profile.dto';
import { ManualProfiletDto } from './dto/manual-profile.dto';
import { NotifProfileDto } from './dto/notif-profile.dto';
import { SearchCompleteUserDto } from './dto/search-complete-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private parentService: ParentService,
    @InjectModel(User_kyc.name) private userModel: Model<User_kycDocument>,
    @InjectModel(Nft.name) private nftModel: Model<NftDocument>,
    @InjectModel(Category.name) private catModel: Model<CategoryDocument>,
    private configService: ConfigService,
    private notifService: NotificationService,
  ) { }

  /**
   * create and edit profile
   * @param createProfileDto 
   * @param userAddressRequested 
   * @returns 
   */
  async create(createProfileDto: CreateProfileDto, userAddressRequested: String) {
    let { name, bio, email, username, social, avatar, banner, ens } = createProfileDto;
    let nowTime = Tools.get_now_time().toString()

    // get user and check exist user
    let user = await this.parentService.userModel.findOne({ address: userAddressRequested });

    if (user) { // edit profile

      if (username != user.username) // condition for change username
        if (await this.checkUsername(username))
          return this.parentService.fail('Username is duplicate');


      user.name = name;
      user.bio = bio;
      user.email = email;
      user.banner = banner;
      user.avatar = avatar;
      user.social = social;
      user.username = username;
      user.time_update = nowTime;
      user.ens = ens;

      return await user.save();

    } else { // make new profile

      if (await this.checkUsername(username) || username.includes('0x'))
        return this.parentService.Error('Username is duplicate or invalid', 401)

      return await new this.parentService.userModel({
        address: userAddressRequested,
        name,
        bio,
        email,
        banner,
        avatar,
        social,
        username,
        active: false,
        time_added: nowTime
      }).save();

    }
  }

  // This method is a copy of the user capture method
  checkUsername = (username: String) => this.parentService.getUser({ username });

  async notif_allow(notifProfile: NotifProfileDto, userAddressRequested: String) {
    return 'this api not ready';
  }

  /**
   * This method is to get the data required for the profile page
   * so that the data of four parts : 
   *  created,
   *   collection,
   *   collected,
   *   split
   * @param getProfiletDto 
   * @param userAddressRequested 
   * @returns 
   */
  async getProfile(getProfiletDto: GetProfiletDto, userAddressRequested: string | null) {
    let { userkey } = getProfiletDto;
    let profileOwner: string;
    let isOwner: boolean = false,
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


    if (!userkey) { // owner request
      isOwner = true;
      // get user data
      var user = await this.parentService.userModel.findOne({ address: userAddressRequested });
      if (!user)
        return this.configService.get('failService')('not exist user')
      profileOwner = userAddressRequested;

      // Get user-owned All Nfts 
      var created = await this.parentService.getNfts({ creator: profileOwner, status: { $ne: NftStatus.invisible } }, projectionField, { show: 'all', collection: true, sort: { _id: -1 } })

      // get owned nfts But it is not its creator
      var collected = await this.parentService.getNfts({ owner: profileOwner, creator: { $ne: profileOwner }, status: { $ne: NftStatus.invisible } }, projectionField, { show: 'all', collection: true, sort: { _id: -1 } })

    } else {
      // get user data profile
      var user = await this.parentService.userModel.findOne({
        $or: [
          { username: userkey },
          { address: userkey }
        ]
      });
      if (!user) return this.configService.get('failService')('not exist user')
      profileOwner = user.address;

      if (user.address == userAddressRequested || user.username == userAddressRequested)
        return this.getProfile({
          userkey: null,
        }, userAddressRequested);

      // Get user-owned Nfts with filter
      var created = await this.parentService.getNfts({ creator: profileOwner, status: { $ne: NftStatus.invisible } }, projectionField, { collection: true, sort: { _id: -1 } })

      // get owned nfts But it is not its creator
      var collected = await this.parentService.getNfts({ owner: profileOwner, creator: { $ne: profileOwner }, status: { $ne: NftStatus.invisible } }, projectionField, { collection: true, sort: { _id: -1 } })
    }

    // get collections
    let collection = await this.parentService.getCollectionsWithOption({ owner: profileOwner }, { owner_data: true }) //, nfts: true

    let split = await this.getSplitNfts(profileOwner)

    return {
      isOwner,
      profileOwner,
      user,

      created,
      collection,
      collected,
      split,

    };

  }

  /**
   * This method is used to get the list of colbaritors of an item
   * @param address 
   * @returns 
   */
  async getSplitNfts(address: string) {
    let projectionField = [
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
    let splitNfts = await this.parentService.getNfts({
      'collaborators.address': this.parentService.Tools.regexCaseInsensitive(address),
    }, projectionField, { sort: { _id: -1 }, collection: true });

    return splitNfts;

  }

  /**
   * This method is for getting the list of notifications and changing the status of unread notifications to read
   * @param userAddress 
   * @returns 
   */
  async getNotifications(userAddress: String) {

    let user = await this.parentService.getUser({ address: userAddress })
    if (!user)
      return { success: false }

    let notifications = user.notif;

    let notifCopy = this.parentService.Tools.createCopy(notifications);
    let notificationsTemp = notifCopy.sort((n11, n22) => {
      return +n22.time - +n11.time
    });
    // Change unseen notifications to seen
    user.notif.map(notif => {
      if (!notif.seen)
        notif.seen = true;
    })
    await user.save()

    return {
      notificationsTemp
    };

  }

  /**
   * This method is designed for follow and unfollow actions, which works as a toggle
   * @param followProfiletDto 
   * @param userAddressRequested 
   * @returns 
   */
  async follow(followProfiletDto: FollowProfileDto, userAddressRequested: String) {
    let { userAddress } = followProfiletDto;

    // The visitor is not the owner of the profile
    if (userAddress == userAddressRequested)
      return this.parentService.Error(`You can't follow yourself`)

    // get userُ profile with address
    let user = await this.parentService.getUser({ address: userAddress });

    if (!user)
      return this.parentService.Error('user not exist in artaniom')

    let visitorUser = await this.parentService.checkUser({ address: userAddressRequested });

    // follow and unfollow
    if (user.followers.find(f => f.address == userAddressRequested)) { // unfollow
      var state = 'unfollowed'
      user.followers.splice(user.followers.findIndex(b => b.address == userAddressRequested), 1);
      visitorUser.following.splice(visitorUser.following.findIndex(b => b.address == userAddress), 1);
      Logger.log('in unfollow method');

    } else {
      var state = 'followed'
      user.followers.push({ address: userAddressRequested })
      visitorUser.following.push({ address: userAddress })
      await this.notifService.notification({
        address: userAddressRequested,
        event: NotifEvent.follow,
        targetUser: user,
        message: `${this.parentService.Tools.getUiName(visitorUser)} started following you`
      })

    }


    await user.save();

    // add profile change following 
    await visitorUser.save();

    return {
      visitorUser,
      state
    };
  }

  /**
   * This is a practical and manual method to give KYC
   * @param query 
   * @returns 
   */
  async givingKyc(query: ManualProfiletDto) {
    let { name, pass, address } = query;

    if (name == 'behrouz' && pass == '!@#123qwe') {

      if (user = await this.parentService.userModel.findOne({
        address: {
          $regex: new RegExp('^' + address.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
        }
      })) {
        user.active = true;
        await user.save();

      } else {
        var user = await new this.parentService.userModel({
          address,
          active: true
        }).save()

      }

      return user;



    }

    return false;
  }

  async PermissionRevoked(query: ManualProfiletDto) {
    let { name, pass, address } = query;

    let user = await this.parentService.userModel.findOne({
      address: {
        $regex: new RegExp('^' + address.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
      }
    })

    user.active = false;
    await user.save();



  }

  /**
   * This method works to create interest for collections
   * @param userAddressRequested 
   * @returns 
   */
  async favorite_collection(userAddressRequested: string) {

    // let user = await this.parentService.getUser({ address: userAddressRequested });
    // if (!user)
    //   return this.parentService.Error('user not exist', 404);

    let collections = await this.parentService.getCollectionsWithOption({
      favorite_list: {
        address: userAddressRequested
      }
    })

    return { collections }

  }

  /**
   * search all users wich complete custom username
   * @param searchCompleteUserDto 
   * @param userAddressRequested 
   * @returns 
   */
  async searchCompleteUser(searchCompleteUserDto: SearchCompleteUserDto, userAddressRequested: string) {
    let { userKey } = searchCompleteUserDto;
    let itemRegex = this.parentService.Tools.regexLikeQuery(userKey);

    return {
      users: await this.parentService.getUsers(
        {
          $or: [
            { address: itemRegex },
            { username: itemRegex }
          ]
          ,
          username: { $ne: null }
        },
        ['address', 'name', 'username', 'avatar'],
        { limit: 5 }
      )
    }

  }

  /**
   * get my offer on nfts and My items that have an offer
   * @param userAddress 
   * @returns 
   */
  async offers(userAddress: string) {

    let user = await this.parentService.getUser({ address: userAddress })
    if (!user)
      return this.parentService.Error('user not exist', 404);

    /** 
     * my offer
     */
    let myOfferNfts = await this.parentService.getNfts({
      offers: {
        address: this.parentService.Tools.regexCaseInsensitive(userAddress),
        status: OfferStatus.active
      }
    })

    /**
     * my nfts have offer
     */
    let myNfts = await this.parentService.getNfts({
      owner: this.parentService.Tools.regexCaseInsensitive(userAddress),
      offers: {
        status: OfferStatus.active
      }

    })


    return {
      myOfferNfts,
      myNfts
    };

  }

  /**
   * get my auctions on nfts and My items that have bid
   * @param userAddress 
   * @returns 
   */
  async auctions(userAddress: string) {

    let user = await this.parentService.getUser({ address: userAddress })
    if (!user)
      return this.parentService.Error('user not exist', 404);


    /** 
     * my bids
     */
    let myBids = (await this.getBidsNft(userAddress)).nfts

    /** 
     * my auction
     */
    let myAuctions = await this.parentService.getNfts({
      status: NftStatus.auction,
      owner: this.parentService.Tools.regexCaseInsensitive(userAddress)
    })


    return {
      myBids,
      myAuctions
    };

  }

  /**
   * nfst auction that you place a bid
   * @param userAddress 
   */
  async getBidsNft(userAddress: string) {

    // get list document that auctioned
    let listed = await this.parentService.listedModel.find({
      status: ListedStatus.active,
      type: Listedtype.auction,
      'suggestions.address': this.parentService.Tools.regexCaseInsensitive(userAddress)
    }, ['nft_id']);

    let nft_ids = this.parentService.Tools.filterField_Array_Of_Object<Listed, 'nft_id'>(listed, 'nft_id');

    Logger.log('nft_ids', nft_ids);


    let nfts = await this.parentService.nftModel.find().where('_id').in(nft_ids).exec();


    return {
      listed,
      nfts
    }

  }
}
