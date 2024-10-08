import { UserKycGuard } from './user_kyc.guard';

describe('UserKycGuard', () => {
  it('should be defined', () => {
    expect(new UserKycGuard()).toBeDefined();
  });
});
