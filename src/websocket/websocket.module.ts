import { Module } from "@nestjs/common";
// import { AdminModule } from "src/admin/admin/admin.module";
import { CollectionModule } from "src/app/collection/collection.module";
import { MintModule } from "src/app/mint/mint.module";
import { NftModule } from "src/app/nft/nft.module";
import { ProfileModule } from "src/app/profile/profile.module";
import { ParentModule } from "src/common/services/parent.module";
import { AdminModule } from "../admin/admin/admin.module";
import { CoreServiceWs } from "./core";
import { FactoryServiceWs } from "./factory";
import { MarketerviceWs } from "./market";

@Module({
    imports: [
        ParentModule,
        NftModule,
        MintModule,
        ProfileModule,
        CollectionModule,
        AdminModule
    ],
    providers: [
        CoreServiceWs,
        FactoryServiceWs,
        MarketerviceWs
    ]
})


export class WebsocketModule { }
