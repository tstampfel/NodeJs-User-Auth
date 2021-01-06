import { User } from "../user.entity";
import { Field, InputType } from "type-graphql";

@InputType()
export class LogoutUserInput implements Partial<User> {
  @Field()
  email: string;
}
