import { Contact } from 'src/contacts/contact.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Phone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @ManyToOne(() => Contact, (contact) => contact.phones, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  contact: Contact;
}
