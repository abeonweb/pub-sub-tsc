import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/index.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";

async function main() {
  const CONNECTION_STRING = "amqp://guest:guest@localhost:5672/";
  console.log("Starting Peril server...");
  const connection = await amqp.connect(CONNECTION_STRING);
  console.log("Connected to Peril server.");
  const confirmChannel = await connection.createConfirmChannel();
  printServerHelp();
  while (true) {
    const words = await getInput();
    if (words.length == 0) {
      continue;
    }
    else if (words[0] === "pause") {
      console.log("Sending a pause message");
      publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, {
        isPaused: true,
      });
    }
    else if (words[0] === "resume") {
      console.log("Sending a resume message");
      publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, {
        isPaused: false,
      }); 
    }
    else if (words[0] === "quit") {
      console.log("Exiting...");
      break;
    }
    else {
      console.log("I do not understand that command.");
    }
  }

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      try {
        console.log("Shutting down Peril...");
        await connection.close();
        process.exit(0);
      } catch (error) {
        console.log("Error: could not shut down properly");
      }
    });
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
