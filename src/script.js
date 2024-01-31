const gotoContainer = document.getElementById('goto')
const responseContainer = document.getElementById('container')

const port = 3000;
const host = 'localhost';


async function getResults(url) {
    responseContainer.innerHTML = '';

    const response = await fetch(`http://${host}:${port}/content`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })

    const contents = await response.json();
    for (const key in contents) {
        if (contents.hasOwnProperty(key)) {
            const content = contents[key]
            const chapter = `
            <div class="result">
                <span>${content.h2[0]}</span>
                <button onclick="getChapters('https://angular-blog-2mq9.onrender.com')">${content.p[0]}</button>
            </div>
                            `

            responseContainer.innerHTML += chapter
        }
    }
}

async function getChapters(url) {
    responseContainer.innerHTML = '';

    const response = await fetch(`http://${host}:${port}/titles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    const titles = await response.json();
    for (const key in titles) {
        if (titles.hasOwnProperty(key)) {
            const title = titles[key]
            const h1 = `
            <div class="chapter">
                <button onclick="getImgs('https://angular-blog-2mq9.onrender.com')">${title}</button>
            </div>
                        `
            responseContainer.innerHTML += h1
        }
    }
}

async function getImgs(url) {
    responseContainer.innerHTML = '';

    const response = await fetch(`http://${host}:${port}/imgs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    // const urls = await response.text();
    const urls = await response.json();
    for (const key in urls) {
        if (urls.hasOwnProperty(key)) {
            const url = urls[key]
            const img = `
                        <div class="content">
                            <img src="${url}" alt="">
                        </div>
                        `
            responseContainer.innerHTML += img
        }
    }
}

//Crias os parâmetros
function createParams(parent) {
    const params = `
    <div class="params">
        <button parent="${parent}" onclick="createForm(${parent}, 'results')">Results</button>
        <button parent="${parent}" onclick="createForm(${parent},'chapters')">Chapters</button>
        <button parent="${parent}" onclick="createForm(${parent}, 'contents')">Content</button>
    </div>
    `
    gotoContainer.innerHTML = params
}

//Cria o path
function createForm(parent, param) {
    lastForm = gotoContainer.querySelector('#path:last-child')
    if (lastForm) {
        lastForm.remove()
    }

    const form = `
    <div id="path" class="path" action="javascript:void(0)">
        <form action="">
            <label for="path">${parent} - ${param}</label>
            <input parent="${parent}" param="${param}" type="text" name="path" id="input" value="">
        </form>
    </div>
    `

    gotoContainer.innerHTML += form

    //Onde fica o Form
    const goto = gotoContainer.querySelector('#path');

    goto.addEventListener('submit', (event) => {

        event.preventDefault();

        const input = goto.querySelector('#input')
        const parent = input.getAttribute('parent');
        const param = input.getAttribute('param');
        const url = input.value

        async function scraping() {
            if (!url) {
                return;
            }

            //Condição 1
            if (parent === '1' && param === 'results') {
                getResults(url)
            }

            //Condição 2
            if (parent === '1' && param === 'chapters') {
                getChapters(url)
            }

            //Condição 3
            if (parent === '1' && param === 'contents') {
                getImgs(url)
            }
        } scraping()
    })
}