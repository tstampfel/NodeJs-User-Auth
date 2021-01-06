import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class NotificationPubSub {
  constructor(topic: string, payload: string) {
    (this.topic = topic), (this.payload = payload);
  }
  @Field(() => String)
  topic: string;

  @Field(() => String)
  payload: string;
}
