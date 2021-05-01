export type Email = {
  to: string;
  body: string;
};

export abstract class EmailService {
  abstract sendEmail(email: Email): Promise<void>;

  renderEmail(email: Email) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    ${email.body}
  </body>
</html>  
`;
  }
}
