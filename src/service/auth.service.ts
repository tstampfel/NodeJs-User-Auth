import { Service } from "typedi";
import { RegisterUserInput } from "../entity/input-types/register.user.input";
import { UserModel } from "../entity/user.entity";
import moment from "moment";
import { LoginUserInput } from "../entity/input-types/login.user.input";
import { LogoutUserInput } from "../entity/input-types/logout.user.input";
import { ResetPasswordInput } from "../entity/input-types/reset.user.input";
import { AppContext } from "../context/appContext";
import UserHelper from "../utils/userHelper";

@Service()
export class AuthService {
  async registerUser(registerUserInput: RegisterUserInput) {
    let user = new UserModel(registerUserInput);
    user.created = moment().toDate();
    user.generateAuthToken();
    return user;
  }

  async loginUser(ctx: AppContext, loginUserInput: LoginUserInput) {
    let user = await UserModel.findOne({ email: loginUserInput.email });

    if (!user) {
      throw Error("User not found");
    }

    if (!user?.confirmedEmail) {
      throw Error("User email is not confirmed");
    }

    const isCorrectCredentials = await user?.checkUserCredentials(loginUserInput.password);

    if (!isCorrectCredentials) {
      throw Error("Wrong credentials!");
    }
    ctx.req.session!.userId = user.id;
    user.generateAuthToken(true);
    return user;
  }

  async logOut(ctx: AppContext, logoutUserInput: LogoutUserInput) {
    let user = await UserModel.findOne({ email: logoutUserInput.email });

    if (!user) {
      throw Error("User not found");
    }

    return await user?.logoutUser(ctx);
  }

  async resetPassword(ctx: AppContext, resetPassword: ResetPasswordInput) {
    let user = await UserModel.findOne({ email: resetPassword.email });

    if (!user) {
      throw Error("User not found");
    }

    return await user.changePassword(resetPassword.password, UserHelper.getTokenFromHeaders(ctx));
  }
}
