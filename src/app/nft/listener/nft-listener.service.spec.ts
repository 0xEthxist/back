import { Test, TestingModule } from '@nestjs/testing';
import { NftListenerService } from './nft-listener.service';

describe('NftListenerService', () => {
  let service: NftListenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftListenerService],
    }).compile();

    service = module.get<NftListenerService>(NftListenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
