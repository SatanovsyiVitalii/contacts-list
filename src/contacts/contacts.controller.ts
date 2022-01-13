import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Contact } from './contact.entity';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { SortOptions } from './sort-options';
import { EditContactDto } from './dto/edit-contact.dto';
import { GetContactSortDto } from './dto/get-contact-sort.dto';
import { GetContactsFilterDto } from './dto/get-contacts-filter.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  @ApiTags('contacts')
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiQuery({ name: 'search', required: false, allowEmptyValue: false })
  @ApiQuery({
    name: 'sort',
    enum: SortOptions,
    required: false,
    allowEmptyValue: false,
  })
  getContacts(
    @Query() filterDto: GetContactsFilterDto,
    @Query() sortDto: GetContactSortDto,
  ): Promise<Contact[]> {
    return this.contactsService.getContacts(filterDto, sortDto);
  }

  @Get('/:id')
  @ApiTags('contacts')
  @ApiOperation({ summary: 'Get contact by id' })
  getContactById(@Param('id') id: string): Promise<Contact> {
    return this.contactsService.getContactById(id);
  }

  @Post()
  @ApiTags('contacts')
  @ApiOperation({ summary: 'Create new contact' })
  @ApiBody({ type: [CreateContactDto] })
  createContact(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactsService.createContact(createContactDto);
  }

  @Patch('/:id')
  @ApiTags('contacts')
  @ApiOperation({ summary: 'Update contact' })
  @ApiBody({ type: [EditContactDto] })
  updateContact(
    @Param('id') id: string,
    @Body() editContactDto: EditContactDto,
  ) {
    return this.contactsService.editContact(id, editContactDto);
  }

  @Delete('/:id')
  @ApiTags('contacts')
  @ApiOperation({ summary: 'Delete contact' })
  deleteContact(@Param('id') id: string): Promise<void> {
    return this.contactsService.deleteContact(id);
  }
}
