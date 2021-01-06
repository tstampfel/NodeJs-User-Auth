import { AuthToken } from "../entity/user-entities/token.entity";
import moment from "moment";
import { User } from "../entity/user.entity";
import { DocumentType } from "@typegoose/typegoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppContext } from "../context/appContext";
import { redis } from "../redis";

export default class UserHelper {
  public static clearExpiredTokens(tokens: AuthToken[]): AuthToken[] {
    return tokens.filter((token) => moment() < moment(token.created).add(2, "days"));
  }

  public static async changePasword(user: DocumentType<User>, tokenInput: string | undefined, passwordInput: string) {
    if (!tokenInput) {
      throw new Error("Token not provided");
    }

    let tokens = user.tokens;
    tokens = UserHelper.clearExpiredTokens(tokens);
    const isTokenPresent = tokens.find((token) => token.token == tokenInput);

    if (!isTokenPresent) {
      throw new Error("Token was not found");
    }

    user.password = passwordInput;

    if (!user.lastLogin) {
      user.lastLogin = moment().toDate();
    }

    await user.save();

    return user;
  }

  public static async logoutUser(ctx: AppContext, user: DocumentType<User>) {
    try {
      const inputToken = UserHelper.getTokenFromHeaders(ctx);
      if (!inputToken) {
        return false;
      }
      let tokens = user.tokens;
      tokens = tokens.filter((token) => token.token != inputToken);

      user.tokens = tokens;

      await user.save();
      await redis.set(user.id, JSON.stringify(user.tokens), "ex", process.env.REDIS_TOKENS_EXPIRE);

      ctx.req.session!.destroy((err) => {
        if (err) {
          console.log(err);
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public static async checkUserCredentials(user: DocumentType<User>, password: string) {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    return isPasswordCorrect;
  }

  public static async generateAuthToken(user: DocumentType<User>, login: boolean) {
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXP,
    });

    let tokens = user.tokens;
    tokens = UserHelper.clearExpiredTokens(tokens);
    tokens.push(new AuthToken(token));
    user.tokens = tokens;
    user.token = token;

    if (login) {
      user.lastLogin = moment().toDate();
    }

    await redis.set(user.id, JSON.stringify(user.tokens), "ex", process.env.REDIS_TOKENS_EXPIRE);
    await user.save();
  }

  public static getTokenFromHeaders(ctx: AppContext) {
    return ctx.req.headers.authorization?.split(" ")[1];
  }
}
