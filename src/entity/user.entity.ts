import { prop, getModelForClass, DocumentType, pre, modelOptions, Severity } from "@typegoose/typegoose";
import { ObjectType, Field } from "type-graphql";
import bcrypt from "bcryptjs";
import { AuthToken } from "./user-entities/token.entity";
import UserHelper from "../utils/userHelper";
import { AppContext } from "src/context/appContext";

@pre<User>("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
})
@ObjectType()
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,   
  },
})
export class User {
  @Field({ nullable: true })
  readonly id?: string;

  @Field()
  @prop()
  firstName: string;

  @Field()
  @prop()
  lastName: string;

  @Field()
  @prop({ unique: true })
  email: string;

  @Field(() => [AuthToken])
  @prop()
  tokens: AuthToken[];

  @Field()
  @prop()
  created: Date;

  @Field()
  @prop()
  lastLogin: Date;

  @Field()
  token: string;

  @prop()
  password: string;

  @prop({ default: false })
  confirmedEmail: boolean;

  public async generateAuthToken(this: DocumentType<User>, login: boolean = false) {
    await UserHelper.generateAuthToken(this, login);
  }

  public async checkUserCredentials(this: DocumentType<User>, password: string) {
    return await UserHelper.checkUserCredentials(this, password);
  }

  public async logoutUser(this: DocumentType<User>, ctx: AppContext) {
    return await UserHelper.logoutUser(ctx, this);
  }

  public async changePassword(this: DocumentType<User>, passwordInput: string, tokenInput: string | undefined) {
    return await UserHelper.changePasword(this, tokenInput, passwordInput);
  }
}

export const UserModel = getModelForClass(User);
