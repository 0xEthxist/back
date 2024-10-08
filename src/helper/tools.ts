
import { ethers, Wallet } from 'ethers';
import * as fs from 'fs';
import { Nft, NftActions, NftCollaborator, NftOffers, nftPath, OfferStatus } from '../schemas/nft.schema';
import { User_kyc } from 'src/schemas/user_kyc.schema';
import * as jwt from 'jsonwebtoken';

export class _Tools {
    static instace: _Tools;
    public signer: Wallet;

    static get_instace() {
        if (!_Tools.instace) {
            _Tools.instace = new _Tools;
        }
        return _Tools.instace;
    }

    public id = 1;

    get_now_time() {
        return Math.floor(Date.now() / 1000);
    }

    extract_tokenId = (scResponse) =>
        scResponse && scResponse.res && scResponse.res.events && scResponse.res.events.Transfer ?
            scResponse.res.events.Transfer.returnValues._tokenId :
            false;

    extract_collection_address = (scResponse) =>
        scResponse && scResponse.events && scResponse.events.CreatedCollection ?
            scResponse.res.events.CreatedCollection.returnValues.Collection :
            false;

    getAbi(addr: any) {
        let jsonfile = fs.readFileSync(addr, { encoding: 'utf8' })
        return JSON.parse(jsonfile);
    }

    // This function takes a timestamp value and returns the corresponding date time formatted string
    // Argument: stamp - a number or string representing unix timestamp value in seconds
    // Return: A string representation of the date and time in local time zone
    timeStamp_2_date = (stamp: any) => (new Date(+stamp * 1000)).toLocaleString();

    regexCaseInsensitive(value: string) {
        return { $regex: new RegExp('^' + value?.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') };
    }

    regexLikeQuery = (value: string) => ({ $regex: new RegExp('^.*' + value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '.*$', 'i') })

    getUiName(user: User_kyc): String {
        if (!user)
            return 'someone'
        return user.username ? '@' + user.username : user.address.slice(0, 8) + '...';
    }

    nftUrlMaker = (nftDB: Nft, collectionName: String) => {
        if (nftDB.category)
            var url = `/${nftDB.creator}/${collectionName}/${nftDB.tokenId}`
        else
            var url = `/${nftDB.creator}/${nftDB.tokenId}`

    }

    sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    makeSignBlockchain = async (voucher: {}, types: {}) => {
        this.signer = new ethers.Wallet(process.env.privateKeyBlockchain);
        const domain: object = {
            name: 'Artaniom',
            version: "1",
            verifyingContract: process.env.core,
            chainId: process.env.chainId
        }

        const signature: string = await this.signer._signTypedData(domain, types, voucher);

        return signature;

    }

    makeVoucher = async (voucher: {}, types: {}) => {
        let signature = await this.makeSignBlockchain(voucher, types);
        return {
            ...voucher,
            signature
        }
    }

    makeSign = (message: any) => {
        if (typeof message == 'object')
            message = JSON.stringify(message)
        return jwt.sign(message!, process.env.privateKeySIGN, { algorithm: 'HS256' });
    }

    recoverySign = (token) => jwt.verify(token, process.env.privateKeySIGN);

    collaboratorRequire = (collaborators: NftCollaborator[]): { success: boolean, message?: string } => {
        if (!collaborators || collaborators.length > 5)
            return { success: false, message: 'The number of collaborator must be less than or equal to 5' };
        let sum = 0;
        if (collaborators?.length > 0) {
            collaborators.forEach(collaborator => {
                sum += collaborator.share;
                if (collaborator.share % 5 != 0 || collaborator.share == 0)
                    return { success: false, message: 'Each shareholder`s share must be a multiple of 5' };
            })
            if (sum != 100)
                return { success: false, message: 'The sum of shares must be equal to 100' };

        }

        return { success: true };

    }


    configCollaborator(collaborators: NftCollaborator[]) {
        let _collaborators = [];
        for (let i = 0; i < collaborators.length; i++)
            if (collaborators[i]?.address)
                _collaborators.push([collaborators[i].share, collaborators[i].address])

        const encodedCollaborators: string = ethers.utils.defaultAbiCoder.encode(["tuple(uint96, address)[]"], [_collaborators]);

        return encodedCollaborators;

    }

    nextProperty<T>(enumMap, caseINEnum) {

        let flag = false;

        let result = Object.keys(enumMap).find(key => {
            if (flag)
                return key;

            if (key == caseINEnum)
                flag = true;
        });

        return result;

    }

    getExistOffer(offers: NftOffers[]): NftOffers {
        if (offers.length > 0)
            if (offers.slice(-1)[0].status == OfferStatus.active)
                return offers.slice(-1)[0];
        return;
    }

    filterField_Array_Of_Object<T, K extends HasIncludes<T>>(customArray: T[], propName: K) {
        let arrayResult = [];

        customArray.map((obj: T) => {
            arrayResult.push(obj[propName]);
        })

        return arrayResult;
    }

    reversSort = (sort: Object) => {

        var kArray = Object.keys(sort);        // Creating array of keys
        var vArray = Object.values(sort);      // Creating array of values


        let newSort: Object = {};
        newSort[kArray[0]] = +vArray[0] * -1;

        return newSort;
    }

    createCopy<T>(objectToCopy: T): T {
        return (JSON.parse(JSON.stringify(objectToCopy)));
    }

    createUiUsername(userKey) {
        return userKey.includes('0x') ? (userKey.slice(0, 8) + '...') : '@' + userKey;
    }

    createMessageNftLogs(nft_path: nftPath) {
        let message = '';
        switch (nft_path.action) {

            case NftActions.transfer:
                message = `Transfered from `
                break;

            case NftActions.buy:
                message = `Bought by `
                break;

            case NftActions.fix:
                message = `Listed in fixed price market by `
                break;

            case NftActions.reserve:
                message = `Reserve Auction set by `
                break;

            case NftActions.auction:
                message = `Standard Auction set by `
                break;

            case NftActions.mint:
                message = `Minted by `
                break;

            default:
                break;
        }
        return message;
    }

}

export default _Tools.get_instace();
// export default new __Tools();

type Match<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
// we define these types that will filter keys whose values are arrays
type HasIncludes<T> = Match<T, { includes: (x: any) => boolean }>;
// and a type that will extract the generic type of the array value
type IncludeType<T, K extends keyof T> = T[K] extends { includes: (value: infer U) => boolean } ? U : never;