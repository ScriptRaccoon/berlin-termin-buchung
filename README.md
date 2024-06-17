# Berlin Termin Buchung

It is not so easy to get an appointment in Berlin to request a new ID card, for example. The [website](https://service.berlin.de/terminvereinbarung/termin/all/120703) often does not display any appointments at all, and if so they are gone quite fast.

This script checks if any appointment is available. If yes, it sends an email to you to check the website. A GitHub action runs the script every 10 minutes.

Notice that you are not allowed (and it is not possible) to book an appointment programmatically. This script here just lets you know when you have the chance to book an appointment manually. It does so by opening and analysing the website in a headless browser.

## How to use

1. Clone the repository.
2. If you are looking for a different service than getting an ID card, change the `BOOKING_URL` in `main.js` accordingly.
3. Install [pnpm](https://pnpm.io/installation) if you haven't done already.
4. Install the dependencies with `pnpm install`.
5. Create the `.env` file and add the secrets (see below) in it.
6. Add the same secrets to the GitHub repository under `https://{YOUR_REPOSITORY}/settings/secrets/actions`.
7. Uncomment the schedule in the workflow file `main.yaml`. When you got an appointment, comment the schedule.

## Secrets

-   `EMAIL_USER` = the sender email address
-   `EMAIL_PASS` = the corresponding password\*
-   `EMAIL_SERVICE` = your email provider (for example, gmail)
-   `RECIPIENT_EMAIL` = the recipient email address
-   `DATE_BEFORE` = the date before which you want to get an appointment\*\*

\*This needs to be an [app password](https://support.google.com/mail/answer/185833) if you have two-factor authentication enabled.

\*\*This is optional. This date is useful to filter out some emails about appointments which are too late for you anyway.
