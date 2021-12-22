var App = {
    Constant: {
        DEVELOPMENT: true,
        TIMEOUT: 1000,
        SHORT_TIMEOUT: 500,
        Weathers: {
            SPRING: "spring",
            SUMMER: "summer",
            AUTUMN: "autumn",
            WINTER: "winter",
        },

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
        
        URL: {
            WEATHER_TODAY: "https://backend-farm.plantvsundead.com/weather-today",
            FARMING_STATS: "https://backend-farm.plantvsundead.com/farming-stats",
            GET_FARMING_PLANTS: "https://backend-farm.plantvsundead.com/v2/farms/?offset=0&limit=10",
            HARVEST_PLANT: "https://backend-farm.plantvsundead.com/farms/{{id}}/harvest",
            APPLY_TOOL: "https://backend-farm.plantvsundead.com/farms/apply-tool",
            MY_TOOLS: "https://backend-farm.plantvsundead.com/my-tools",
            AVAILABLE_TOOLS: "https://backend-farm.plantvsundead.com/available-tools",
            SUNFLOWERS: "https://backend-farm.plantvsundead.com/sunflowers",
            BUY_TOOLS: "https://backend-farm.plantvsundead.com/buy-tools",
            FARMING_STATS: "https://backend-farm.plantvsundead.com/farming-stats",
        },
        
        FARMING_STAGE: {
            PAUSED: "paused",
            FARMING: "farming",
            CANCELLED: "cancelled",
        },
        
        TOOL: {
            POT: "1",
            WATER: "3",
            SCARECROW: "4"   
        }
    },
    Utility: {
        getRandomArbitrary: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        timeout: function(ms = App.Constant.TIMEOUT) {
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
        le: 0,
        sapling: 0,
        pvu: 0,
        bnb: 0,
        get: function() {
            return new Promise(async function(resolve) {
                const r1 = await fetch(App.Constant.URL.FARMING_STATS, App.Request.getHeaderOptions(App.Request.Method.GET));
                const j1 = await r1.json(); 
                App.Balance.le = j1.data.leWallet;
                resolve();
            });
        }
    },
    Tools: {
        POT: 0,
        SCARECROW: 0,
        WATER: 0,
        init: function() {
            return new Promise(async function(resolve) {
                const r1 = await fetch(App.Constant.URL.MY_TOOLS, App.Request.getHeaderOptions(App.Request.Method.GET));
                const j1 = await r1.json(); 
                for(var tool in j1.data) {
                    tool = j1.data[tool];
                    if(App.Tools.hasOwnProperty(tool.type)) {
                        App.Tools[tool.type] = tool.usages;
                    }
                }
                resolve();
            });
        },
    },
    Shop: {
        go: function() {
            return new Promise(async function(resolve) {
                // does nothing but needs to request
                const r1 = await fetch(App.Constant.URL.AVAILABLE_TOOLS, App.Request.getHeaderOptions(App.Request.Method.GET));
                const j1 = await r1.json();
                const r2 = await fetch(App.Constant.URL.SUNFLOWERS, App.Request.getHeaderOptions(App.Request.Method.GET));
                const j2 = await r2.json();
                await App.Utility.timeout();
                resolve();
            });
        },
        buy: function(toolId, amount) {
            return new Promise(async function(resolve) {
                await App.Shop.go();
                const r2 = await fetch(App.Constant.URL.BUY_TOOLS, App.Request.getHeaderOptions(App.Request.Method.POST, {
                    amount: amount,
                    toolId: toolId
                }));
                const j2 = await r2.json();
                await App.Farm.getStats();
                await App.Utility.timeout();
                await App.Farm.go();
            });
        }
    },
    Request: {
        Method: {
            GET: "get",
            POST: "post"
        },
        getHeaderOptions: function(method, data = null) {
            var options = {
                method: method,
                headers: new Headers({
                    'authorization': 'Bearer Token: ' + localStorage.getItem("token"),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                })
            };
            if(data != null) {
                options.body = JSON.stringify(data)
            }
            return options;
        }
    },
    Weather: {
        data: {},
        get: function() {
            return new Promise(async function(resolve) {
                const r1 = await fetch(App.Constant.URL.WEATHER_TODAY, App.Request.getHeaderOptions(App.Request.Method.GET));
                const j1 = await r1.json();
                App.Weather.data = j1.data;
                resolve();
            });
        }
    },
    Farm: {
        init: async function() {
            var plants = await App.Farm.Plant.getFarming();
            for (var plant in plants.data) {
                plant = plants.data[plant];
                if(plant.stage == App.Constant.FARMING_STAGE.CANCELLED && plant.totalHarvest > 0) {
                    var r = App.Farm.Plant.harvest(plant);
                    App.Balance.le += r.data.amount;
                }
                if(plant.hasCrow) {
                    const scarecrow_request = await fetch(App.Constant.URL.APPLY_TOOL, App.Request.getHeaderOptions(App.Request.Method.POST, {
                        farmId: plant._id,
                        toolId: App.Constant.TOOL.SCARECROW
                    }));
                    const scarecrow_response = await scarecrow_request.json();
                    await App.Utility.timeout();
                }
                if(plant.needWater) {
                    const water_request = await fetch(App.Constant.URL.APPLY_TOOL, App.Request.getHeaderOptions(App.Request.Method.POST, {
                        farmId: plant._id,
                        toolId: App.Constant.TOOL.WATER
                    }));
                    const water_response = await water_request.json();
                    await App.Utility.timeout();
                }
                for(var tool in plant.activeTools) {
                    tool = plant.activeTools[tool];
                    if(tool.id == App.Constant.TOOL.POT) {
                        if(tool.count < 2) {
                            if(App.Tools[tool.type] == 0) {
                                await App.Shop.buy(App.Constant.TOOL.POT,1);
                            }
                            const pot_request = await fetch(App.Constant.URL.APPLY_TOOL, App.Request.getHeaderOptions(App.Request.Method.POST, {
                                farmId: plant._id,
                                toolId: App.Constant.TOOL.POT
                            }));
                            const pot_response = await pot_request.json();
                            await App.Utility.timeout();
                        }
                    }
                }
            }
        },
        go: function() {
            return new Promise(async function(resolve) {
                await App.Farm.getStats();
                await App.Tools.init();
                await App.Farm.Plant.getFarming();
                await App.Utility.timeout();
                resolve();
            });
        },
        getStats: function() {
            return new Promise(async function(resolve) {
                const r1 = await fetch(App.Constant.URL.GET_FARMING_PLANTS, App.Request.getHeaderOptions(App.Request.Method.GET));
                const j1 = await r1.json();
                resolve();
            });
        },
        Land: {
        },
        Plant: {
            getFarming: function() {
                return new Promise(async function(resolve) {
                    const r1 = await fetch(App.Constant.URL.GET_FARMING_PLANTS, App.Request.getHeaderOptions(App.Request.Method.GET));
                    const j1 = await r1.json(); 
                    resolve(j1);
                });
            },
            harvest: function(plant) {
                return new Promise(async function(resolve) {
                    const r1 = await fetch(App.Constant.URL.HARVEST_PLANT.replace("{{id}}", plant._id), App.Request.getHeaderOptions(App.Request.Method.POST));
                    const j1 = await r1.json(); 
                    resolve(j1);
                });
            }
        },
    },
    init: async function() {
        var startDate = new Date();
        App.Utility.log("Initializing bot...");
        await App.Tools.init();
        await App.Farm.init();
        var duration = (new Date() - startDate) / 1000;
        App.Utility.log("Bot finished in " + duration + " seconds.");
    }
}
await App.init();
