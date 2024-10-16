var spin = require('spinnies');

var spinner = {
    "interval": 100,
    "frames": [
        "",
        "Neraka VIP V4",
        "VIP V4 Neraka",
        "Neraka VIP V4",
        "Neraka VIP V4",
        "VIP V4 Neraka",
        "Neraka VIP V4",
        "VIP V4 Neraka",
        "Neraka VIP V4",
        "VIP V4 Neraka",
        "Neraka VIP V4",
        ""
    ]
};

let globalSpinner;

var getGlobalSpinner = (disableSpins = false) => {
    if (!globalSpinner) globalSpinner = new spin({ color: 'white', succeedColor: 'blue', spinner, disableSpins });
    return globalSpinner;
};

let spins = getGlobalSpinner(false);

module.exports.start = (id, text) => {
    spins.add(id, { text: text });
};
