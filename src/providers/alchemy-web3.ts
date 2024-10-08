
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { ConfigService } from '@nestjs/config';
import web from 'web3'
const axios = require('axios');
import * as fs from 'fs';
import { JwtPayload } from "jsonwebtoken";

export class AlchemyWeb3 {
    static instace;
    static configService: ConfigService;

    static get_instace() {
        if (!AlchemyWeb3.instace) {
            AlchemyWeb3.instace = new AlchemyWeb3();
        }
        return AlchemyWeb3.instace;
    }

    public web3 = null;

    constructor() {
        // if (configService)
        //     this.web3 = configService.get<String>('GOERLI_URL')

    }

    public recovery(sign: string | JwtPayload, role?: string) {
        if (!this.web3)
            this.getWeb3();

        try {
            let message = role ? process.env.SIGN_ADMIN_MESSACE : process.env.SIGN_MESSACE;
            return this.web3.eth.accounts.recover(message, sign)
        } catch (error) {
            return false;
        }

    }

    public getnft(option: { owner: string }) {
        if (!this.web3)
            this.getWeb3();

        try {
            return this.web3.alchemy.getNfts(option);
        } catch (error) {
            return false;
        }

    }

    public hexToNumber(hex: any) {
        if (!this.web3)
            this.getWeb3();

        try {
            return this.web3.utils.hexToNumber(hex)
        } catch (error) {
            return false;
        }

    }

    public getWeb3() {
        this.web3 = createAlchemyWeb3(process.env.GOERLI_URL);
        return this.web3;
    }

    public getOwner = (tokenId: Number, contractAddr?: String): Promise<any> => {
        if (!contractAddr)
            contractAddr = process.env.CONTRACT_ADDRESS;

        const baseURL = `${process.env.GOERLI_URL}/getOwnersForToken`;

        var config = {
            method: 'get',
            url: `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}`,
            headers: {}
        };

        return axios(config)
            .then(response => response.data)
            .catch(error => error);
    }

    async getCollection(collectionAddress) {
        // return true;

        let colleciton = this.contractGeter({
            abi: 'secondary_factory',
            address: process.env.secondary_factory
        });

        if (colleciton) {
            let data = await colleciton.methods.getCollectionInfo(collectionAddress).call();

            if (data && data.owner)
                return data;

            return false;
        }

        return false;
    }

    contractGeter(option: ContractGeterOption) {
        var web3 = new web(process.env.GOERLI_URL);
        let abi = this.getAbi(option.abi)


        let contract = new web3.eth.Contract(abi, option.address);

        return contract;

    }

    getAbi(abiName: String) {
        let json = fs.readFileSync('./src/common/abi/' + abiName + '.json', { encoding: 'utf8' });
        return JSON.parse(json);
    }

    getWeb3Pack() {
        return web;
    }

    getFromWei(weiPrice: string) {
        return this.getWeb3().utils.fromWei(weiPrice);
    }

}

export interface ContractGeterOption {
    abi: any,
    address: any,
    url?: string,
}

var instace = new AlchemyWeb3();

// export default AlchemyWeb3.get_instace()
export default instace;