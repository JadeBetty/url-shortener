import type { APIRoute } from "astro";
import linkSchema from "../../schemas/link.ts";
import { disconnect, connect } from "mongoose";


export const POST: APIRoute = async ({ request }) => {
  const uri = import.meta.env.dburi;
  const options = {};

  await connect(uri, options);


  try {
    const linkData = await request.json();
    console.log(linkData.link);
    if (!linkData) {
      return new Response(
        JSON.stringify({ message: "Missing link parameter", id: "missing-link" }),
        { status: 400 }
      );
    }
    let link = await linkSchema.findOne({ longurl: linkData.link });
    const alias = linkData.alias;
    if (link) {
      return new Response(
        JSON.stringify({
          message:
            "The link has been used before. Reusing the same short link.",
          shortlink: link.shorturl,
          id: "used-link"
        }),
        { status: 200 }
      );


    }

    const shorturl = generateShortUrl(alias);

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 1);

    await linkSchema.create({ longurl: linkData.link, shorturl, exp: expDate });
    return new Response(
      JSON.stringify({ message: "Short link created successfully", shortlink: shorturl, id: "success-link"}),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error", id: "server-error" }), {
      status: 500,
    });
  }
};

function generateShortUrl(alias) {
  if(alias) return alias;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

}

disconnect();
