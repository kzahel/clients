var tags = [

    { name: "lib/jquery" },
    { name: "lib/json2" },
    { name: "lib/jstorage" },
    { name: "lib/underscore" },
    { name: "lib/backbone" },
    { name: "lib/backbone.localStorage" },

    { name: "deps", tagOnly:true,
      requires: [
        "lib/jquery",
        "lib/json2",
        "lib/jstorage",
        "lib/underscore",
        "lib/backbone",
        "lib/backbone.localStorage"
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
    { name: "js/client", requires: ["btapp/pairing.btapp", "falcon", "deps"] },
    { name: "js/client.view", requires: ["js/client"] },
    { name: "js/torrent" },
    { name: "js/torrent.view", requires: ["js/torrent"] },

    { name: "js/app" },

    { name: "conduit_deps", tagOnly: true,
      requires: ["deps", "js/common", "js/client.view", "js/torrent.view", "js/app"] },

    { name: "web", requires: ["conduit_deps"] }, // standalone web app

    { name: "client", requires: ["conduit_deps"] }, // conduit main toolbar thing
    { name: "clients", requires: ["conduit_deps"] }, // clients gadget dropdown

    { name: "torrent", requires: ["conduit_deps"] },
    { name: "torrents", requires: ["conduit_deps"] },

    { name: "add", requires: ["conduit_deps"] }, // add torrent gadget
    { name: "login", requires: ["conduit_deps"] } // add torrent gadget

];