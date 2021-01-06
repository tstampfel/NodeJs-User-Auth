import { User } from "../user.entity";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginUserInput implements Partial<User> {
  @Field()
  email: string;

  @Field()
  password: string;
}
