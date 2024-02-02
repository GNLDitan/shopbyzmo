import { Address } from './address';

export class User {

  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  resetToken: string;
  addresses: Array<Address>;
  isAdmin: boolean;
  isDefault: boolean;
  isSocialMediaLogin: boolean;
  ipAddress: string;
  constructor() {
    this.addresses = new Array<Address>();
    this.id = 0;
    this.email = '';
    this.ipAddress = '';
  }
}
