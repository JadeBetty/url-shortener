import type { APIRoute } from "astro";
import linkSchema from "../../schemas/link.ts";
import { disconnect, connect } from "mongoose";
import {
  verifyKey,
  InteractionType,
  InteractionResponseType,
} from "discord-interactions";

export const POST: APIRoute = async ({ request }) => {
  try {
    const ok = { verify: verify(process.env.pub_key) };
    console.log(
      "hey there! this tells you that verify function finally worked!"
    );
    new Response(JSON.stringify({ message: "Verify function worked" }), {
      status: 200,
    });
  } catch (e) {
    console.log(e);
    return new Response(
      JSON.stringify({
        message:
          "An error had occured while trying to verify the public key, please check the public_key inside the environment variables",
      }),
      { status: 400 }
    );
  }
  const uri = import.meta.env.dburi;
  const options = {};
  await connect(uri, options);

  const body = await request.json();
  try {
    const { type, id, data, token, member } = body;
    if (type === InteractionType.PING) {
      return new Response(
        JSON.stringify(
          { type: InteractionResponseType.PONG },
          { headers: { "Content-Type": "application/json" } }
        )
      );
    }
    if (type === InteractionType.APPLICATION_COMMAND) {
      const interaction = body;
      new Response(
        JSON.stringify({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        })
      );
      const longurl = interaction.data.options[0].value;
      const urlPattern =
        /^((http|https):\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?].*)?$/i;
      if (!urlPattern.test(longurl)) {
        const embed = {
          data: {
            embeds: [
              {
                title: "URL error",
                description: `The URL you are trying to shorten is either not a URL or you didn't add the http:// or https://`,
                footer: { text: "https://links.jadebetty.me" },
                color: "#6a93bf",
              },
            ],
          },
          type: 4,
        };
        await fetch(
          `https://discord.com/api/v10/interactions/${id}/${token}/callback`,
          {
            headers: {
              Authorization: `Bot ${process.env.token}`,
              "Content-Type": "application/json; charset=UTF-8",
            },
            method: "POST",
            body: JSON.stringify(embed),
          }
        );
      }
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 1);
      const shorturl = interaction?.data.options[1].value;
      const embed = {
        data: {
          embeds: [
            {
              title: "URL Shortener alias",
              description:
                "Your shortened URL is: " +
                `**https://links.jadebetty.me/${shorturl}**`,
              footer: { text: "https://links.jadebetty.me" },
              color: "#6a93bf",
            },
          ],
        },
        type: 4,
      };
      await fetch(
        `https://discord.com/api/v10/interactions/${id}/${token}/callback`,
        {
          headers: {
            Authorization: `Bot ${process.env.token}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          method: "POST",
          body: JSON.stringify(embed),
        }
      );
      await linkSchema.create({ longurl: longurl, shorturl, exp: expDate });
    } else {
      return new Response(JSON.stringify({ message: "Why you tryna spam my database? I know your IP btw" }), {
        status: 200,
      });
    }
  } catch (e) {
    console.log(e);
    return new Response(
      JSON.stringify({
        message: "An error had occured while trying to generate the shortned url",
      }),
      { status: 400 }
    );
  }
  return new Response(
    JSON.stringify({ message: "If you are reading this message, this means that it worked" }),
    {
      status: 200,
    }
  );
};

disconnect();

function verify(clientKey) {
  return function (req, res, buf) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);

    if (!isValidRequest) {
      console.log("uh oh! it didn't work pensive");
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
      return new Response(JSON.stringify({ ok: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
