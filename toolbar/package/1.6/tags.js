if (typeof window == "undefined") {
    // compiling the javascript where there is no global window object
    var conduit_deps = "conduit_deps";
} else if (config.compiled) {
    var conduit_deps = "compiled/conduit_deps";
} else {
    var conduit_deps = "conduit_deps";
}
var tags = [

    { name: "lib/jquery" },
    { name: "lib/json2" },
    { name: "lib/jstorage" },
    { name: "lib/underscore" },
    { name: "lib/backbone" },
    { name: "lib/backbone.localStorage" },
    { name: "js/_stats", requires : ["lib/jquery.cookie"]},

    { name: "deps", tagOnly:true,
      requires: [
        "lib/jquery",
        "lib/json2",
        "lib/jstorage",
        "lib/underscore",
        "lib/backbone",
        "lib/backbone.localStorage",
        "lib/jquery.cookie"
    ]},

    { name: "falcon-api/js/deps/SHA-1" },
    { name: "falcon-api/js/deps/jsbn" },
    { name: "falcon-api/js/deps/jsbn2" },
    { name: "falcon-api/js/deps/sjcl" },
    { name: "falcon-api/js/falcon" },
    { name: "falcon-api/js/falcon.encryption" },
    { name: "falcon-api/js/falcon.api" },
    { name: "falcon-api/js/falcon.session" },

    { name: "falcon", tagOnly:true,
      requires: [
        "falcon-api/js/deps/SHA-1",
        "falcon-api/js/deps/jsbn",
        "falcon-api/js/deps/jsbn2",
        "falcon-api/js/deps/sjcl",
        "falcon-api/js/falcon",
        "falcon-api/js/falcon.encryption",
        "falcon-api/js/falcon.api",
        "falcon-api/js/falcon.session"
    ]},

    { name: "btapp/pairing.btapp" },

    { name: "js/common" },
    { name: "js/settings" },
    { name: "js/siblings" },

    { name: "js/client", requires: ["btapp/pairing.btapp", "falcon", "deps", "js/common"] },
    { name: "js/client.view", requires: ["js/client"] },
    { name: "js/torrent", requires: ["js/common"] },
    { name: "js/torrent.view", requires: ["js/torrent"] },

    { name: "js/app", requires: ["js/settings", "js/siblings"] },

    { name: "conduit_deps", tagOnly: true,
      requires: ["deps", "js/_stats", "js/common", "js/client.view", "js/torrent.view", "js/app"] },
    { name: "compiled/conduit_deps" },
    { name: "web", requires: [conduit_deps] }, // standalone web app
    { name: "client", requires: [conduit_deps] }, // conduit main toolbar thing
    { name: "clients", requires: [conduit_deps] }, // clients gadget dropdown
    { name: "torrent", requires: [conduit_deps] },
    { name: "torrents", requires: [conduit_deps] },
    { name: "add", requires: [conduit_deps] }, // add torrent gadget
    { name: "login", requires: [conduit_deps] }, // add torrent gadget
    { name: "pairing", requires: [conduit_deps] }, // pairing dialog+iframe
    { name: "signup", requires: [conduit_deps] }, // signup
    { name: "uquest", requires: [conduit_deps] } // uquest
];


