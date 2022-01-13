import { HttpException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { Phone } from './phone.entity';
import { PhonesRepository } from './phones.repository';
import { PhonesService } from './phones.service';

describe('PhonesService', () => {
  let phonesService: PhonesService;
  let phonesRepository: PhonesRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PhonesService,
        {
          provide: getRepositoryToken(PhonesRepository),
          useFactory: () => ({
            find: jest.fn(),
            createPhone: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          }),
        },
      ],
    }).compile();

    phonesService = moduleRef.get(PhonesService);
    phonesRepository = moduleRef.get<PhonesRepository>(PhonesRepository);
  });

  describe('getting all phones', () => {
    const phone = new Phone();
    phone.number = '+380112234567';
    const phones = [phone];

    it('should return phones', async () => {
      jest.spyOn(phonesRepository, 'find').mockResolvedValue(phones);
      const fetchedPhones = await phonesService.getPhones();
      expect(fetchedPhones).toEqual(phones);
    });
  });

  describe('getting phone with specific id', () => {
    describe('getting existing phone', () => {
      const phone = new Phone();
      it('should return phone', async () => {
        jest.spyOn(phonesRepository, 'findOne').mockResolvedValue(phone);
        const fetchedPhone = await phonesService.getPhone('12');
        expect(fetchedPhone).toEqual(phone);
        expect(phonesRepository.findOne).toHaveBeenCalled();
      });
    });
    describe('getting not existing phone', () => {
      it('should return error', async () => {
        jest.spyOn(phonesRepository, 'findOne').mockResolvedValue(undefined);

        try {
          await phonesService.getPhone('13');
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });

  describe('creating phone', () => {
    const phone = new Phone();
    const createPhoneDto: CreatePhoneDto = new CreatePhoneDto();
    createPhoneDto.number = '+380112234567';

    it('should return new phone', async () => {
      jest.spyOn(phonesRepository, 'createPhone').mockResolvedValue(phone);
      const newPhone = await phonesService.createPhone(createPhoneDto);
      expect(newPhone).toEqual(phone);
      expect(phonesRepository.createPhone).toHaveBeenCalled();
      expect(phonesRepository.createPhone).toHaveBeenCalledWith(createPhoneDto);
    });
  });

  describe('deleting phone', () => {
    describe('deleting existing phone', () => {
      const deleteResult: DeleteResult = new DeleteResult();
      deleteResult.affected = 1;
      it('the phone should be deleted', async () => {
        jest.spyOn(phonesRepository, 'delete').mockResolvedValue(deleteResult);
        await phonesService.deletePhone('12');
        expect(phonesRepository.delete).toHaveBeenCalled();
        expect(phonesRepository.delete).toHaveBeenCalledWith('12');
      });
    });

    describe('deleting not existing phone', () => {
      const deleteResult: DeleteResult = new DeleteResult();
      deleteResult.affected = 0;
      it('should be thrown an error', async () => {
        jest.spyOn(phonesRepository, 'delete').mockResolvedValue(deleteResult);
        try {
          await phonesService.deletePhone('13');
          expect(phonesRepository.delete).toThrowError();
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
        }
      });
    });
  });

  describe('are phones arrays the same', () => {
    describe('are the same', () => {
      const phone = new Phone();
      phone.number = '+380112234567';
      const phones1 = [phone];
      const phones2 = [phone];
      it('should return true', () => {
        const isTheSame = phonesService.arePhonesArraysTheSame(
          phones1,
          phones2,
        );
        expect(isTheSame).toEqual(true);
      });
    });
    describe('are not the same', () => {
      const phone1 = new Phone();
      phone1.number = '+380112234567';
      const phone2 = new Phone();
      phone2.number = '+380112234562';
      const phones1 = [phone1];
      const phones2 = [phone2];
      it('should return false', () => {
        const isTheSame = phonesService.arePhonesArraysTheSame(
          phones1,
          phones2,
        );
        expect(isTheSame).toEqual(false);
      });
    });
  });

  describe('deleting multiple phones', () => {
    const phones = [new Phone()];
    const deleteResult = Promise.resolve(new DeleteResult());
    it('phones should be deleted', async () => {
      const deleteSpy = jest
        .spyOn(phonesRepository, 'delete')
        .mockReturnValue(deleteResult);
      await phonesService.deletePhones(phones);
      expect(deleteSpy).toHaveBeenCalledTimes(phones.length);
    });
  });
});
