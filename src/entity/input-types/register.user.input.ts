import { User } from "../user.entity";
import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterUserInput implements Partial<User> {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
