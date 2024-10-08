import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ParentService } from 'src/common/services/parent.service';
import { Admin, AdminDocument } from 'src/schemas/admin.schema';
import { AdminService } from '../admin/admin.service';
import { HashService } from '../admin/hash.service';
import { payloadAdmin } from '../admin/interface/payload-jwt';

@Injectable()
export class AuthService {
    constructor(
        private parentService: ParentService,
        private adminService: AdminService,
        private hashService: HashService,
        private jwtService: JwtService
    ) { }

    async validateAdmin(username: string, pass: string, body?: object): Promise<any> {
        const admin = await this.adminService.getAdmin({ username }, ['username', 'password', 'address', 'permision', 'admin_type', 'name'])
        // #TODO: if (admin && (await this.hashService.comparePassword(pass, admin.password))) {

        if (admin) {
            const { password, ...result } = admin;

            return result;
        }
        return null;
    }


    async login(adminDoc: any) {
        let admin = adminDoc._doc;

        const payload: payloadAdmin = {
            username: admin.username,
            _id: admin._id,
            address: admin.address,
            name: admin.name,
            type: admin.admin_type,
            permision: admin.permision
        };

        let token = this.jwtService.sign(payload)
        // update last login data 
        await this.parentService.adminModel.updateOne({ _id: admin._id }, {
            last_login: {
                time: this.parentService.Tools.get_now_time().toString(),
                token
            }
        })

        return {
            access_token: token
        };
    }

    async welcome(userAddress: String) {

        let admin = await this.adminService.getAdmin({ address: userAddress });

        if (!admin)
            return this.parentService.Error('This account is not valid', 403);

        return {
            name: admin.name,
            message: `welcome ${admin.name}`
        }
    }
}