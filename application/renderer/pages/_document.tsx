import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          id="prime-theme"
          rel="stylesheet"
          href="themes/bootstrap4-dark-blue/theme.css" // Replace with the actual path to your theme CSS files
        />
      </Head>
      <head>
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:100,200,300,400,500,600,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
