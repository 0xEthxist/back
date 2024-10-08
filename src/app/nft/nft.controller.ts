import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, Put } from '@nestjs/common';
import { NftService } from './nft.service';
import { ApiTags } from '@nestjs/swagger';
import { send_response } from 'src/common/response';
import { GetNftDto } from './dto/get-nft-dto';
import { BuyLazyMintDto, FixNftDto } from './dto/fix-nft.dto';
import { AuctionNftDto } from './dto/auction-nft.dto';
import { CancelNftDto } from './dto/cancel-nft.dto';
import { LikeNftDto } from './dto/like-nft.dto';
import { BuyNftDto } from './dto/buy-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { DeleteNftDto } from './dto/delete-nft.dto';

@ApiTags('Nft')
@Controller('nft')
/**
 * The above code defines a TypeScript class named NftController, which is used to handle HTTP requests related to NFT (Non-Fungible Tokens) functionality
 */
export class NftController {
  constructor(private readonly nftService: NftService) { }

  @Get()
  async getnft(@Query() getNftDto: GetNftDto, @Request() req) {
    let data = await this.nftService.getNft({ getNftDto, address: req.userAddress, req });

    return send_response({ data })
  }

  @Post('like')
  async like(@Body() likeNftDto: LikeNftDto, @Request() req) {

    let data = await this.nftService.likeNft(likeNftDto, req.userAddress);

    return send_response({ data })
  }

  @Get('eth-price')
  async ethPrice(@Request() req) {

    let data = await this.nftService.ethPrice(req.userAddress);

    return send_response({ data })
  }

  @Post('buy-lazy-mint')
  async buyLazy(@Body() buyLazyMintDto: BuyLazyMintDto, @Request() req) {

    let data = await this.nftService.buyLazy(buyLazyMintDto, req.userAddress);

    return send_response({ data })
  }

  /**
   * edit price lazy item route
   * @param updateNftDto 
   * @param req 
   * @returns 
   */
  @Put('edit')
  async edit(@Body() updateNftDto: UpdateNftDto, @Request() req) {

    let data = await this.nftService.edit(updateNftDto, req.userAddress);

    return send_response({ data })
  }

  /**
   * delete lazy item route
   * @param deleteNftDto 
   * @param req 
   * @returns 
   */
  @Delete('delete')
  async delete(@Body() deleteNftDto: DeleteNftDto, @Request() req) {

    let data = await this.nftService.delete(deleteNftDto, req.userAddress, true);

    return send_response({ data })
  }

}
