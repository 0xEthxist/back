import { UserKycMiddleware } from './user_kyc.middleware';

describe('UserKycMiddleware', () => {
  it('should be defined', () => {
    expect(new UserKycMiddleware()).toBeDefined();
  });
});
