import { Body, Controller, Get, Post, Request} from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags } from '@nestjs/swagger';
import { send_response } from 'src/common/response';
import { SetHomeCollection } from './dto/set-home-collection.dto';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  /**
   * End point to get the data of the first page of the market site
   */
  @Get()
  async getHome() {
    let data = await this.homeService.getHome();

    return send_response({ 
      data,
      message: 'home api data'
     })
  }

  /**
   * End point to get the data of the header part and the current user on the site
   * @param req 
   */
  @Get('/header-data')
  async getHeaderUserData(@Request() req) {
    let data = await this.homeService.getHeaderUserData(req.userAddress);
    return send_response({ data })
  }

  @Post('setHomeCollection')
  async setHomeCollection(@Body() body: SetHomeCollection) {

    let data = await this.homeService.setHomeCollection(body);

    return send_response({
      data,
      message: 'setHomeCollection'
    });

  }
}
