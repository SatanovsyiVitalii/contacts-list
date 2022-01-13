import { Test, TestingModule } from '@nestjs/testing';
import { Phone } from 'src/phones/phone.entity';
import { Contact } from './contact.entity';
import { ContactsRepository } from './contacts.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { EditContactDto } from './dto/edit-contact.dto';
import { GetContactSortDto } from './dto/get-contact-sort.dto';
import { GetContactsFilterDto } from './dto/get-contacts-filter.dto';
import { SortOptions } from './sort-options';

describe('ContactsRepository', () => {
  let contactsRepository: ContactsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsRepository],
    }).compile();

    contactsRepository = module.get<ContactsRepository>(ContactsRepository);
  });

  describe('getting all contacts', () => {
    const createQueryBuilder: any = {
      leftJoinAndSelect: jest.fn().mockImplementation(() => {
        return createQueryBuilder;
      }),
      andWhere: jest.fn().mockImplementation(() => {
        return createQueryBuilder;
      }),
      orderBy: jest.fn().mockImplementation(() => {
        return createQueryBuilder;
      }),
      getMany: jest.fn().mockImplementation(() => {
        const contact = new Contact();
        contact.favorite = true;
        return [contact];
      }),
    };

    describe('getting all contacts with no query', () => {
      const filterDto: GetContactsFilterDto = new GetContactsFilterDto();
      filterDto.search = undefined;
      const sortDto: GetContactSortDto = new GetContactSortDto();
      sortDto.sort = undefined;
      const contact = new Contact();
      contact.favorite = true;
      const contacts = [contact];
      it('should return all contacts', async () => {
        jest
          .spyOn(contactsRepository, 'createQueryBuilder')
          .mockImplementation(() => createQueryBuilder);

        await expect(
          contactsRepository.getContacts(filterDto, sortDto),
        ).resolves.toEqual(contacts);
      });
    });

    describe('getting contacts with queries', () => {
      const contact = new Contact();
      const contacts = [contact];

      describe('getting contacts with search query', () => {
        const filterDto: GetContactsFilterDto = new GetContactsFilterDto();
        const sortDto: GetContactSortDto = new GetContactSortDto();
        it('should return contacts by condition', async () => {
          filterDto.search = 'searchString';

          jest
            .spyOn(contactsRepository, 'createQueryBuilder')
            .mockImplementation(() => createQueryBuilder);
          jest.spyOn(createQueryBuilder, 'getMany').mockReturnValue(contacts);
          const fetchedContacts = await contactsRepository.getContacts(
            filterDto,
            sortDto,
          );
          expect(fetchedContacts).toEqual(contacts);
          expect(createQueryBuilder.andWhere).toHaveBeenCalled();
        });
      });

      describe('getting contacts with sort query', () => {
        const filterDto: GetContactsFilterDto = new GetContactsFilterDto();
        const sortDto: GetContactSortDto = new GetContactSortDto();
        sortDto.sort = SortOptions.ASC;
        it('should return sorted contacts', async () => {
          jest
            .spyOn(contactsRepository, 'createQueryBuilder')
            .mockImplementation(() => createQueryBuilder);
          const fetchedContacts = await contactsRepository.getContacts(
            filterDto,
            sortDto,
          );
          expect(fetchedContacts).toEqual(contacts);
          expect(createQueryBuilder.orderBy).toHaveBeenCalled();
        });
      });

      describe('getting contacts with favorite query', () => {
        describe('getting favorite contacts with search param', () => {
          const filterDto: GetContactsFilterDto = new GetContactsFilterDto();
          const sortDto: GetContactSortDto = new GetContactSortDto();
          filterDto.search = 'searchParam';
          filterDto.favorites = true;
          it('should return only contacts marked as favorite and filtered by sort', async () => {
            jest
              .spyOn(contactsRepository, 'createQueryBuilder')
              .mockImplementation(() => createQueryBuilder);
            const fetchedContacts = await contactsRepository.getContacts(
              filterDto,
              sortDto,
            );
            expect(fetchedContacts).toEqual(contacts);
            expect(createQueryBuilder.orderBy).toHaveBeenCalled();
          });
        });

        describe('getting favorite contacts without search param', () => {
          const filterDto: GetContactsFilterDto = new GetContactsFilterDto();
          const sortDto: GetContactSortDto = new GetContactSortDto();
          filterDto.favorites = true;
          it('should return only contacts marked as favorite', async () => {
            jest
              .spyOn(contactsRepository, 'createQueryBuilder')
              .mockImplementation(() => createQueryBuilder);
            const fetchedContacts = await contactsRepository.getContacts(
              filterDto,
              sortDto,
            );
            expect(fetchedContacts).toEqual(contacts);
            expect(createQueryBuilder.orderBy).toHaveBeenCalled();
          });
        });

        describe('getting not favorite contacts', () => {
          const filterDto: GetContactsFilterDto = new GetContactsFilterDto();
          const sortDto: GetContactSortDto = new GetContactSortDto();
          filterDto.favorites = false;
          it('should return only contacts marked as not favorite', async () => {
            jest
              .spyOn(contactsRepository, 'createQueryBuilder')
              .mockImplementation(() => createQueryBuilder);
            const fetchedContacts = await contactsRepository.getContacts(
              filterDto,
              sortDto,
            );
            expect(fetchedContacts).toEqual(contacts);
            expect(createQueryBuilder.orderBy).toHaveBeenCalled();
          });
        });

      });

      // it('should return filtered and sorted contacts', async () => {
      //   jest
      //     .spyOn(contactsRepository, 'createQueryBuilder')
      //     .mockImplementation(() => createQueryBuilder);
      //   const fetchedContacts = await contactsRepository.getContacts(
      //     filterDto,
      //     sortDto,
      //   );
      //   expect(fetchedContacts).toEqual(contacts);
      //   expect(createQueryBuilder.andWhere).toHaveBeenCalled();
      //   expect(createQueryBuilder.orderBy).toHaveBeenCalled();
      // });
    });
  });

  describe('creating contact', () => {
    const phones = [new Phone()];
    const createContactDto: CreateContactDto = new CreateContactDto();
    createContactDto.firstName = 'firstName';
    createContactDto.lastName = 'lastName';
    createContactDto.phones = phones;

    const contact = new Contact();
    contact.firstName = 'firstName';
    contact.lastName = 'lastName';
    contact.phones = phones;
    it('should be created new contact', async () => {
      const createSpy = jest
        .spyOn(contactsRepository, 'create')
        .mockReturnValue(contact);
      const saveSpy = jest
        .spyOn(contactsRepository, 'save')
        .mockResolvedValue(contact);

      const newContact = await contactsRepository.createContact(
        createContactDto,
        phones,
      );
      expect(newContact).toEqual(contact);
      expect(createSpy).toHaveBeenCalledWith(contact);
      expect(saveSpy).toHaveBeenCalledWith(contact);
    });
  });

  describe('editing contact', () => {
    const phones = [new Phone()];
    const editContactDto: EditContactDto = new EditContactDto();
    editContactDto.firstName = 'firstName';
    editContactDto.lastName = 'lastName';
    editContactDto.phones = phones;
    editContactDto.favorite = true;

    const contact = new Contact();
    contact.firstName = 'firstName';
    contact.lastName = 'lastName';
    contact.phones = phones;
    contact.favorite = false;
    it('contact should be edited', async () => {
      const saveSpy = jest
        .spyOn(contactsRepository, 'save')
        .mockResolvedValue(contact);

      const editedContact = await contactsRepository.editContact(
        contact,
        editContactDto,
        phones,
      );

      expect(editedContact).toEqual(contact);
      expect(saveSpy).toHaveBeenCalledWith(contact);
    });
  });
});
