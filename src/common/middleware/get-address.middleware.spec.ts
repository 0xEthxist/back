import { GetAddressMiddleware } from './get-address.middleware';

describe('GetAddressMiddleware', () => {
  it('should be defined', () => {
    expect(new GetAddressMiddleware()).toBeDefined();
  });
});
