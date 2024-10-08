
export interface listNotifOption {
    user?: any,
    address?: String,
    message?: String,
}

export const listNotif = async (option: listNotifOption) => {
    let { user, address, message } = option;

    // for (let i = 0; i < user.followers.length; i++) {
    //     const followerAddress = user.followers[i];
    //     let follower = await this.checkUser({ address: followerAddress });
    //     if (!follower) continue;
    //     follower.notif.push({
    //         address,
    //         event,
    //         message,
    //         seen: false,
    //         time: this.Tools.get_now_time()
    //     })
    // }

}