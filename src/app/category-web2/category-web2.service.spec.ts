import { Test, TestingModule } from '@nestjs/testing';
import { CategoryWeb2Service } from './category-web2.service';

describe('CategoryWeb2Service', () => {
  let service: CategoryWeb2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryWeb2Service],
    }).compile();

    service = module.get<CategoryWeb2Service>(CategoryWeb2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
