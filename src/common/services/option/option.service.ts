import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminPermisionMethod } from 'src/schemas/admin.schema';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Category_web2, Category_web2Document } from 'src/schemas/category_web2.schema';
import { Listed, ListedDocument } from 'src/schemas/listed.schema';
import { Marketing, MarketingDocument } from 'src/schemas/marketing.schema';
import { Nft, NftDocument } from 'src/schemas/nft.schema';
import { Option, OptionDocument } from 'src/schemas/option.schema';
import { User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';

@Injectable()
export class OptionService {

    // core data
    public nullAddress = '0x0000000000000000000000000000000000000000';
    public show: boolean = true;
    public lazyLimit: number = 50; // 50$
    public Options: OptionDocument;
    public ARTANIOM_COLLECTION_NAME = 'artaniom';

    constructor(
        // @InjectModel(User_kyc.name) public userModel: Model<User_kycDocument>,
        // @InjectModel(Nft.name) public nftModel: Model<NftDocument>,
        // @InjectModel(Category.name) public catModel: Model<CategoryDocument>,
        // @InjectModel(Listed.name) public listedModel: Model<ListedDocument>,
        // @InjectModel(Category_web2.name) public catWeb2Model: Model<Category_web2Document>,
        // @InjectModel(Marketing.name) public marketingModel: Model<MarketingDocument>,
        @InjectModel(Option.name) public optionModel: Model<OptionDocument>,
        public configService: ConfigService,
    ) { }

    async onModuleInit() {
        this.getOptions();
    }

    async getOptions() {
        this.Options = await this.optionModel.findOne()
    }

    /**
     * web3 data
     */
    royalty = {
        max: () => this.Options?.royalty?.max || 20,
    }

    commission = {
        lazy: {
            getAddress: () => this.Options?.commission?.lazy?.address || process.env.core,
            getPercent: () => this.Options?.commission?.lazy?.percent || 3
        }
    }

    /**
     * web2 data
     */

    viewerPermisions = [
        AdminPermisionMethod.showUsers
    ]

}