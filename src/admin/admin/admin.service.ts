import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType } from 'mongoose';
import { OptionService } from 'src/common/services/option/option.service';
import { ParentService } from 'src/common/services/parent.service';
import { IDataServices } from 'src/common/services/repository/abstract-data-services';
import { Admin, AdminDocument, AdminLogName, AdminType } from 'src/schemas/admin.schema';
import { TrashLogNature } from 'src/schemas/trash.schema';
import { User_kycDocument } from 'src/schemas/user_kyc.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { EditAdminDto } from './dto/edit-admin.dto';
import { HashService } from './hash.service';
import { AdminAddedOption, AdminRemovedOption } from './interface/admin';
import { payloadAdmin } from './interface/payload-jwt';

@Injectable()
export class AdminService {

    constructor(
        private parentService: ParentService,
        private optionService: OptionService,
        private dataServices: IDataServices,
        private hashService: HashService
    ) { }

    async getUserByUsername(username: string, req: any) {

        let user = await this.parentService.adminModel.findOne({
            username
        })
            .exec();

        return { user }
    }

    /**
     * get one admin
     * @param {FilterQuery<AdminDocument>}adminData
     */
    getAdmin = async (adminData: FilterQuery<AdminDocument>, projection?: ProjectionType<AdminDocument> | null) => {

        // CaseInsensitive address admin
        if (adminData?.address)
            adminData.address = this.parentService.Tools.regexCaseInsensitive(adminData.address)

        let admin = await this.parentService.adminModel.findOne(adminData, projection);
        if (!admin)
            this.parentService.Error('admin not exist', 400)
        return admin;
    }

    /**
     * Edit the admins added by the owner
     * @param {EditAdminDto}editAdminDto 
     * @param {Admin}admin 
     */
    async editAdmin(editAdminDto: EditAdminDto, admin: payloadAdmin) {
        let { address, adminId, name, password, username, permision } = editAdminDto,
            nowTime = this.parentService.Tools.get_now_time();

        // get admin
        if (adminId)
            var queryAdmin = await this.getAdmin({ _id: adminId });
        else {
            // create a new viewer
            var queryAdmin = new this.parentService.adminModel();
            queryAdmin.address = address;
            queryAdmin.admin_type = AdminType.viewer;
            queryAdmin.time_added = nowTime;
            queryAdmin.maker = admin._id;
            queryAdmin.logs.push({
                logTime: nowTime.toString(),
                log: {
                    name: AdminLogName.adminAdded,
                    action: 'added viewer by manager'
                }
            })
        }
        // modify {username and password and name}
        queryAdmin.username = username;
        if (password)
            queryAdmin.password = await this.hashService.hashPassword(password);
        queryAdmin.name = name;
        queryAdmin.last_update = {
            time: nowTime,
            by: admin._id
        }
        if (permision)
            queryAdmin.permision = permision;
        await queryAdmin.save().catch(e => {
            Logger.error(e);
            this.parentService.Error('Username and address must be unique', 400)
        })

        let adminTemp = queryAdmin.toObject();
        delete adminTemp.password;

        return {
            admin: adminTemp
        }
    }

    getViewerPermisions(admin: payloadAdmin) {

        return {
            viewerPermisions: this.optionService.viewerPermisions
        }
    }

    /**
     * get all admin
     * @param {payloadAdmin} admin
     */
    getAdmins = async (admin: payloadAdmin) => {


        let admins = await this.dataServices.admin.getAll({}, { password: 0, last_login: 0 });

        return { admins };
    }

}
