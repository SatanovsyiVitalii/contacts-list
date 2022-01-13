import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePhoneDto, CreatePhonesDto } from './dto/create-phone.dto';
import { Phone } from './phone.entity';
import { PhonesRepository } from './phones.repository';

describe('PhonesRepository', () => {
  let phonesRepository: PhonesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhonesRepository],
    }).compile();

    phonesRepository = module.get<PhonesRepository>(PhonesRepository);
  });

  describe('creating new phone', () => {
    const createPhoneDto: CreatePhoneDto = new CreatePhoneDto();
    const phone: Phone = new Phone();
    createPhoneDto.number = '+380112234567';
    phone.number = '+380112234567';

    it('should return new phone', async () => {
      const createSpy = jest
        .spyOn(phonesRepository, 'create')
        .mockReturnValue(phone);
      const saveSpy = jest
        .spyOn(phonesRepository, 'save')
        .mockResolvedValue(phone);

      const newPhone = await phonesRepository.createPhone(createPhoneDto);

      expect(newPhone).toEqual(phone);
      expect(createSpy).toHaveBeenCalledWith(phone);
      expect(saveSpy).toHaveBeenCalledWith(phone);
    });
  });

  describe('creating multiple phones', () => {
    const phones = new CreatePhonesDto();
    const phone = new Phone();
    phone.number = '+380112234567';

    phones.phones = [phone];

    it('should return array of new phones', async () => {
      jest.spyOn(phonesRepository, 'createPhone').mockResolvedValue(phone);
      const newPhones = await phonesRepository.createPhones(phones);
      expect(newPhones).toEqual(phones.phones);
    });
  });
});
