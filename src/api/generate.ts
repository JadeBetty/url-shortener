import type { APIRoute } from "astro";
import linkSchema from "../schemas/link.ts";
export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  const linkdata = data.get("link");
  if (!linkdata)
    return new Response(JSON.stringify({ message: "missing link lol" }), {
      status: 400,
    });
  let link = await linkSchema.findOne({ longurl: linkdata });
  if (link)
    return new Response(
      JSON.stringify({
        message:
          "uh oh, looks like the link has been used before, to avoid using too much space in my database (im broke) i will have to use the same link that was used before to generate this link. here it is " +
          link,
      }),
      { status: 200 }
    );

  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < 4) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  const shortlink = await linkSchema.findOne({ shorturl: result });
  const date = new Date().getHours() + 24;
  console.log(date);
  if (!shortlink) {
    await linkSchema.create({ longurl: linkdata, shorturl: result, exp: date });
    shortlink.save();
    return new Response(
      JSON.stringify({ message: "here it is you hoe" + shortlink }),
      { status: 200 }
    );
  }

  // const name = data.get("name");
  // const email = data.get("email");
  // const message = data.get("message");
  // // Validate the data - you'll probably want to do more than this
  // if (!name || !email || !message) {
  //   return new Response(
  //     JSON.stringify({
  //       message: "Missing required fields",
  //     }),
  //     { status: 400 }
  //   );
  // }
  // // Do something with the data, then return a success response
  // return new Response(
  //   JSON.stringify({
  //     message: "Success!",
  //   }),
  //   { status: 200 }
  // );
};
