import { CanActivate, ExecutionContext, HttpException, Injectable, mixin } from '@nestjs/common';
import { Observable } from 'rxjs';
import { payloadAdmin } from '../../admin/admin/interface/payload-jwt';
import { AdminPermisionMethod, AdminType } from '../../schemas/admin.schema';

export const RolePermisionGuard = (_method: string): any => {
  class AdminPermisionGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();

      // get user from request 
      let user: payloadAdmin = req.user;

      // if user is viewer must checked with database permistions
      if (user.type == AdminType.viewer) {
        if (this.hasViewerPermision(user))
          return true
      } else {
        if (this.hasAdminPermision(user))
          return true;
      }

      throw new HttpException({
        success: false,
        message: ` you don't have permission to access ${_method}`
      }, 403);
    }

    hasViewerPermision = (user: payloadAdmin): boolean => {
      if (user?.permision.find(p => (p._method == _method && p.allow == true)))
        return true;
      return false;
    }

    hasAdminPermision = (user: payloadAdmin): boolean => {
      if (AdminPermisions[user.type - 1].includes(_method.toString()))
        return true;
      return false;
    }
  }

  const _guard = mixin(AdminPermisionGuard);
  return _guard;
}

export const permisionAdmin1 = [];
export const permisionAdmin2 = [...permisionAdmin1, AdminPermisionMethod.toggleInInterface];
export const permisionAdmin3 = [
  ...permisionAdmin2,
  AdminPermisionMethod.showUsers,
  AdminPermisionMethod.makeLazyPermision,
  AdminPermisionMethod.getAllCollection,
  AdminPermisionMethod.changeHomeCollection,
  AdminPermisionMethod.showItems,
];
export const permisionAdminManager = [
  AdminPermisionMethod.editAdmin,
  AdminPermisionMethod.getCreateAdmin,
  AdminPermisionMethod.postCreateAdmin,
  AdminPermisionMethod.showUsers,
  AdminPermisionMethod.makeLazyPermision,
  AdminPermisionMethod.getAllCollection,
  AdminPermisionMethod.changeHomeCollection,
  AdminPermisionMethod.showItems,
  AdminPermisionMethod.toggleInInterface,
  AdminPermisionMethod.getAdmins,
];

export const AdminPermisions = [
  permisionAdmin1,
  permisionAdmin2,
  permisionAdmin3,
  permisionAdminManager
]
// export const permisionAdminViewer = [AdminPermisionMethod.editAdmin];


// @Injectable()
// export class AdminPermisionGuard implements CanActivate {
//   constructor(private _method: any) { }
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const ctx = context.switchToHttp();
//     const req = ctx.getRequest();

//     // get user from request
//     let user: payloadAdmin = req.user;

//     // if user is viewer must checked with database permistions
//     if (user.type == AdminType.viewer) { }
//     else {
//       if (AdminPermisions[user.type + 1].includes(this._method))
//     }
//     return true;
//   }
// }
