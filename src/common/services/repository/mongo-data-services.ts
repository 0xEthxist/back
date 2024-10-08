import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from 'src/schemas/admin.schema';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Listed, ListedDocument } from 'src/schemas/listed.schema';
import { Nft, NftDocument } from 'src/schemas/nft.schema';
import { User_kyc, User_kycDocument } from 'src/schemas/user_kyc.schema';
import { IDataServices } from './abstract-data-services';
import { IGenericRepository } from './abstract-repository';
import { MongoGenericRepository } from './mongo-generic-repository';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
    listed: MongoGenericRepository<Listed, ListedDocument>;
    user_kyc: MongoGenericRepository<User_kyc, User_kycDocument>;
    admin: MongoGenericRepository<Admin, AdminDocument>;
    nft: MongoGenericRepository<Nft, NftDocument>;
    category: MongoGenericRepository<Category, CategoryDocument>;

    constructor(
        @InjectModel(Listed.name)
        private ListedRepository: Model<ListedDocument>,
        @InjectModel(User_kyc.name)
        private User_kycRepository: Model<User_kycDocument>,
        @InjectModel(Admin.name)
        private AdminRepository: Model<AdminDocument>,
        @InjectModel(Nft.name)
        private NftRepository: Model<NftDocument>,
        @InjectModel(Category.name)
        private categoryRepository: Model<CategoryDocument>
    ) { }

    onApplicationBootstrap() {
        this.listed = new MongoGenericRepository<Listed, ListedDocument>(this.ListedRepository);
        this.user_kyc = new MongoGenericRepository<User_kyc, User_kycDocument>(this.User_kycRepository);
        this.admin = new MongoGenericRepository<Admin, AdminDocument>(this.AdminRepository);
        this.nft = new MongoGenericRepository<Nft, NftDocument>(this.NftRepository);
        this.category = new MongoGenericRepository<Category, CategoryDocument>(this.categoryRepository);
    }
}