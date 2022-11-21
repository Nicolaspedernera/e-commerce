import { Product } from 'src/products/entities/product.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users', { orderBy: PrimaryColumn })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text', {})
  firstName: string;

  @Column('text', {})
  lastName: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(
    ()=> Product,
    (product) => product.user
  )
  product: Product;

  @BeforeInsert()
  checksFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
  }

  @BeforeUpdate()
  checksFieldsBeforeUpdate() {
    this.checksFieldsBeforeInsert();
  }
}
