
var App = {
    Constant: {
        DEVELOPMENT: true,
        TIMEOUT: 1000,
        SHORT_TIMEOUT: 500,

        BACK_ICON: "/_nuxt/img/btn-back.c2ee022.svg",
        SHOP_ICON: "/_nuxt/img/shop@3x.6f5bc8a.png",
        INVENTORY_ICON: "/_nuxt/img/assets@3x.b02c22d.png",
        WORLD_TREE_ICON: "/_nuxt/img/world-tree.399e2f8.png",
        SF_SAPLING_ICON: "/_nuxt/img/sapling.fec9ca6.svg",
        SF_MAMA_ICON: "/_nuxt/img/mama.183c7fe.svg",

        INVENTORY__SF_SAPLING_ICON: "/_nuxt/img/sapling.ec87981.svg",
        INVENTORY__SF_MAMA_ICON: "/_nuxt/img/mama.183c7fe.svg",
        
        WATER_ICON: "/_nuxt/img/water@3x.22b98e2.png",
        CROW_ICON: "/_nuxt/img/scarecrow@3x.50e7720.png",
        SMALL_POT_ICON: "/_nuxt/img/small pot@3x.ff8750b.png",
        BIG_POT_ICON: "/_nuxt/img/big pot@3x.430c95a.png",
        
        FARM_INACTIVE_ICON: "/_nuxt/img/farm-inactive.0b47685.svg",
        SEED_INACTIVE_ICON: "/_nuxt/img/seed-inactive.ed4e273.png",
        SUNFLOWER_INACTIVE_ICON: "/_nuxt/img/sunflower-inactive-new.6a7dd8e.png",
        SHOP__TOOLS_INACTIVE_ICON: "/_nuxt/img/tool-inactive-new.1f58383.png",
        PLANT__INACTIVE_ICON: "/_nuxt/img/plant-inactive-new.3472926.png",
        MOTHER_TREE_INACTIVE_ICON: "/_nuxt/img/mother-tree-inactive-new.9a2844d.png",
        CLAIM_SEED_INACTIVE_ICON: "/_nuxt/img/claim-seed-inactive.1a04446.png",

        PLANT_ICON: "/_nuxt/img/plant.a020463.svg",
        MOTHER_TREE_ICON: "/_nuxt/img/mtree.ca90f28.svg",

        QR_CODE_ICON: "/_nuxt/img/qr-code.407e668.svg",

        WATER: "water",
        SMALL_POT: "small pot",
        BIG_POT: "big pot",
        GREENHOUSE: "greenhouse",
        SCARECROW: "scarecrow",
        SF_SAPLING: "sapling",
        SF_MAMA: "mama",
    },
    Utility: {
        getRandomArbitrary: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        timeout: function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        log: function(msg) {
            if(App.Constant.DEVELOPMENT) {
                var date = new Date();
                console.log("[INFO] " + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " -- " + msg);
            }
        },
        getIcon: function(tool) {
            icon = "";
            switch (tool) {
                case App.Constant.WATER:
                    icon = App.Constant.WATER_ICON;
                    break;
                case App.Constant.SCARECROW:
                    icon = App.Constant.CROW_ICON;
                    break;
                case App.Constant.SMALL_POT:
                    icon = App.Constant.SMALL_POT_ICON;
                    break;
                case App.Constant.BIG_POT:
                    icon = App.Constant.BIG_POT_ICON;
                    break;
                case App.Constant.SF_SAPLING:
                    icon = App.Constant.SF_SAPLING_ICON;
                    break;
                case App.Constant.SF_MAMA:
                    icon = App.Constant.SF_MAMA_ICON;
                    break;
            }
            return icon;
        },
    },
    General: {
        
    },
    Account: {
    },
    Inventory: {
        PLANT: 0,
        MOTHER_TREE: 0,
        SF_SAPLING: 0,
        SF_MAMA: 0,
        SEED: 0,
        CLAIM_SEED: 0,
    },
    Balance: {
        LE: 0,
        Sapling: 0,
        PVU: 0,
        BNB: 0,
    },
    Tools: {
    },
    Shop: {
    },
    Farm: {
        Land: {
        },
        Plant: {
        },
    },
    init: async function() {
        var startDate = new Date();
        App.Utility.log("Initializing bot...");
        
        var duration = (new Date() - startDate) / 1000;
        App.Utility.log("Bot finished in " + duration + " seconds.");
    }
}
await App.init();
