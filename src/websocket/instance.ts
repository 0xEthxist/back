import Web3 from "web3";
import AlchemyWeb3 from 'src/providers/alchemy-web3';

// websocket provider for web3

export default (contractName: String, address: any) => {

    let web3socket = new Web3(new Web3.providers.WebsocketProvider(process.env.GOERLI_WEBSOCKET));

    let abi = AlchemyWeb3.getAbi(contractName);

    return new web3socket.eth.Contract(abi, address);

}