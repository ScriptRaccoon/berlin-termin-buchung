// @ts-check

import puppeteer from "puppeteer"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

/**
 * Berlin service website.
 */
const BASE_URL = "https://service.berlin.de"

/**
 * URL for booking a slot in Berlin for getting a new ID card.
 * Replace the /120703 with the ID for the service you want to book.
 * See https://service.berlin.de/terminvereinbarung/.
 */
const BOOKING_URL = `${BASE_URL}/terminvereinbarung/termin/all/120703/`

/**
 * Checks if there are any appointments available for getting a new ID card in Berlin,
 * and if so, sends an email to the recipient email address with a link to the booking page
 */
async function check_appointments() {
	try {
		console.info("Checking for appointments...")
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.goto(BOOKING_URL)

		const appointments_available = await has_appointments(page)
		if (!appointments_available) {
			console.info("No appointments are available")
			await browser.close()
			return
		}

		console.info("Appointments are available")

		const slot = await get_slot(page)
		if (!slot) {
			console.info("No slot available")
			await browser.close()
			return
		}

		console.info("Slot is available:", slot.date)

		await page.goto(BASE_URL + slot.url)
		const time = await get_time(page)
		if (!time) {
			console.info("No time available")
			await browser.close()
			return
		}

		console.info("Time is available:", time)

		await send_email(slot.date, time)
		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

/**
 * Checks if there are any appointments available for getting a new ID card in Berlin.
 * @param {import("puppeteer").Page} page - The page to check for appointments.
 * @returns {Promise<boolean>}
 */
async function has_appointments(page) {
	const txt = await page.evaluate(() => document.body.innerText)
	return txt.includes("Bitte wählen Sie ein Datum")
}

/**
 * Gets the date and the booking url for which the appointment is available.
 * If the slot is not available, returns null.
 * @param {import("puppeteer").Page} page - The page to check for the slot.
 * @returns {Promise<{date: string, url: string} | null>}
 */
async function get_slot(page) {
	return page.evaluate((DATE_BEFORE) => {
		const td = document.querySelector("td.buchbar")
		if (!td) return null
		const link = td.querySelector("a")
		if (!link) return null
		const date = link.getAttribute("title")?.split(" - ")[0]?.trim() ?? ""

		if (date && DATE_BEFORE) {
			const date_before = new Date(DATE_BEFORE.split(".").reverse().join("-"))
			const date_to_check = new Date(date.split(".").reverse().join("-"))
			if (date_to_check >= date_before) return null
		}

		const url = link.getAttribute("href") ?? ""
		return { date, url }
	}, process.env.DATE_BEFORE)
}

/**
 * Gets the time for which the appointment is available.
 * If the time is not available, returns null.
 * @param {import("puppeteer").Page} page - The page to check for the time.
 * @returns {Promise<string | null>}
 */
async function get_time(page) {
	return page.evaluate(() => {
		/** @type {HTMLElement | null} */
		const th = document.querySelector("th.buchbar")
		if (!th) return null
		return th.innerText.trim()
	})
}

/**
 * Sends an email to the recipient email address with a link to the booking page.
 * @param {string} date The date for which the appointment is available.
 * @param {string} time The time for which the appointment is available.
 */
async function send_email(date, time) {
	const transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})

	const subject = `Termine verfügbar am ${date} um ${time} Uhr`

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

check_appointments()
