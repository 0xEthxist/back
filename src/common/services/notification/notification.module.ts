import { forwardRef, Module } from "@nestjs/common";
import { NftModule } from "src/app/nft/nft.module";
import { ParentModule } from "src/common/services/parent.module";
import { NotificationService } from "./notification.service";

@Module({
    imports: [
        ParentModule
    ],
    providers: [
        NotificationService
    ],
    exports: [NotificationService],
})


export class NotificationModule {}
