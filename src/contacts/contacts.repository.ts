import { Phone } from 'src/phones/phone.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { EditContactDto } from './dto/edit-contact.dto';
import { GetContactSortDto } from './dto/get-contact-sort.dto';
import { GetContactsFilterDto } from './dto/get-contacts-filter.dto';
import { SortOptions } from './sort-options';

@EntityRepository(Contact)
export class ContactsRepository extends Repository<Contact> {
  async getContacts(
    filterDto: GetContactsFilterDto,
    sortDto: GetContactSortDto,
  ): Promise<Contact[]> {
    const query = this.createQueryBuilder('contact').leftJoinAndSelect(
      'contact.phones',
      'phone',
    );
    if (filterDto.search || filterDto.favorites !== undefined) {
      let queryString = '';
      const queryParams: { search?: string; favorites?: number } = {};

      if (filterDto.search) {
        queryString =
          '(LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR phone.number LIKE :search)';
        queryParams.search = `%${filterDto.search}%`;
      }

      if (filterDto.favorites !== undefined) {
        if (queryString) {
          queryString += ' AND contact.favorite = :favorites';
        } else {
          queryString = 'contact.favorite = :favorites';
        }
        queryParams.favorites = filterDto.favorites ? 1 : 0;
      }

      query.andWhere(queryString, queryParams);
    }

    query.orderBy({
      'contact.firstName': sortDto.sort || SortOptions.ASC,
      'contact.lastName': sortDto.sort || SortOptions.ASC,
    });

    return query.getMany();
  }

  async createContact(
    createContactDto: CreateContactDto,
    phones: Phone[],
  ): Promise<Contact> {
    const { firstName, lastName } = createContactDto;
    const contact = this.create({ firstName, lastName, phones });

    await this.save(contact);
    return contact;
  }

  async editContact(
    contact: Contact,
    editContactDto: EditContactDto,
    phones: Phone[],
  ): Promise<Contact> {
    if (editContactDto.firstName) {
      contact.firstName = editContactDto.firstName;
    }

    if (editContactDto.lastName) {
      contact.lastName = editContactDto.lastName;
    }

    if (editContactDto.phones) {
      contact.phones = phones;
    }

    if (editContactDto.favorite) {
      contact.favorite = editContactDto.favorite;
    }

    await this.save(contact);
    return contact;
  }
}
