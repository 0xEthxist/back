import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, Request, UseInterceptors, UploadedFiles, UploadedFile, Logger } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetProfiletDto } from './dto/get-profile.dto';
import { send_response } from 'src/common/response';
import { NotifProfileDto } from './dto/notif-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOption, multerOptionProfile } from 'src/common/storage.config';
import { FollowProfileDto } from './dto/follow-profile.dto';
import { ManualProfiletDto } from './dto/manual-profile.dto';
import { SearchCompleteUserDto } from './dto/search-complete-user.dto';

/**
 * This is a ProfileController class that contains several methods with various HTTP verbs (@Get(), @Put(), @Post()) and decorators.
 * The getProfile method is an async function that returns the profile data based on the query parameters passed to it, 
 * using the ProfileService's getProfile method. This method uses the send_response function to format the API response.
 * The create method is also an async function that creates a new profile by calling profileService.create() and returns the result 
 * as an API response.
 * The uploads_profile method handles file uploads using multer. It stores the uploaded 
 * file in the local filesystem and then returns the upload status (success/failure), along with the file's path.
 * The getNotifications method gets the available notifications for a user through a call to the ProfileService's getNotifications 
 * method and returns the results as an API response.
 * The notif_allow method handles POST requests to update notification settings for a user. The new settings are passed as JSON 
 * objects in the request body.
 * The follow, manualKyc, favorite_collection, searchCompleteUser, checkUsername, 
 * and offers methods all work similarly, each performing a specific task and returning 
 * a response based on the data fetched/modified from the ProfileService.
 * Overall, this class manages user profiles and allows them 
 * to fetch and modify their personal information while providing appropriate API responses.
 */
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get()
  async getProfile(@Query() query: GetProfiletDto, @Request() req) {
    let data = await this.profileService.getProfile(query, req.userAddress);

    return send_response({
      data,
      message: 'get prifile result'
    });
  }

  @Put()
  async create(@Body() createProfileDto: CreateProfileDto, @Request() req) {
    let data = await this.profileService.create(createProfileDto, req.userAddress);

    return send_response({
      data,
      message: 'send profile result'
    });
  }

  @Post('media_uploader')
  @UseInterceptors(FileInterceptor('file', multerOptionProfile))
  uploads_profile(@UploadedFile() file: Express.Multer.File, @Request() req) {

    let filePath: String;
    if (file)
      if (process.env.DEV) {
        filePath = process.env.BASE_URL + ':' + process.env.PORT_RUN + '/profile/' + file.filename;
      } else
        filePath = process.env.BASE_URL + '/profile/' + file.filename;

    return send_response({
      success: file?.filename ? true : false,
      data: file?.filename ? { path: filePath } : { success: false },
      message: 'send profile result'
    });

  }

  @Get('/notifications')
  async getNotifications(@Request() req) {
    let data = await this.profileService.getNotifications(req.userAddress);

    return send_response({
      data,
      message: 'get notifications result'
    });
  }

  @Put('/notif_allow')
  async notif_allow(@Body() createProfileDto: NotifProfileDto, @Request() req) {
    let data = await this.profileService.notif_allow(createProfileDto, req.userAddress);

    return send_response({
      data,
      message: 'notif allow put'
    });
  }

  @Post('/follow')
  async follow(@Body() followProfileDto: FollowProfileDto, @Request() req) {
    let data = await this.profileService.follow(followProfileDto, req.userAddress);

    return send_response({
      data,
      message: 'follow profile'
    });
  }

  @Post('manualKyc')
  async manualKyc(@Body() body: ManualProfiletDto) {

    let data = await this.profileService.givingKyc(body);

    return send_response({
      data,
      message: 'manualKyc'
    });

  }

  @Get('/favorite-collection')
  async favorite_collection(@Request() req) {
    let data = await this.profileService.favorite_collection(req.userAddress);

    return send_response({
      data,
      message: 'favorite collection in profile'
    });
  }

  @Get('/search-complete-users')
  async searchCompleteUser(@Query() searchCompleteUserDto: SearchCompleteUserDto, @Request() req) {
    let data = await this.profileService.searchCompleteUser(searchCompleteUserDto, req.userAddress);

    return send_response({ data })
  }

  @Get('/checkUsername')
  async checkUsername(@Query('username') username: string, @Request() req) {
    let data = await this.profileService.checkUsername(username);


    return send_response({
      data: data ? true : false,
      message: 'favorite collection in profile'
    });
  }

  @Get('/offers')
  async offers(@Request() req) {
    let data = await this.profileService.offers(req.userAddress);


    return send_response({
      data: data,
      message: 'offers in profile'
    });
  }

}
