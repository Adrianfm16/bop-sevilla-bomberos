import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

function hoyFormatoBOP() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function enviarTelegram(texto) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: texto,
      disable_web_page_preview: true
    })
  });
}

async function main() {
  const fecha = hoyFormatoBOP();
  const url = `https://bopsevilla.dipusevilla.es/publica/consulta-de-bops/buscador/BOP-${fecha}/`;

  console.log("Comprobando:", url);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Espera por si los anuncios tardan
  await page.waitForTimeout(5000);

  const texto = await page.evaluate(() => document.body.innerText || "");
  await browser.close();

  if (texto.toLowerCase().includes("bombero")) {
    await enviarTelegram(`🚨 Encontrado "bombero" en el BOP Sevilla (${fecha})\n${url}`);
  } else {
    console.log("No encontrado hoy");
  }
}

main().catch(console.error);
