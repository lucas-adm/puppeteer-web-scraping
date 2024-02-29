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
        args: [
            // "--disable-setuid-sandbox", // Desativa a verificação do ID do usuário
            "--no-sandbox", // Ambientes restritos, como contêineres
            // "--single-process", // Ser executado em um único processo
            "--no-zygote", // Responsável por pré-carregar bibliotecas e recursos compartilhados
            '--incognito',
        ],
        headless: 'new', // Usar o novo modo Headless
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    // page.setDefaultTimeout(20000);

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('div .page-item-detail', { visible: true });

    const cards = await page.$$eval('div .page-item-detail', cardElements => {
        return cardElements.map(card => {
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

    await page.deleteCookie();

    await page.setCacheEnabled(false);

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
        console.error('Erro ao raspar Resultados:', error);
        res.status(500).send('Erro ao raspar o resultado.');
    }
})



//Chapters
async function getChapters(url) {
    const browser = await puppeteer.launch({
        args: [
            // "--disable-setuid-sandbox", // Desativa a verificação do ID do usuário
            "--no-sandbox", // Ambientes restritos, como contêineres
            // "--single-process", // Ser executado em um único processo
            // "--no-zygote", // Responsável por pré-carregar bibliotecas e recursos compartilhados
            '--incognito',
        ],
        headless: 'new',
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    // page.setDefaultTimeout(20000);

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('li.wp-manga-chapter', { visible: true });

    const chapters = await page.$$eval('li.wp-manga-chapter', chapterElements => {
        return chapterElements.map(chapter => {
            const link = chapter.querySelector('a');
            const url = link.getAttribute('href');
            const text = link.textContent.trim();
            return { url, text };
        });
    });

    await page.deleteCookie();

    await page.setCacheEnabled(false);

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
        args: [
            // "--disable-setuid-sandbox", // Desativa a verificação do ID do usuário
            "--no-sandbox", // Ambientes restritos, como contêineres
            // "--single-process", // Ser executado em um único processo
            // "--no-zygote", // Responsável por pré-carregar bibliotecas e recursos compartilhados
            '--incognito',
        ],
        headless: 'new',
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    // page.setDefaultTimeout(30000);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const urls = await page.$$eval('img[id^="image-"]', imgTags =>
        imgTags.map(img => img.getAttribute('data-src'))
    );

    await page.deleteCookie();

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



//RQ
//RQ Results
async function rqGetResults(url) {
    const browser = await puppeteer.launch({
        args: [
            "--no-sandbox", // Ambientes restritos, como contêineres
            "--no-zygote", // Responsável por pré-carregar bibliotecas e recursos compartilhados
            '--incognito',
        ],
        headless: 'new', // Usar o novo modo Headless
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('div .video-conteudo', { visible: true });

    const cards = await page.$$eval('div .video-conteudo', cardElements => {
        return cardElements.map(card => {
            const urlElement = card.querySelector('a');
            const valueElement = card.querySelector('a h2');
            const statusElement = card.querySelector('div .thumb-conteudo a span')

            const url = urlElement ? urlElement.getAttribute('href') : 'N/A';
            const value = valueElement ? valueElement.textContent.trim() : 'N/A';
            const status = statusElement ? statusElement.textContent.trim() : 'N/A';

            return { url, value, status };
        });
    });

    await page.deleteCookie();

    await page.setCacheEnabled(false);

    await browser.close();

    return cards;
}

app.post('/rq-results', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const content = await rqGetResults(url);
        res.json(content); //Retorna Object
    } catch (error) {
        console.error('Erro ao raspar Resultados:', error);
        res.status(500).send('Erro ao raspar o resultado.');
    }
})



//RQ Imgs
async function rqImgsUrls(url) {
    const browser = await puppeteer.launch({
        args: [
            "--no-sandbox", // Ambientes restritos, como contêineres
            '--incognito',
        ],
        headless: 'new',
        executablePath: process.env_NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setCacheEnabled(false);

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    let urls = '';

    urls = await page.$$eval('figure a', imgTags =>
        imgTags.map(img => img.getAttribute('href'))
    );

    if (!urls || urls.length === 0) {
        urls = await page.$$eval('p a', imgTags =>
            imgTags.map(img => img.getAttribute('href'))
        );
    }

    await page.deleteCookie();

    await browser.close();

    return urls;
}

app.post('/rq-imgs', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const urls = await rqImgsUrls(url);
        res.json(urls);
    } catch (error) {
        console.error('Erro ao raspar as imagens:', error);
        res.status(500).send('Erro ao raspar imagem.');
    }
})