import { AuthService } from './auth.service';
import { Controller, Request, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminLoginDto } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { send_response } from 'src/common/response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post(`/login`)
    async login(@Body() adminLoginDto: AdminLoginDto, @Request() req) {
        let data = await this.authService.login(req.user);
        return send_response({ data });
    }

    @Post(`/welcome`)
    async welcome(@Request() req) {
        let data = await this.authService.welcome(req.userAddress);

        return send_response({ data });
    }
}