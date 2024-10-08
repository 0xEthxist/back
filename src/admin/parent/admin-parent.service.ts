import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ParentService } from 'src/common/services/parent.service';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { setAdminLogInput } from './interface/seta-dmin-log';

@Injectable()
export class AdminParentService {
    constructor(
        private dataServices: IDataServices,
        private parentService: ParentService
    ) { }


    async setAdminLog(inputs: setAdminLogInput) {
        let {
            adminId,
            name,
            action
        } = inputs,
            nowTime = this.parentService.Tools.get_now_time();

        await this.dataServices.admin.findByIdAndUpdate(adminId, {
            $push: {
                'logs': {
                    log: {
                        name: name,
                        action: action //'show users'
                    },
                    logTime: nowTime
                }
            }
        })
    }

}
