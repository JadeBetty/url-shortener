import type { APIRoute } from "astro";
import linkSchema from "../../schemas/link.ts";
import { disconnect, connect } from "mongoose";


export const POST: APIRoute = async ({ request }) => {
  // console.log(request)

  const uri = import.meta.env.dburi;
  const options = {};

  await connect(uri, options);


  try {
    const linkData = await request.json();
    console.log(linkData.link);
    if (!linkData) {
      return new Response(
        JSON.stringify({ message: "Missing link parameter" }),
        { status: 400 }
      );
    }
    console.log(linkSchema);
    let link = await linkSchema.findOne({ longurl: linkData.link });

    if (link) {
      return new Response(
        JSON.stringify({
          message:
            "The link has been used before. Reusing the same short link.",
          shortlink: link.shorturl,
        }),
        { status: 200 }
      );
    }

    const shorturl = generateShortUrl();

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 1);

    await linkSchema.create({ longurl: linkData.link, shorturl, exp: expDate });

    new Response(
      JSON.stringify({ message: "Short link created successfully", shorturl }),
      { status: 200 }
    );
    console.log("yay it worked" + shorturl);
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
};

function generateShortUrl() {
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
