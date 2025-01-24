import { IsNotEmpty, IsEmail, IsPhoneNumber, IsEmpty, IsArray, IsDefined, IsOptional } from "class-validator";

export class Contact {

    @IsDefined()
    firstname?: string;

    @IsDefined()
    lastname?: string;

    @IsEmail({}, { each: true })
    email?: Array<string>

    @IsOptional()
    @IsPhoneNumber(undefined, { each: true })
    phone?: Array<string>

    constructor(props: any) {
        this.firstname = props.firstname;
        this.lastname = props.lastname;
        this.email = props.email;
        this.phone = props.phone;
    }
}