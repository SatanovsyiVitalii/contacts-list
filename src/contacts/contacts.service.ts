import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';
import { Phone } from '../phones/phone.entity';
import { PhonesRepository } from '../phones/phones.repository';
import { PhonesService } from '../phones/phones.service';
import { Contact } from './contact.entity';
import { ContactsRepository } from './contacts.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { EditContactDto } from './dto/edit-contact.dto';
import { GetContactSortDto } from './dto/get-contact-sort.dto';
import { GetContactsFilterDto } from './dto/get-contacts-filter.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactsRepository)
    private contactsRepository: ContactsRepository,
    @InjectRepository(PhonesRepository)
    private phonesRepository: PhonesRepository,
    private phonesService: PhonesService,
  ) {}

  async getContacts(
    filterDto: GetContactsFilterDto,
    sortDto: GetContactSortDto,
  ): Promise<Contact[]> {
    return this.contactsRepository.getContacts(filterDto, sortDto);
  }

  async getContactById(id: string): Promise<Contact> {
    const found = await this.contactsRepository.findOne(id, {
      relations: ['phones'],
    });
    if (found) {
      return found;
    } else {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }

  async getContactsIfExistsByFirstAndLastName(contact: Contact) {
    return await this.contactsRepository.find({
      where: {
        firstName: contact.firstName,
        lastName: contact.lastName,
      },
      relations: ['phones'],
    });
  }

  async createContact(createContactDto: CreateContactDto): Promise<Contact> {
    const contacts = await this.getContactsIfExistsByFirstAndLastName({
      firstName: createContactDto.firstName,
      lastName: createContactDto.lastName,
    } as Contact);

    if (contacts.length) {
      const isTheSamePhones = contacts.some((_contact) =>
        this.phonesService.arePhonesArraysTheSame(
          _contact.phones,
          createContactDto.phones,
        ),
      );
      if (isTheSamePhones) {
        throw new HttpException(
          `Contact ${createContactDto.firstName} ${createContactDto.lastName
          } with phones ${JSON.stringify(
            createContactDto.phones,
          )} already exists.`,
          400,
        );
      } else {
        const phones = await this.phonesRepository.createPhones({
          phones: createContactDto.phones,
        });
        return this.contactsRepository.createContact(createContactDto, phones);
      }
    } else {
      const phones = await this.phonesRepository.createPhones({
        phones: createContactDto.phones,
      });
      return this.contactsRepository.createContact(createContactDto, phones);
    }
  }

  async editContact(
    id: string,
    editContactDto: EditContactDto,
  ): Promise<Contact> {
    const contact = await this.getContactById(id);
    if (contact) {
      let phones = contact.phones;
      let areTheSamePhones;
      if (editContactDto.phones) {
        if (contact.phones) {
          areTheSamePhones = this.phonesService.arePhonesArraysTheSame(
            contact.phones,
            editContactDto.phones,
          );
          if (!areTheSamePhones) {
            await this.phonesService.deletePhones(contact.phones);
          }
        }
        if (!areTheSamePhones) {
          phones = await this.phonesRepository.createPhones({
            phones: editContactDto.phones,
          });
        }
      }

      const contacts = await this.getContactsIfExistsByFirstAndLastName({
        firstName: editContactDto.firstName,
        lastName: editContactDto.lastName,
      } as Contact);

      const contactsWithoutCurrent = contacts.filter(
        (_contact) => _contact.id !== id,
      );

      const isTheSameContacts = contactsWithoutCurrent.some((_contact) =>
        this.phonesService.arePhonesArraysTheSame(
          _contact.phones,
          editContactDto.phones,
        ),
      );

      if (isTheSameContacts) {
        throw new HttpException(
          `Contact ${editContactDto.firstName} ${editContactDto.lastName
          } with phones ${JSON.stringify(
            editContactDto.phones,
          )} already exists.`,
          400,
        );
      } else {
        return this.contactsRepository.editContact(
          contact,
          editContactDto,
          phones,
        );
      }
    } else {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }

  async deleteContact(id: string): Promise<void> {
    const result = await this.contactsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }
}
