import { Test, TestingModule } from '@nestjs/testing';
import { CategoryWeb2Controller } from './category-web2.controller';
import { CategoryWeb2Service } from './category-web2.service';

describe('CategoryWeb2Controller', () => {
  let controller: CategoryWeb2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryWeb2Controller],
      providers: [CategoryWeb2Service],
    }).compile();

    controller = module.get<CategoryWeb2Controller>(CategoryWeb2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
