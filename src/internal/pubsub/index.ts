import type {
  ConfirmChannel,
  ChannelModel,
  Channel,
  Options,
  Replies,
} from "amqplib";

export function publishJSON<T>(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  value: T
) {
  const jsonString = JSON.stringify(value);
  const jsonBuffer = Buffer.from(jsonString, "utf8");
  ch.publish(exchange, routingKey, jsonBuffer, {
    contentType: "application/json",
  });
}

type SimpleQueueType = "transient" | "durable";

export async function declareAndBind(
  conn: ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType
): Promise<[Channel, Replies.AssertQueue]> {
  const channel = await conn.createChannel();
  const options: Options.AssertQueue = {
    durable: queueType == "durable",
    autoDelete: queueType === "transient",
    exclusive: queueType === "transient",
    arguments: null,
  };
  const queue = await channel.assertQueue(queueName, options);
  channel.bindQueue(queueName, exchange, key);
  return [channel, queue];
}
