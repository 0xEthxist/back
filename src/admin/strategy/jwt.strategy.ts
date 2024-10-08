import { jwtConstants } from './constants';

import {
    ExtractJwt,
    Strategy
} from 'passport-jwt';
import {
    PassportStrategy
} from '@nestjs/passport';
import {
    Injectable
} from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
            passReqToCallback: true
        });
    }

    async validate(req: any, payload: any) {
        return {...payload}
    }
}