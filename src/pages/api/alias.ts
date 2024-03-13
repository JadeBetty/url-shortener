import type { APIRoute } from "astro";
import linkSchema from "../../schemas/link.ts";
import { disconnect, connect } from "mongoose";
import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";

export const POST: APIRoute = async ({ request }) => {
  const body = request;
  try {
    verify(process.env.pub_key);
  } catch (e) {
    console.log(e);
  }
  


  const uri = import.meta.env.dburi;
  const options = {};

  await connect(uri, options);

  try {
    const { type, id, data, token, member } = body;
    if(type === InteractionType.APPLICATION_COMMAND) {
      const interaction = body;
      const longurl = interaction.data.options[0].value;
      const urlPattern =
        /^((http|https):\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?].*)?$/i;
      if (!urlPattern.test(longurl))
        return console.log("skill issue, the link is invalid now kys");
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 1);
      const shorturl = interaction?.data.options[1].value;
      console.log(linkSchema);
      // await linkSchema.create({ longurl: longurl, shorturl, exp: expDate });
      console.log(`https://links.jadebetty.me/${shorturl}`);
  
      const embed = {
        data: {
          embeds: [
            {
              title: "URL Shortener alias",
              description:
                "Your shortened URL is: " +
                `**https://links.jadebetty.me/${shorturl}**`,
              footer: { text: "https://links.jadebetty.me" },
            },
          ],
        },
        type: 4,
      };
  
      console.log(data);
      const coo = await fetch(
        `https://discord.com/api/v10/interactions/${id}/${token}/callback`,
        {
          headers: {
            Authorization: `Bot ${process.env.token}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          method: "POST",
          body: JSON.stringify(embed),
        },
      );
      console.log(await coo.json());
    }
  } catch (e) {}
};

disconnect();


function verify(clientKey) {
  return function (req, res, buf) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}