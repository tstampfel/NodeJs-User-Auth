import { Mutation, Resolver, Query, Arg, Authorized, Ctx, Subscription, Root, PubSubEngine, PubSub } from "type-graphql";
import { User } from "../../entity/user.entity";
import { AuthService } from "../../service/auth.service";
import { RegisterUserInput } from "../../entity/input-types/register.user.input";
import { LoginUserInput } from "../../entity/input-types/login.user.input";
import { LogoutUserInput } from "../../entity/input-types/logout.user.input";
import { ResetPasswordInput } from "../../entity/input-types/reset.user.input";
import { AppContext } from "../../context/appContext";
import { NotificationPubSub } from "../../entity/notification-types/notification.entity";

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => User)
  async registerUser(@Arg("user") user: RegisterUserInput) {
    return await this.authService.registerUser(user);
  }

  @Mutation(() => User)
  async loginUser(@Ctx() ctx: AppContext, @Arg("userCredentials") userCredentials: LoginUserInput, @PubSub() pubSub: PubSubEngine) {
    await pubSub.publish("NOTIFICATIONS", "user logged in");
    return await this.authService.loginUser(ctx, userCredentials);
  }

  @Mutation(() => Boolean)
  async logoutUser(@Ctx() ctx: AppContext, @Arg("logoutUserInput") logoutUserInput: LogoutUserInput) {
    return await this.authService.logOut(ctx, logoutUserInput);
  }

  @Authorized()
  @Mutation(() => User)
  async resetPassword(@Ctx() ctx: AppContext, @Arg("resetPasswordInput") resetPasswordInput: ResetPasswordInput) {
    return await this.authService.resetPassword(ctx, resetPasswordInput);
  }

  @Subscription({
    topics: ({ args }) => args.topic,
  })
  newNotification(@Root() payload: string, @Arg("topic") topic: string): NotificationPubSub {
    console.log("args", topic);
    console.log("notificationPayload", payload);
    return new NotificationPubSub(topic, payload);
  }

  @Query(() => String)
  async user() {
    return "User Query works";
  }
}
