import { Test, TestingModule } from '@nestjs/testing';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { Phone } from './phone.entity';
import { PhonesController } from './phones.controller';
import { PhonesService } from './phones.service';

describe('PhonesController', () => {
  let phonesController: PhonesController;
  let phonesService: PhonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhonesController],
      providers: [
        PhonesService,
        {
          provide: PhonesService,
          useFactory: () => ({
            createPhone: jest.fn(),
            getPhones: jest.fn(),
            getPhone: jest.fn(),
            deletePhone: jest.fn(),
          }),
        },
      ],
    }).compile();

    phonesController = module.get<PhonesController>(PhonesController);
    phonesService = module.get<PhonesService>(PhonesService);
  });

  describe('creating new phone', () => {
    const createPhoneDto: CreatePhoneDto = new CreatePhoneDto();
    createPhoneDto.number = '+380112234567';

    const phone = new Phone();
    phone.number = '+380112234567';

    it('should return new phone', async () => {
      jest.spyOn(phonesService, 'createPhone').mockResolvedValue(phone);
      const newPhone = await phonesController.createPhone(createPhoneDto);

      expect(newPhone).toEqual(phone);
    });
  });

  describe('getting phones', () => {
    const phones = [new Phone()];
    it('should return phones', async () => {
      jest.spyOn(phonesService, 'getPhones').mockResolvedValue(phones);
      const fetchedPhones = await phonesController.getPhones();
      expect(fetchedPhones).toEqual(phones);
    });
  });

  describe('getting specific phone with specific id', () => {
    it('should return phone with specific id', async () => {
      jest.spyOn(phonesService, 'getPhone').mockResolvedValue(new Phone());
      const fetchedPhone = await phonesController.getPhone('12');
      expect(fetchedPhone).toEqual(new Phone());
      expect(phonesService.getPhone).toHaveBeenCalled();
      expect(phonesService.getPhone).toHaveBeenCalledWith('12');
    });
  });

  describe('deleting phone', () => {
    it('phone should be deleted', () => {
      phonesController.deletePhone('12');
      expect(phonesService.deletePhone).toHaveBeenCalled();
      expect(phonesService.deletePhone).toHaveBeenCalledWith('12');
    });
  });
});
