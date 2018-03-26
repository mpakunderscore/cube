let scenarioArray = {};

let gpio = require('./gpio');
let api = require('./api');

function parseScenario(text) {

    let scenarioRows = text.split("\n");

    console.log(scenarioRows.length + ' rows in scenario');
    log(scenarioRows.length + ' rows in scenario');

    for (let i = 0; i < scenarioRows.length; i++) {

        let row = scenarioRows[i].trim();

        if (row.startsWith("if")) {
            console.log("if")
        }
    }
}

function changeState(id, state) {

    if (gpio.pins[id].state === state)
        return;

    gpio.pins[id].state = state;

    if (gpio.pins[id].type === true)
        gpio.changeInterface(id);

    api.broadcastState(id);
}

exports.checkScenario = function () {

    if (gpio.pins[9].state === true) {

        changeState(4, false);
    }

    if (gpio.pins[10].state === true) {
        changeState(5, false);
    }

    if (gpio.pins[11].state === true) {
        changeState(6, false);
    }

    if (gpio.pins[14].state === true) {
        changeState(8, false);
    }

    // Еще одна задача выполняется параллельно этим, но её шаги должны быть последовательны:
    // При срабатывании сенсора 12 устанавливаем 17 в значение ON и начинаем слушать сенсоры 16 и 13. На сенсор 16 реагируем многоразово, при его срабатывании ставим 2 в OFF и 3 в ON, при его деактивации - ставим 2 в ON и 3 в OFF. При срабатывании сенсора 13 ставим 7 в OFF, 3 в OFF, 2 в ON, 17 в OFF, перестаем слушать сенсор 16.

    if (gpio.pins[12].state === true) {
        changeState(17, true);

        // теперь слушаем эти сенсоры
        changeState(16, false);
        changeState(13, false);
    }

    if (gpio.pins[16].state === true) {
        changeState(2, false);
        changeState(3, true);
    }

    if (gpio.pins[16].state === false) {
        changeState(2, true);
        changeState(3, false);
    }

    if (gpio.pins[13].state === true)  {

        changeState(2, false);
        changeState(3, false);
        changeState(7, false);
        changeState(17, false);

        // TODO это сенсор, и его неперь не слушаем
        changeState(16, null);
    }
};