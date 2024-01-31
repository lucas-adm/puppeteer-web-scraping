const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const path = require('path');
const app = express();
// Configurações
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0'

app.use(express.json());
app.use(cors());

app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}}`);
});

app.use(express.static(path.join(__dirname, 'public')));



//Results
async function getTitles(url) {
    const browser = await puppeteer.launch({
        headless: 'new', // Usar o novo modo Headless
    });
    const page = await browser.newPage();

    // Navegar até a página desejada
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Capturar o valor text content das tags <a> que estão dentro de <h1>
    const titles = await page.evaluate(() => {
        const titlesArray = [];
        const h1Elements = document.querySelectorAll('h1');

        h1Elements.forEach((h1) => {
            const aElements = h1.querySelectorAll('a');
            aElements.forEach((a) => {
                titlesArray.push(a.textContent.trim());
            });
        });

        return titlesArray;
    });

    await browser.close();

    return titles;
}

app.post('/titles', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const titles = await getTitles(url);
        // res.send(urls); .send faz o envio de strings
        res.json(titles); // envia um array
    } catch (error) {
        console.error('Erro ao raspar Img:', error);
        res.status(500).send('Erro ao raspar os titles.');
    }
})



//Content
async function getContent(url) {
    const browser = await puppeteer.launch({
        headless: 'new', // Usar o novo modo Headless
    });
    const page = await browser.newPage();

    // Navegar até a página desejada
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Aguardar 3 segundos para garantir que as informações sejam carregadas
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Capturar o text content de cada h2, cada p e cada href dentro da div com classe .movie-card
    const content = await page.evaluate(() => {
        const contentArray = [];
        const movieCardElements = document.querySelectorAll('.movie-card');

        movieCardElements.forEach((movieCard) => {
            const h2Elements = movieCard.querySelectorAll('h2');
            const pElements = movieCard.querySelectorAll('p');
            const aElements = movieCard.querySelectorAll('a');

            const contentObject = {
                h2: [],
                p: [],
                href: [],
            };

            h2Elements.forEach((h2) => {
                contentObject.h2.push(h2.textContent.trim());
            });

            pElements.forEach((p) => {
                contentObject.p.push(p.textContent.trim());
            });

            aElements.forEach((a) => {
                contentObject.href.push(a.getAttribute('href'));
            });

            contentArray.push(contentObject);
        });

        return contentArray;
    });

    await browser.close();

    return content;
}

app.post('/content', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).send('URL não fornecida.');
    }
    try {
        const content = await getContent(url);
        res.json(content); // envia um array
    } catch (error) {
        console.error('Erro ao raspar Img:', error);
        res.status(500).send('Erro ao raspar o conteúdo.');
    }
})



//Imgs
async function imgsUrls(url) {

    const browser = await puppeteer.launch({
        headless: 'new', // Usar o novo modo Headless
    });
    const page = await browser.newPage();

    // Navegar até a página desejada
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extrair URLs de imagens na página
    const urls = await page.evaluate(() => {
        const imagens = Array.from(document.querySelectorAll('img'));
        return imagens.map(img => img.src);
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
        // res.send(urls); .send faz o envio de strings
        res.json(urls); // envia um array
    } catch (error) {
        console.error('Erro ao raspar Img:', error);
        res.status(500).send('Erro ao raspar Img.');
    }
})