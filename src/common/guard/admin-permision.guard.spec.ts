import { AdminPermisionGuard } from './admin-permision.guard';

describe('AdminPermisionGuard', () => {
  it('should be defined', () => {
    expect(new AdminPermisionGuard()).toBeDefined();
  });
});
