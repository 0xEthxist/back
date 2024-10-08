import { Inject } from '@nestjs/common';

export const marketHandelerDecorator: string[] = new Array<string>();

export function Logger(prefix: string = '') {
    if (!marketHandelerDecorator.includes(prefix)) {
        marketHandelerDecorator.push(prefix);
    }
    return Inject(`LoggerService${prefix}`);
}