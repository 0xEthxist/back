import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Patch, UseGuards, Request, Query, Logger } from '@nestjs/common';
import { MintService } from './mint.service';
import { CreateLazyMintDto, CreateMintDto } from './dto/create-mint.dto';
import { UpdateMintDto } from './dto/update-mint.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiCookieAuth, ApiHeader, ApiOAuth2, ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { multerOption } from 'src/common/storage.config';
import { Express } from 'express'
import { send_response, ResponseArg } from 'src/common/response';
import { UserKycGuard } from 'src/common/guard/user_kyc.guard';
import { GetMintDto } from './dto/get-mint.dto';
import { FileGuard } from 'src/common/guard/file.guard';

/**
 * In this controller, we use it to handle mint and lease mint endpoints and get the required data on the mint page.
 */
@ApiTags('mint')
@Controller('mint')
export class MintController {
  constructor(private readonly mintService: MintService) { }

  /**
   * mint end point
   * @param createMintDto 
   * @param file 
   * @param req 
   * @returns 
   */
  @Post()
  @UseGuards(UserKycGuard)
  @UseInterceptors(FileInterceptor('file', multerOption))
  async create(@Body() createMintDto: CreateMintDto, @UploadedFile() file: Express.Multer.File, @Request() req): Promise<ResponseArg> {
    Logger.log('befor min service');
    let data = await this.mintService.mint(createMintDto, file, req.user);
    Logger.log('after mint save data');

    if (!data.success)
      return send_response({ data, success: data.success });

    return send_response({ data });
  }

  // get mint page data => category web2
  @Get()
  @UseGuards(UserKycGuard)
  async get(@Request() req) {
    const [category_web2] = await Promise.all([
      this.mintService.get_category_web2()
    ]);


    return send_response({
      data: {
        category_web2,
      },
      message: 'get data for mint page'
    });
  }

  /**
   * lazy mint end point
   * @param createMintDto 
   * @param file 
   * @param req 
   * @returns 
   */
  @Post('lazymint')
  @UseGuards(UserKycGuard)
  @UseInterceptors(FileInterceptor('file', multerOption))
  async lazyMint(@Body() createMintDto: CreateLazyMintDto, @UploadedFile() file: Express.Multer.File, @Request() req): Promise<ResponseArg> {
    Logger.log('befor lazy min service');
    let data = await this.mintService.lazyMint(createMintDto, file, req.user);
    Logger.log('after lazy mint save data');

    if (!data.success)
      return send_response({ data, success: data.success });

    return send_response({ data });
  }

}
