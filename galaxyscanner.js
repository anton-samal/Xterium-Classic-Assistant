if (localStorage.getItem('parserState') === 'started') { //начинаем с первой системы
    let galaxyNumber = Number(getCookie('setGalaxyCookie'));
    let system = localStorage.getItem('parserSystem');

    if(galaxyNumber === 1){
        if (system < 5001) {
            try {
                setTimeout(() => {
                }, 1000);
                [...document.getElementsByClassName('gal_user')].forEach((row, index) => {
                    if (row.style.length > 0) {
                        let request = {};
                        request._id = `${galaxyNumber}:${system}:${index + 1}`;
                        request.moon = {};
                        request.trash = {};
                        request.user = {};
                        request.user.userStatuses = [];
                        request.lastParsed = new Date();
                        if (row.childNodes[3].attributes.length < 2) { //покинутая планета
                            return;
                        }
                        let rawPlanetName = row.childNodes[3].attributes[2].value; //получаем названием планеты
                        //чистим от технических данных
                        request.planetName = rawPlanetName.substring(rawPlanetName.indexOf(' ') + 1, rawPlanetName.lastIndexOf('[') - 1);
                        //проверяем есть ли луна
                        request.moon.exists = row.childNodes[7].childNodes.length > 1;
                        //парсим размер луны
                        if (request.moon.exists) {
                            let rawSizeAndTemperature = row.childNodes[7].childNodes[1].attributes['data-tooltip-content'].value.match(/\<span\>.*\<\/span\>.*/s)[0].split('\t\n');
                            let rawSize = rawSizeAndTemperature[0];
                            let rawTemperature = rawSizeAndTemperature[1];
                            request.moon.size = Number(rawSize.substring(rawSize.indexOf(':') + 1, rawSize.indexOf('</td>')).trim().replace('.',''));
                            request.moon.tempterature = Number(rawTemperature.substring(rawTemperature.indexOf(':') + 1, rawTemperature.indexOf('</td>')).trim().replaceAll('.',''));
                        }
                        // проверяем обломки
                        request.trash.exists = row.childNodes[9].childElementCount > 0;
                        //парсим количество обломков
                        if (request.trash.exists) {
                            let rawMetalAndCrystal = row.childNodes[9].childNodes[1].attributes['data-tooltip-content'].value.match(/\<span\>.*\<\/span\>.*/s)[0].split('<br>');
                            let rawMetal = rawMetalAndCrystal[0];
                            let rawCrystal = rawMetalAndCrystal[1];
                            request.trash.metal = Number(rawMetal.substring(rawMetal.indexOf('\'>') + 2).substring(0, rawMetal.substring(rawMetal.indexOf('\'>') + 2).indexOf('<')).trim().replaceAll('.',''));
                            request.trash.crystal = Number(rawCrystal.substring(rawCrystal.indexOf('\'>') + 2).substring(0, rawCrystal.substring(rawCrystal.indexOf('\'>') + 2).indexOf('<')).trim().replaceAll('.',''));

                            //посылаем переработчик
                            if(request.trash.metal > 500_000_000 || request.trash.crystal > 500_000_000){
                                try {
                                    // eslint-disable-next-line no-eval
                                    eval(String(row.childNodes[9].childNodes[1].attributes['data-tooltip-content'].value.match(/doit.*;/s)[0]));
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }

                        //если база без юзера
                        if (row.childNodes[11].childElementCount > 0) {
                            //получаем юзер айди
                            let rawUserInfo = row.childNodes[11].childNodes[1].attributes['data-tooltip-content'].value.match(/Buddy.*\)/);
                            if (rawUserInfo == null) { //я сам
                                return;
                            }
                            let userId = rawUserInfo[0];
                            request.user.userId = userId.substring(userId.indexOf('(') + 1, userId.lastIndexOf(')'));

                            //парсим юзера
                            request.user.username = row.children[5].children[0].children[0].children[0].innerHTML;
                            request.user.userStatuses = [...request.user.userStatuses, row.children[5].children[0]?.children[1]?.innerHTML];
                            let div = document.createElement('div');
                            div.innerHTML = row.children[5].children[0].getAttribute('data-tooltip-content');
                            let splitPlace = div.getElementsByTagName('th')[0].innerText.split(' ');
                            request.user.place = splitPlace[splitPlace.length - 2];
                        }

                        //парсим альянсы
                        if (row.childNodes[13].childElementCount > 0) {
                            request.user.allyName = row.childNodes[13].childNodes[1].childNodes[1].innerText;
                        }

                        const response = fetch("http://127.0.0.1:5000/update", {
                            method: "POST", // *GET, POST, PUT, DELETE, etc.
                            mode: "cors", // no-cors, *cors, same-origin
                            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                            credentials: "same-origin", // include, *same-origin, omit
                            headers: {
                                "Content-Type": "application/json",
                            },
                            redirect: "follow", // manual, *follow, error
                            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                            body: JSON.stringify(request), // body data type must match "Content-Type" header
                        });
                    }
                })
                const newSystem = Number(system) + 1;
                localStorage.setItem('parserSystem', newSystem);
                let galaxySystem = document.getElementById('nav_2').children[1];
                galaxySystem.value = newSystem; // начинаем с первой системы
                document.getElementById('galaxy_form').submit();
            } catch (e) {
                console.log(e);
                localStorage.setItem('parserState', 'stopped');
                localStorage.setItem('parserSystem', '1');
            }
        } else {
            let request = {};
            request.scanner = 'done';
            fetch("http://127.0.0.1:5000/status", {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(request), // body data type must match "Content-Type" header
            });
            localStorage.setItem('parserState', 'stopped');
            localStorage.setItem('parserSystem', '1');
        }
    } else  { //вторая галактика
        if (system <= parseSystemRange()[1]) { // максиальная система для второй галактики
            try {
                setTimeout(() => {
                }, 1000);
                [...document.getElementsByClassName('gal_user')].forEach((row, index) => {
                    if (row.style.length > 0) {
                        let request = {};
                        request._id = `${galaxyNumber}:${system}:${index + 1}`;
                        request.user = {};
                        request.moon = {};
                        request.trash = {};
                        request.lastParsed = new Date();
                        if (row.children[1].attributes.length < 2) { //покинутая планета
                            return;
                        }

                        request.planetName  = row.children[2].innerText; //получаем названием планеты

                        //проверяем есть ли луна
                        request.moon.exists = row.children[3].childNodes.length > 1;
                        //парсим размер луны
                        /*                        if (request.moon.exists) {
                                                    let rawSizeAndTemperature = row.childNodes[7].childNodes[1].attributes['data-tooltip-content'].value.match(/\<span\>.*\<\/span\>.*!/s)[0].split('\t\n');
                                                    let rawSize = rawSizeAndTemperature[0];
                                                    let rawTemperature = rawSizeAndTemperature[1];
                                                    request.moon.size = Number(rawSize.substring(rawSize.indexOf(':') + 1, rawSize.indexOf('</td>')).trim().replace('.',''));
                                                    request.moon.tempterature = Number(rawTemperature.substring(rawTemperature.indexOf(':') + 1, rawTemperature.indexOf('</td>')).trim().replaceAll('.',''));
                                                }*/
                        // проверяем обломки
                        let trashElement = row.children[4];
                        request.trash.exists = trashElement.childElementCount > 0;
                        //парсим количество обломков
                        if (request.trash.exists) {
                            let rawMetalAndCrystal = trashElement.children[0].attributes['data-tooltip-content'].value.match(/\<span\>.*\<\/span\>.*/s)[0].split('<br>');
                            let rawMetal = rawMetalAndCrystal[0];
                            let rawCrystal = rawMetalAndCrystal[1];
                            request.trash.metal = Number(rawMetal.substring(rawMetal.indexOf('\'>') + 2).substring(0, rawMetal.substring(rawMetal.indexOf('\'>') + 2).indexOf('<')).trim().replaceAll('.',''));
                            request.trash.crystal = Number(rawCrystal.substring(rawCrystal.indexOf('\'>') + 2).substring(0, rawCrystal.substring(rawCrystal.indexOf('\'>') + 2).indexOf('<')).trim().replaceAll('.',''));
                        }

                        //парсим бонусы
                        let bonusElement = row.children[5];
                        let bonuses = stripHtml(bonusElement.children[0].attributes['data-tooltip-content'].value.split('<br />')).split(',');
                        request.bonuses = bonuses;
                        //если база без юзера
                        /*                        if (row.childNodes[11].childElementCount > 0) {
                                                    //получаем юзер айди
                                                    let rawUserInfo = row.childNodes[11].childNodes[1].attributes['data-tooltip-content'].value.match(/Buddy.*\)/);
                                                    if (rawUserInfo == null) { //я сам
                                                        return;
                                                    }
                                                    let userId = rawUserInfo[0];
                                                    request.user.userId = userId.substring(userId.indexOf('(') + 1, userId.lastIndexOf(')'));

                                                    //парсим юзера
                                                    [...row.childNodes[11].childNodes[1].childNodes].forEach((userInfo, index) => {
                                                        if (index == 1) {
                                                            let username = userInfo.childNodes[1].innerHTML;
                                                            request.user.username = username;
                                                            return;
                                                        }
                                                        if (index % 2 == 1) {
                                                            request.user.userStatuses = [...request.user.userStatuses, userInfo.innerHTML];
                                                        }
                                                    });
                                                }*/

                        //парсим альянсы
                        if (row.children[6].childElementCount > 0) {
                            request.user.allyName = row.children[6].children[0].children[0].innerText;
                        }

                        request.timeToDestroy = row.children[7].children[0].innerText;

                        const response = fetch("http://127.0.0.1:5000/update", {
                            method: "POST", // *GET, POST, PUT, DELETE, etc.
                            mode: "cors", // no-cors, *cors, same-origin
                            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                            credentials: "same-origin", // include, *same-origin, omit
                            headers: {
                                "Content-Type": "application/json",
                            },
                            redirect: "follow", // manual, *follow, error
                            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                            body: JSON.stringify(request, null, ' '), // body data type must match "Content-Type" header
                        });
                    }
                })
                const newSystem = Number(system) + 1;
                localStorage.setItem('parserSystem', newSystem);
                let galaxySystem = document.getElementById('nav_2').children[1];
                galaxySystem.value = newSystem; // начинаем с первой системы
                document.getElementById('galaxy_form').submit();
            } catch (e) {
                console.log(e);
                localStorage.setItem('parserState', 'stopped');
                localStorage.setItem('parserSystem', '1');
            }
        } else {
            localStorage.setItem('parserState', 'stopped');
            localStorage.setItem('parserSystem', '1');
        }
    }

}

function main() {
    let uw = (this.unsafeWindow) ? this.unsafeWindow : window;

    uw.parseGalaxy = function () {
        let galaxySystem = document.getElementById('nav_2').children[1];
        if (localStorage.getItem('parserState') !== 'started') { //начинаем с первой системы
            let galaxyNumber = getCookie('setGalaxyCookie');
            if (galaxyNumber === '1') {
                galaxySystem.value = 1; // начинаем с первой системы
            } else { //вторая галактика
                galaxySystem.value = parseSystemRange()[0].toString(); // [0] - минимальная галактика во второй системе
            }
            document.getElementById('galaxy_form').submit();
            localStorage.setItem('parserState', 'started');
            localStorage.setItem('parserSystem', galaxySystem.value.toString());
        }
    }

    uw.proceedGalaxyParsing = function () {
        let galaxySystem = document.getElementById('nav_2').children[1];
        if (localStorage.getItem('parserState') !== 'started') {
            localStorage.setItem('parserState', 'started');
            localStorage.setItem('parserSystem', galaxySystem.value.toString());
            document.getElementById('galaxy_form').submit();

        }
    }

    uw.parseSystemRange = function parseSystemRange() {
        let systemRange = document.getElementsByClassName('galaxdue1')[2].innerText;
        let onlyRange = systemRange.substring(systemRange.indexOf(':') + 1).trim();
        return onlyRange.split('-').map(e => Number(e.trim()));
    }
}

function parseSystemRange() {
    let systemRange = document.getElementsByClassName('galaxdue1')[2].innerText;
    let onlyRange = systemRange.substring(systemRange.indexOf(':') + 1).trim();
    return onlyRange.split('-').map(e => Number(e.trim()));
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function stripHtml(html)
{
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

let script = document.createElement('script');
script.appendChild(document.createTextNode('(' + main + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);

let galacticBlock = document.getElementById('galactic_block_1');

galacticBlock.insertAdjacentHTML(
    'afterbegin', '<a href="javascript:parseGalaxy()">Начать парсинг  </a>' +
    '<a href="javascript:proceedGalaxyParsing()">  Продолжить парсинг  </a>'
)
