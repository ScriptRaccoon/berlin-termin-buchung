# Berlin Termin Buchung

It is not so easy to get an appointment in Berlin to, say, request a new ID card. The website often does not display any appointments at all, and if so they are gone quite fast.

This script checks if any appointment is available for you. If yes, it sends an email to you to check the website. A GitHub action runs the script every 10 minutes.

Notice that you are not allowed (and it is not possible) to book an appointment programmatically. This script here just lets you know when you have the chance to book an appointment manually.

## How to use

1. Clone the repository
2. Install the dependencies with `pnpm install`
3. Rename `.env.template` to `.env` and set the secrets (see below)
4. Add these secrets to the GitHub repository under `settings/secrets/actions`

## Secrets

`GMAIL_APP_PASSWORD` = the app password for your gmail account

`GMAIL_USER` = your gmail address

`RECIPIENT_EMAIL` = the recipient of the email
