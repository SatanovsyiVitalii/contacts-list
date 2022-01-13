import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray } from 'class-validator';
import { Phone } from 'src/phones/phone.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Harry',
    description: 'firstname of the person whose the contact is',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    example: 'Potter',
    description: 'lastname of the person whose the contact is',
  })
  @Column()
  lastName: string;

  @Column('boolean', { default: false })
  @Type(() => Boolean)
  favorite: boolean;

  @IsArray()
  @ArrayUnique()
  @Type(() => Phone)
  @OneToMany(() => Phone, (phone) => phone.contact)
  phones: Phone[];
}
