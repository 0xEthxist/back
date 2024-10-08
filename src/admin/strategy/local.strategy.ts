import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import express = require("express");

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ passReqToCallback: true })
    }

    async validate(req: Request, username: string, password: string, headers:Headers): Promise<any> {
        const admin = await this.authService.validateAdmin(username, password, req.body);
        if (!admin) {
            throw new UnauthorizedException({
                message: "You have entered a wrong username or password"
            });
        }
        return admin;
    }
}