const gotoContainer = document.getElementById('goto')
const responseContainer = document.getElementById('container')

const waiting = document.getElementById('loading')
const error = document.getElementById('status-500')

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
    waiting.classList.remove('off');
    error.classList.add('off');

    try {
        const response = await fetch(`${request}/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        })

        if (response.ok) {
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
        } else {
            console.log('Internal Server Error');
            error.classList.remove('off')
        }
    } catch (exception) {
        console.error('Error:', exception);
        error.classList.remove('off')
    } finally {
        waiting.classList.add('off')
    }
}

async function getChapters(url) {

    responseContainer.innerHTML = '';
    error.classList.add('off');
    waiting.classList.remove('off');

    goto.querySelector('label').textContent = '1 - Chapters'
    input.setAttribute('parent', '1')
    input.setAttribute('param', 'chapters')
    input.value = url;

    try {
        const response = await fetch(`${request}/chapters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        })

        if (response.ok) {
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
            error.classList.add('off');
        } else {
            console.log('Internal Server Error');
            error.classList.remove('off')
        }
    } catch (exception) {
        console.error('Error:', exception);
        error.classList.remove('off')
    } finally {
        waiting.classList.add('off')
    }
}

async function getImgs(url) {

    responseContainer.innerHTML = '';
    error.classList.add('off');
    waiting.classList.remove('off');

    goto.querySelector('label').textContent = '1 - Content'
    input.setAttribute('parent', '1')
    input.setAttribute('param', 'contents')
    input.value = url;

    try {
        const response = await fetch(`${request}/imgs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        })

        if (response.ok) {
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
            error.classList.add('off');
        } else {
            console.log('Internal Server Error');
            error.classList.remove('off')
        }
    } catch (exception) {
        console.error('Error:', exception);
        error.classList.remove('off')
    } finally {
        waiting.classList.add('off')
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