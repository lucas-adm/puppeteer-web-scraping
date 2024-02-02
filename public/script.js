const gotoContainer = document.getElementById('goto')
const responseContainer = document.getElementById('container')
const load = document.getElementById('loading')

const parentsBtns = document.querySelectorAll('#parent');
parentsBtns.forEach((parent) => {
    parent.addEventListener('click', () => {
        parentsBtns.forEach((bg) => {
            bg.classList.remove('active')
        })
        parent.classList.add('active')
    })
})

const request = 'https://puppeteer-node-service.onrender.com'

async function getResults(url) {

    responseContainer.innerHTML = '';
    load.style.display = 'block';

    const response = await fetch(`${request}/results`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })

    const cards = await response.json();
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            const newCard = `
                    <div class="result">
                        <button onclick="getChapters('${card.url}')">${card.value}</button>
                        <span>${card.data}</span>
                    </div>
                `;
            responseContainer.innerHTML += newCard;
        }
    }
    load.style.display = 'none';
}

async function getChapters(url) {

    responseContainer.innerHTML = '';
    load.style.display = 'block';

    goto.querySelector('label').textContent = '1 - Chapters'
    input.setAttribute('parent', '1')
    input.setAttribute('param', 'chapters')
    input.value = url;

    const response = await fetch(`${request}/chapters`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    const chapters = await response.json();
    for (const key in chapters) {
        if (chapters.hasOwnProperty(key)) {
            const chapter = chapters[key]
            const newChapter = `
            <div class="chapter">
                <button onclick="getImgs('${chapter.url}')">${chapter.text}</button>
            </div>
                        `
            responseContainer.innerHTML += newChapter
        }
    }
    load.style.display = 'none';
}

async function getImgs(url) {

    responseContainer.innerHTML = '';
    load.style.display = 'block';

    goto.querySelector('label').textContent = '1 - Content'
    input.setAttribute('parent', '1')
    input.setAttribute('param', 'contents')
    input.value = url;

    const response = await fetch(`${request}/imgs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
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
    load.style.display = 'none';
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

// Cria o path
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