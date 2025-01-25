import { IsNotEmpty, IsEmail, IsPhoneNumber, IsEmpty, IsArray, IsDefined, IsOptional, ArrayMinSize, IsString, IsPostalCode, ValidateNested } from "class-validator";

export type ContactFilter = Pick<Contact, 'firstName' | 'lastName' | 'email' | 'phone'>;

export class Contact {

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsArray()
    @IsEmail({}, { each: true })
    @IsNotEmpty()
    email: Array<string>

    @IsArray()
    @IsOptional()
    @IsPhoneNumber(undefined, { each: true })
    phone?: Array<string>

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    address?: Array<Address>

    constructor(props: any) {
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.email = props.email;
        this.phone = props.phone;
        this.address = props.address.map((address: any) => new Address(address));
    }
}

class Address{
    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    @IsPostalCode('any')
    postalCode: string;

    @IsString()
    @IsOptional()
    description?: string;

    constructor(props: any) {
        this.street = props.street;
        this.city = props.city;
        this.postalCode = props.postalCode;
        this.description = props.description;
    }
}