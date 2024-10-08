import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ParentService } from 'src/common/services/parent.service';
import { Admin, AdminDocument, AdminLogName } from 'src/schemas/admin.schema';
import { TrashLogNature } from 'src/schemas/trash.schema';
import { AdminService } from '../admin.service';
// import { AdminService } from '../admin.service';
import { AdminAddedOption, AdminRemovedOption } from '../interface/admin';

@Injectable()
export class AdminListenerService {

    constructor(
        private parentService: ParentService,
        // @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        private adminService: AdminService
    ) { }

    /**
     * ********************** listener
     */

    /**
     * admin add
     * @param {AdminAddedOption} adminData
     */
    async adminAdded(adminData: AdminAddedOption): Promise<void> {

        // // get data
        let { accessLevel, newAdmin, scResponse } = adminData,
            nowTime = this.parentService.Tools.get_now_time().toString();

        //create new admin document in db
        await new this.parentService.adminModel({
            admin_type: +accessLevel + 1,
            address: newAdmin,
            time_added: nowTime,
            maker: 'listener',
            logs: [
                {
                    log: {
                        name: AdminLogName.adminAdded,
                        action: scResponse
                    },
                    logTime: nowTime
                }
            ]
        }).save();

    }

    /**
     * admin Remove
     * @param {AdminRemovedOption} adminData
     */
    async adminRemoved(adminData: AdminRemovedOption): Promise<void> {

        // // get data
        let { accessLevel, removedAdmin, scResponse } = adminData,
            nowTime = this.parentService.Tools.get_now_time();

        // get admin
        let admin = await this.adminService.getAdmin({ address: removedAdmin });
        admin.last_update = {
            time: nowTime,
            by: 'listener'
        }
        admin.logs.push({
            log: {
                name: AdminLogName.adminRemoved,
                action: scResponse
            },
            logTime: nowTime.toString()
        })

        // transfer admin to trash
        await new this.parentService.TrashModel({
            log: {
                nature: TrashLogNature.admin,
                details: admin
            }
        }).save();

        // remove admin from admin document
        await admin.deleteOne()

    }
}
