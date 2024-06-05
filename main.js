// @ts-check

import puppeteer from "puppeteer"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

/**
 * URL for booking a slot in Berlin for getting a new ID card.
 * Replace the /120703 with the ID for the service you want to book.
 * See https://service.berlin.de/terminvereinbarung/.
 */
const BOOKING_URL = "https://service.berlin.de/terminvereinbarung/termin/all/120703/"

/**
 * Checks if there are any appointments available for getting a new ID card in Berlin,
 * and if so, sends an email to the recipient email address with a link to the booking page
 */
async function main() {
	const browser = await puppeteer.launch()

	const page = await browser.newPage()
	await page.goto(BOOKING_URL)

	const appointments_available = await has_appointments(page)

	if (appointments_available) {
		console.info("Appointments are available")
		const date = await get_date(page)
		send_email(date)
	} else {
		console.info("No appointments are available")
	}

	await browser.close()
}

/**
 * Checks if there are any appointments available for getting a new ID card in Berlin
 * @param {import("puppeteer").Page} page
 * @returns {Promise<boolean>}
 */
async function has_appointments(page) {
	const body = await page.$("body")
	if (!body) return false
	const txt = await page.evaluate((body) => body.innerText, body)
	return txt.includes("Bitte wählen Sie ein Datum")
}

/**
 * Gets the date for which the appointment is available
 * @param {import("puppeteer").Page} page
 * @returns {Promise<string | null>}
 */
async function get_date(page) {
	const td = await page.$("td.buchbar")
	if (!td) return null
	const link = await td.$("a")
	if (!link) return null
	const label = await page.evaluate((link) => link.getAttribute("aria-label"), link)
	if (!label) return null
	return label.split(" - ")?.[0] || null
}

/**
 * Sends an email to the recipient email address with a link to the booking page
 * @param {string | null} date The date for which the appointment is available
 */
async function send_email(date) {
	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	const subject = date
		? `Termine für Personalausweis sind verfügbar am ${date}`
		: "Termine für Personalausweis sind verfügbar"

	const options = {
		from: process.env.EMAIL_USER,
		to: process.env.RECIPIENT_EMAIL,
		subject,
		text: BOOKING_URL,
	}

	transporter.sendMail(options, (error, _info) => {
		if (error) {
			console.error(error)
		} else {
			console.info(`Email sent`)
		}
	})
}

main()
