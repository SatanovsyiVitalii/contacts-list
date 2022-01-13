import { Test, TestingModule } from '@nestjs/testing';
import { Contact } from './contact.entity';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { EditContactDto } from './dto/edit-contact.dto';
import { GetContactSortDto } from './dto/get-contact-sort.dto';
import { GetContactsFilterDto } from './dto/get-contacts-filter.dto';

describe('ContactsController', () => {
  let contactsController: ContactsController;
  let contactsService: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        ContactsService,
        {
          provide: ContactsService,
          useFactory: () => ({
            getContacts: jest.fn(),
            getContactById: jest.fn(),
            createContact: jest.fn(),
            editContact: jest.fn(),
            deleteContact: jest.fn(),
          }),
        },
      ],
    }).compile();

    contactsController = module.get<ContactsController>(ContactsController);
    contactsService = module.get<ContactsService>(ContactsService);
  });

  describe('getting all contacts', () => {
    const contacts = [new Contact()];
    const filterDto = new GetContactsFilterDto();
    const sortDto = new GetContactSortDto();
    it('should be returned all contacts', async () => {
      jest.spyOn(contactsService, 'getContacts').mockResolvedValue(contacts);
      const fetchedContacts = await contactsController.getContacts(
        filterDto,
        sortDto,
      );

      expect(fetchedContacts).toEqual(contacts);
      expect(contactsService.getContacts).toHaveBeenCalledWith(
        filterDto,
        sortDto,
      );
    });
  });

  describe('getting contact by id', () => {
    const contact = new Contact();
    it('should return contact', async () => {
      jest.spyOn(contactsService, 'getContactById').mockResolvedValue(contact);
      const fetchedContact = await contactsController.getContactById('12');
      expect(fetchedContact).toEqual(contact);
    });
  });

  describe('creating contact', () => {
    const contact = new Contact();
    const createContactDto: CreateContactDto = new CreateContactDto();
    it('should return created contact', async () => {
      jest.spyOn(contactsService, 'createContact').mockResolvedValue(contact);
      const createdContact = await contactsController.createContact(
        createContactDto,
      );

      expect(createdContact).toEqual(contact);
      expect(contactsService.createContact).toHaveBeenCalledWith(
        createContactDto,
      );
    });
  });

  describe('updating contact', () => {
    const contact = new Contact();
    const editContactDto: EditContactDto = new EditContactDto();
    it('the contact should be updated', async () => {
      jest.spyOn(contactsService, 'editContact').mockResolvedValue(contact);
      const editedContact = await contactsController.updateContact(
        '12',
        editContactDto,
      );

      expect(editedContact).toEqual(contact);
      expect(contactsService.editContact).toHaveBeenCalledWith(
        '12',
        editContactDto,
      );
    });
  });

  describe('deleting contact', () => {
    it('the contact should be deleted', async () => {
      await contactsController.deleteContact('12');
      expect(contactsService.deleteContact).toHaveBeenCalledWith('12');
    });
  });
});
