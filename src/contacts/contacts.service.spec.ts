import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Phone } from '../phones/phone.entity';
import { PhonesRepository } from '../phones/phones.repository';
import { Contact } from './contact.entity';
import { ContactsRepository } from './contacts.repository';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { GetContactSortDto } from './dto/get-contact-sort.dto';
import { GetContactsFilterDto } from './dto/get-contacts-filter.dto';
import { PhonesService } from 'src/phones/phones.service';
import { EditContactDto } from './dto/edit-contact.dto';
import { DeleteResult } from 'typeorm';

describe('ContactsService', () => {
  let contactsService: ContactsService;
  let contactsRepository: ContactsRepository;
  let phonesService: PhonesService;
  let phonesRepository: PhonesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        PhonesService,
        {
          provide: getRepositoryToken(ContactsRepository),
          useFactory: () => ({
            getContacts: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createContact: jest.fn(),
            editContact: jest.fn(),
            delete: jest.fn(),
          }),
        },
        {
          provide: getRepositoryToken(PhonesRepository),
          useFactory: () => ({
            delete: jest.fn(),
            createPhones: jest.fn(),
          }),
        },
        {
          provide: PhonesService,
          useFactory: () => ({
            deletePhones: jest.fn(),
            arePhonesArraysTheSame: jest.fn(),
          }),
        },
        {
          provide: PhonesRepository,
          useFactory: () => ({
            createPhones: jest.fn(),
          }),
        },
      ],
    }).compile();

    contactsService = module.get<ContactsService>(ContactsService);
    contactsRepository = module.get<ContactsRepository>(ContactsRepository);
    phonesService = module.get<PhonesService>(PhonesService);
    phonesRepository = module.get<PhonesRepository>(PhonesRepository);
  });

  describe('getting all contacts', () => {
    const contacts = [new Contact()];
    const filterDto = new GetContactsFilterDto();
    const sortDto = new GetContactSortDto();
    it('should return all contacts', async () => {
      jest.spyOn(contactsRepository, 'getContacts').mockResolvedValue(contacts);
      const fetchedContacts = await contactsService.getContacts(
        filterDto,
        sortDto,
      );
      expect(fetchedContacts).toEqual(contacts);
    });
  });

  describe('getting contact by id', () => {
    describe('getting existing contact', () => {
      const contact = new Contact();
      it('should return the contact', async () => {
        jest.spyOn(contactsRepository, 'findOne').mockResolvedValue(contact);
        const fetchedContact = await contactsService.getContactById('12');
        expect(fetchedContact).toEqual(contact);
      });
    });
    describe('getting not existing contact', () => {
      it('should return an error', async () => {
        jest.spyOn(contactsRepository, 'findOne').mockReturnValue(undefined);
        try {
          await contactsService.getContactById('13');
          expect(contactsRepository.findOne).toThrowError();
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });

  describe('creating new contact', () => {
    const contact = new Contact();
    contact.firstName = 'firstName';
    contact.lastName = 'lastName';
    contact.phones = [new Phone()];

    const createContactDto = new CreateContactDto();
    createContactDto.firstName = 'firstName';
    createContactDto.lastName = 'lastName';
    createContactDto.phones = [new Phone()];

    describe('creating contact which doesn"t exist yet', () => {
      it('should create new contact', async () => {
        const findOneSpy = jest
          .spyOn(contactsRepository, 'find')
          .mockResolvedValue([]);
        jest
          .spyOn(contactsRepository, 'createContact')
          .mockResolvedValue(contact);
        const createdContact = await contactsService.createContact(
          createContactDto,
        );

        expect(createdContact).toEqual(contact);
        expect(findOneSpy).toHaveBeenCalled();
      });
    });

    describe('creating already existing contact', () => {
      it('should throw an error', async () => {
        try {
          jest
            .spyOn(contactsService, 'getContactsIfExistsByFirstAndLastName')
            .mockResolvedValue([contact]);
          jest
            .spyOn(phonesService, 'arePhonesArraysTheSame')
            .mockReturnValue(true);
          await contactsService.createContact(createContactDto);
          expect(contactsService.createContact).toThrowError();
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
        }
      });
    });
    describe('creating the contact with existing firstName and lastName, but different phones', () => {
      it('should create new contact', async () => {
        jest
          .spyOn(phonesService, 'arePhonesArraysTheSame')
          .mockReturnValue(false);
        jest
          .spyOn(contactsService, 'getContactsIfExistsByFirstAndLastName')
          .mockResolvedValue([contact]);
        jest
          .spyOn(phonesRepository, 'createPhones')
          .mockResolvedValue([new Phone()]);
        jest
          .spyOn(contactsRepository, 'createContact')
          .mockResolvedValue(contact);
        const createdContact = await contactsService.createContact(
          createContactDto,
        );

        expect(createdContact).toEqual(contact);
      });
    });
  });

  describe('getting contact if exists', () => {
    it('contact exists', async () => {
      const contact = new Contact();
      contact.firstName = 'firstName';
      contact.lastName = 'lastName';
      jest.spyOn(contactsRepository, 'find').mockResolvedValue([contact]);
      const fetchedContacts =
        await contactsService.getContactsIfExistsByFirstAndLastName(contact);
      expect(fetchedContacts).toEqual([contact]);
    });

    it('contact doesn"t exist', async () => {
      const contact = new Contact();
      contact.firstName = 'firstName';
      contact.lastName = 'lastName';
      const findSpy = jest
        .spyOn(contactsRepository, 'find')
        .mockResolvedValue([]);
      const fetchedContacts =
        await contactsService.getContactsIfExistsByFirstAndLastName(contact);
      expect(fetchedContacts).toEqual([]);
      expect(findSpy).toHaveBeenCalled();
    });
  });

  describe('editing contact', () => {
    const phones = [new Phone()];
    const editContactDto = new EditContactDto();
    editContactDto.phones = phones;
    const contact = new Contact();
    const contactResult = new Contact();
    contactResult.phones = phones;

    describe('editing existing contact without phones', () => {
      it('should return updated contact', async () => {
        const editContactSpy = jest
          .spyOn(contactsRepository, 'editContact')
          .mockResolvedValue(new Contact());
        const getContactByIdSpy = jest
          .spyOn(contactsService, 'getContactById')
          .mockResolvedValue(contact);
        jest.spyOn(phonesRepository, 'createPhones').mockResolvedValue(phones);
        jest
          .spyOn(contactsService, 'getContactsIfExistsByFirstAndLastName')
          .mockResolvedValue([]);
        jest
          .spyOn(contactsRepository, 'editContact')
          .mockResolvedValue(contactResult);
        const editedContact = await contactsService.editContact(
          '12',
          editContactDto,
        );
        expect(editedContact).toEqual(contactResult);
        expect(editContactSpy).toHaveBeenCalledWith(contact, editContactDto, [
          new Phone(),
        ]);
        expect(getContactByIdSpy).toHaveBeenCalledWith('12');
      });
    });
    describe('editing existing contact with phones', () => {
      contact.phones = phones;
      it('should return updated contact', async () => {
        const editContactSpy = jest
          .spyOn(contactsRepository, 'editContact')
          .mockResolvedValue(contact);
        const deletePhoneSpy = jest
          .spyOn(phonesService, 'deletePhones')
          .mockResolvedValue(undefined);
        const getContactByIdSpy = jest
          .spyOn(contactsService, 'getContactById')
          .mockResolvedValue(contact);
        const createPhonesSpy = jest
          .spyOn(phonesRepository, 'createPhones')
          .mockResolvedValue(phones);
        jest
          .spyOn(contactsService, 'getContactsIfExistsByFirstAndLastName')
          .mockResolvedValue([]);
        const editedContact = await contactsService.editContact(
          '12',
          editContactDto,
        );
        expect(editedContact).toEqual(contact);
        expect(editContactSpy).toHaveBeenCalledWith(contact, editContactDto, [
          new Phone(),
        ]);
        expect(deletePhoneSpy).toHaveBeenCalled();
        expect(getContactByIdSpy).toHaveBeenCalled();
        expect(createPhonesSpy).toHaveBeenCalled();
      });
    });

    describe('editing contact, but contact with such data already exists', () => {
      contact.phones = phones;
      it('should throw an error', async () => {
        jest
          .spyOn(contactsRepository, 'editContact')
          .mockResolvedValue(contact);
        jest.spyOn(phonesService, 'deletePhones').mockResolvedValue(undefined);
        jest
          .spyOn(contactsService, 'getContactById')
          .mockResolvedValue(contact);
        jest.spyOn(phonesRepository, 'createPhones').mockResolvedValue(phones);
        jest
          .spyOn(contactsService, 'getContactsIfExistsByFirstAndLastName')
          .mockResolvedValue([contact]);
        jest
          .spyOn(phonesService, 'arePhonesArraysTheSame')
          .mockReturnValue(true);
        try {
          await contactsService.editContact('12', editContactDto);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
        }
      });
    });

    describe('editing not existing contact', () => {
      it('should throw an error', async () => {
        try {
          const getContactByIdSpy = jest
            .spyOn(contactsService, 'getContactById')
            .mockResolvedValue(undefined);
          await contactsService.editContact('13', editContactDto);
          expect(getContactByIdSpy).toThrowError();
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });

  describe('deliting contact', () => {
    describe('deleting existing contact', () => {
      it('should deleted', async () => {
        const deleteResult = new DeleteResult();
        deleteResult.affected = 1;
        const phonesRepositoryDeleteSpy = jest
          .spyOn(contactsRepository, 'delete')
          .mockResolvedValue(deleteResult);
        await contactsService.deleteContact('12');
        expect(phonesRepositoryDeleteSpy).toHaveBeenCalledWith('12');
      });
    });

    describe('deleting contact, doesn"t exists', () => {
      it('should throw an error', async () => {
        try {
          const deleteResult = new DeleteResult();
          deleteResult.affected = 0;
          const phonesRepositoryDeleteSpy = jest
            .spyOn(contactsRepository, 'delete')
            .mockResolvedValue(deleteResult);
          await contactsService.deleteContact('12');
          expect(phonesRepositoryDeleteSpy).toHaveBeenCalledWith('12');
          expect(phonesRepositoryDeleteSpy).toThrowError();
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });
});
