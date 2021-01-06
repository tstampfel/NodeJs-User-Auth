import { AuthChecker } from "type-graphql";
import { AppContext } from "../context/appContext";
import { redis } from "./../redis";
import UserHelper from "./userHelper";
export const authChecker: AuthChecker<AppContext> = async ({ context }) => {
  var inputToken = UserHelper.getTokenFromHeaders(context);
  var userId = context.req.session?.userId;
  if (userId && inputToken) {
    var userTokens = await redis.get(userId);
    if (userTokens) {
      const parsedTokens: any[] = JSON.parse(userTokens);
      const isTokenPresent = parsedTokens.filter((token) => token.token == inputToken);
      if (isTokenPresent.length === 1) {
        return true;
      }
    }
  }
  return false;
};
