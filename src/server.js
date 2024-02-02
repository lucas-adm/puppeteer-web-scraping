const express = require('express');

const puppeteer = require('puppeteer');

const cors = require('cors');

const dotenv = require('dotenv')
dotenv.config();

//Server Config
const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

//Porta
app.listen(port, () => {
    console.log(`Servidor rodando em ${port}`);
});

//Site
app.use(express.static('public'));



//Results
async function getResults(url) {
    const browser = await puppeteer.launch({
        // args: [
        //     "--disable-setuid-sandbox", // Desativa a verificação do ID do usuário
        //     "--no-sandbox", // Ambientes restritos, como contêineres
        //     "--single-process", // Ser executado em um único processo
        //     "--no-zygote", // Responsável por pré-carregar bibliotecas e recursos compartilhados
        // ],
        headless: 'new', // Usar o novo modo Headless
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    page.setDefaultTimeout(20000);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('div .page-item-detail', { visible: true });

    const cards = await page.evaluate(() => {
        const cardElements = document.querySelectorAll('div .page-item-detail');

        return Array.from(cardElements).map(card => {
            const urlElement = card.querySelector('h3 a');
            const valueElement = card.querySelector('h3 a');
            const dataElementArray = card.querySelectorAll('.post-on');
            const dataElement = dataElementArray[dataElementArray.length - 1];

            const url = urlElement ? urlElement.getAttribute('href') : 'N/A';
            const value = valueElement ? valueElement.textContent.trim() : 'N/A';
            const data = dataElement ? dataElement.textContent.trim() : 'N/A';

            return { url, value, data };
        });
    });

    await browser.close();

    return cards;
}

app.post('/results', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const content = await getResults(url);
        res.json(content); //Retorna Object
    } catch (error) {
        console.error('Erro ao raspar Content:', error);
        res.status(500).send('Erro ao raspar o conteúdo.');
    }
})



//Chapters
async function getChapters(url) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    page.setDefaultTimeout(20000);

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('li.wp-manga-chapter', { visible: true });

    const chapters = await page.evaluate(() => {
        const chapterElements = document.querySelectorAll('li.wp-manga-chapter');

        return Array.from(chapterElements).map(chapter => {
            const link = chapter.querySelector('a');
            const url = link.getAttribute('href');
            const text = link.textContent.trim();
            return { url, text };
        });
    });

    await browser.close();

    return chapters;
}

app.post('/chapters', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const titles = await getChapters(url);
        res.json(titles);
    } catch (error) {
        console.error('Erro ao raspar o capítulo:', error);
        res.status(500).send('Erro ao raspar os capítulos.');
    }
})



//Imgs
async function imgsUrls(url) {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    page.setDefaultTimeout(20000);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const urls = await page.evaluate(() => {
        const imgTags = Array.from(document.querySelectorAll('img[id^="image-"]'));
        return imgTags.map(img => img.getAttribute('data-src'));
    });

    await browser.close();

    return urls;
}

app.post('/imgs', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const urls = await imgsUrls(url);
        res.json(urls);
    } catch (error) {
        console.error('Erro ao raspar as imagens:', error);
        res.status(500).send('Erro ao raspar imagem.');
    }
})