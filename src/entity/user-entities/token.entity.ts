import { prop } from "@typegoose/typegoose";
import { ObjectType, Field } from "type-graphql";

import moment from "moment";

@ObjectType()
export class AuthToken {
  constructor(token: string) {
    this.token = token;
    this.created = moment().toDate();
  }
  @Field()
  @prop()
  token: string;

  @Field()
  @prop()
  created: Date;
}
