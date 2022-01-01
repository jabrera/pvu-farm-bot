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
        ROOT_URL: "https://backend-farm.plantvsundead.com",
        API: {
            WEATHER_TODAY: "/weather-today",
            FARMING_STATS: "/farming-stats",
            FARMING_PLANTS: "/v2/farms/?offset=0&limit=10",
            HARVEST_PLANT: "/farms/{{id}}/harvest",
            APPLY_TOOL: "/farms/apply-tool",
            MY_TOOLS: "/my-tools",
            AVAILABLE_TOOLS: "/available-tools",
            SUNFLOWERS: "/sunflowers",
            BUY_TOOLS: "/buy-tools",
            BUY_SUNFLOWERS: "/buy-sunflowers",
            FARMING_STATS: "/farming-stats",
            FREE_SLOTS: "/farms/free-slots",
            MY_LANDS: "/my-lands?offset=0&limit=20",
            MY_PLANTS: "/my-plants?offset=0&limit=10&type=1&status=0",
            MY_MOTHER_TREES: "/my-plants?offset=0&limit=10&type=2&status=0",
            MY_SUNFLOWERS: "/my-sunflowers?limit=10&offset=0&status=0",
            ADD_PLANT: "/farm/add-plant",
            REMOVE_PLANT: "/farm/remove-plant",
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
        },
        SHOP: {
            TOOL: {
                "1": 50,
                "3": 50,
                "4": 20,
            },
            SUNFLOWER: {
                2: 200,
                1: 100,
            }
        },
        SUNFLOWER: {
            MAMA: 2,
            SAPLING: 1,
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
        },
        get: async function(url, data = null) {
            return new Promise(async function(resolve) {
                resolve(await App.Request.send(url, App.Request.Method.GET, data));
            });
        },
        post: async function(url, data = null) {
            return new Promise(async function(resolve) {
                resolve(await App.Request.send(url, App.Request.Method.POST, data));
            });
        },
        send: async function(url, method, data = null) {
            return new Promise(async function(resolve) {
                // App.Utility.log(`${method} ${url}`);
                // if(data != null) {
                //     App.Utility.log(`with data ${JSON.stringify(data)}`);
                // }
                const request = await fetch(App.Constant.ROOT_URL + url, App.Request.getHeaderOptions(method, data));
                const response = await request.json();
//                 App.Utility.log(JSON.stringify(response));
                resolve(response);
            });
        },
    },
    Utility: {
        getRandomArbitrary: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        timeout: function(ms = App.Constant.TIMEOUT) {
            // App.Utility.log(`Pause for ${ms} ms`);
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        log: function(msg) {
            if(App.Constant.DEVELOPMENT) {
                var date = new Date();
                console.log("[INFO] " + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " -- " + msg);
            }
        },
        error: function(msg) {
            if(App.Constant.DEVELOPMENT) {
                var date = new Date();
                console.error("[ERROR] " + date.toLocaleDateString() + " " + date.toLocaleTimeString() + " -- " + msg);
            }
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
                const farming_stats = await App.Request.get(App.Constant.API.FARMING_STATS);
                App.Balance.le = farming_stats.data.leWallet;
                App.Utility.log(`LE Balance: ${App.Balance.le} LE`);
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
                const my_tools = await App.Request.get(App.Constant.API.MY_TOOLS);
                App.Utility.log(`Your Tools:`);
                for(var tool in my_tools.data) {
                    tool = my_tools.data[tool];
                    if(App.Tools.hasOwnProperty(tool.type)) {
                        App.Tools[tool.type] = tool.usages;
                        App.Utility.log(`${tool.type}: ${tool.usages}`);
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
                await App.Request.get(App.Constant.API.AVAILABLE_TOOLS);
                await App.Request.get(App.Constant.API.SUNFLOWERS);
                await App.Utility.timeout();
                resolve();
            });
        },
        buy_tools: function(toolId, amount) {
            return new Promise(async function(resolve) {
                var leNeeded = App.Constant.SHOP.TOOL[toolId] * amount;
                App.Utility.log(`Buying ${amount} pcs. for tool ${toolId} = ${leNeeded} LE`);
                if(App.Balance.le >= leNeeded) {
                    await App.Shop.go();
                    await App.Request.post(App.Constant.API.BUY_TOOLS, {
                        amount: amount,
                        toolId: toolId
                    });
                    App.Balance.le -= leNeeded;
                    App.Utility.log(`Bought ${amount} pcs. for tool ${toolId}`);
                    App.Utility.log(`New LE Balance: ${App.Balance.le}`);
                    await App.Farm.getStats();
                    await App.Utility.timeout();
                    await App.Farm.go();
                    resolve(true);
                } else {
                    App.Utility.error("Cannot buy tool " + toolId + ". LE Needed: " + leNeeded + ". You only have " + App.Balance.le + " LE");
                    resolve(false);
                }
            });
        },
        buy_sunflowers: function(sunflowerId, amount) {
            return new Promise(async function(resolve) {
                resolve(true);
//                 var leNeeded = App.Constant.SHOP.SUNFLOWER[sunflowerId] * amount;
//                 App.Utility.log(`Buying ${amount} pcs. for sunflower ${sunflowerId} = ${leNeeded} LE`);
//                 if(App.Balance.le >= leNeeded) {
//                     await App.Shop.go();
//                     await App.Request.post(App.Constant.API.BUY_SUNFLOWERS, {
//                         amount: amount,
//                         sunflowerId: sunflowerId
//                     });
//                     App.Balance.le -= leNeeded;
//                     App.Utility.log(`Bought ${amount} pcs. for tool ${sunflowerId}`);
//                     App.Utility.log(`New LE Balance: ${App.Balance.le}`);
//                     await App.Farm.getStats();
//                     await App.Utility.timeout();
//                     await App.Farm.go();
//                     resolve(true);
//                 } else {
//                     App.Utility.error("Cannot buy sunflower " + sunflowerId + ". LE Needed: " + leNeeded + ". You only have " + App.Balance.le + " LE");
//                     resolve(false);
//                 }
            });
        }
    },
    Weather: {
        data: {},
        get: function() {
            return new Promise(async function(resolve) {
                App.Utility.log(`Getting season data...`);
                const weather = await App.Request.get(App.Constant.API.WEATHER_TODAY);
                App.Weather.data = weather.data;
                App.Utility.log(`Season: ${App.Weather.data.season}`);
                resolve();
            });
        }
    },
    Farm: {
        init: async function() {
            App.Utility.log(`Starting farm...`);
            var plants = await App.Farm.Plant.getFarming();
            App.Utility.log(`Harvest plants - START`);
            for (var plant in plants.data) {
                plant = plants.data[plant];
                App.Utility.log(`\tFor Plant ${plant.plantId} ${(plant.hasOwnProperty("plantElement") ? '('+plant.plantElement+')' : '(sunflower)')}`);
                if(plant.stage == App.Constant.FARMING_STAGE.CANCELLED) {
                    if(plant.totalHarvest > 0) {
                        App.Utility.log(`\tHarvesting...`);
                        var r = await App.Farm.Plant.harvest(plant);
                        App.Balance.le += r.data.amount;
                    } else {
                        await App.Farm.Plant.remove(plant);
                    }
                    continue;
                } else {
                    App.Utility.log(`\t\tNothing to harvest.`);
                }
            }
            App.Utility.log(`Harvest plants - END`);
            App.Utility.log(`Plant plants - START`);
            var plant_available = null;
            var motherTree_available = null;
            var skipPlantLots = false;
            var skipMotherTreeLots = false;
            while(plant_available != 0 || motherTree_available != 0) {
                var free_slots = await App.Farm.Land.getFreeSlots();
                plant_available = 0;
                motherTree_available = 0;
                for(var land in free_slots.data.availableSlots) {
                    land = free_slots.data.availableSlots[land];
                    plant_available += land.availablePlantCapacity;
                    motherTree_available += land.availableMotherTreeCapacity;
                }
                if(free_slots.data.farm.length != 0) {
                    App.Utility.log(`\tHas ${free_slots.data.farm.length} free slots!`);
                    var selectedFarm = free_slots.data.farm[0];
                    if(plant_available > 0 && !skipPlantLots) {
                        var plants = await App.Farm.Plant.getMyPlants();
                        var selectedPlant = null;
                        for(var plant in plants.data) {
                            plant = plants.data[plant];
                            var seasonEndDate = new Date(App.Weather.data.seasonEndTime);
                            var today = new Date();
                            var diffHours = Math.floor(Math.abs(today-seasonEndDate) / 1000 / 60 / 60);
                            if(App.Weather.data.allowedPlants.includes(plant.plant.stats.type) && plant.plant.farmConfig.hours < diffHours) {
                                if(selectedPlant == null) {
                                    selectedPlant = plant;
                                } else if(selectedPlant.plant.farmConfig.le / selectedPlant.plant.farmConfig.hours < plant.plant.farmConfig.le / plant.plant.farmConfig.le) {
                                    selectedPlant = plant;
                                }
                            }
                        }
                        if(selectedPlant == null) {
                            App.Utility.log(`\t\tNo extra plants. Skipping...`);
                            skipPlantLots = true;
//                             plants = await App.Farm.Plant.getMySunflowers();
//                             for(var plant in plants.data) {
//                                 plant = plants.data[plant];
//                                 if(plant.sunflowerId == App.Constant.SUNFLOWER.SAPLING) {
//                                     if(plant.usages == 0) {
//                                         App.Utility.log(`\t\tInsufficient sunflower salpings. Buying...`);
//                                         if(await App.Shop.buy_sunflowers(App.Constant.SUNFLOWER.SAPLING,1) == false) continue;
//                                     }
//                                     App.Utility.log(`\t\tPlanting sunflower sapling.`);
//                                     await App.Farm.Plant.add(selectedFarm, "0", App.Constant.SUNFLOWER.SAPLING);
//                                     App.Utility.log(`\t\tSunflower sapling planted!`);
//                                 }
//                             }
                        } else {
                            App.Utility.log(`\t\tPlanted ${selectedPlant.plantId} (${selectedPlant.plantElement})!`);
                            await App.Farm.Plant.add(selectedFarm, "0", selectedPlant);
                        }
                        plant_available--;
                    } else if(motherTree_available > 0 && !skipMotherTreeLots) {
                        var plants = await App.Farm.Plant.getMyMotherTrees();
                        var selectedPlant = null;
                        for(var plant in plants.data) {
                            plant = plants.data[plant];
                            var seasonEndDate = new Date(App.Weather.data.seasonEndTime);
                            var today = new Date();
                            var diffHours = Math.floor(Math.abs(today-seasonEndDate) / 1000 / 60 / 60);
                            if(App.Weather.data.allowedPlants.includes(plant.plant.stats.type) && plant.plant.farmConfig.hours < diffHours) {
                                if(selectedPlant == null) {
                                    selectedPlant = plant;
                                } else if(selectedPlant.plant.farmConfig.le / selectedPlant.plant.farmConfig.hours < plant.plant.farmConfig.le / plant.plant.farmConfig.le) {
                                    selectedPlant = plant;
                                }
                            }
                        }
                        if(selectedPlant == null) {
                            App.Utility.log(`\t\tNo extra plants. Skipping...`);
                            skipMotherTreeLots = true;
//                             plants = await App.Farm.Plant.getMySunflowers();
//                             for(var plant in plants.data) {
//                                 plant = plants.data[plant];
//                                 if(plant.sunflowerId == App.Constant.SUNFLOWER.MAMA) {
//                                     if(plant.usages == 0) {
//                                         App.Utility.log(`\t\tInsufficient sunflower mama. Buying...`);
//                                         if(await App.Shop.buy_sunflowers(App.Constant.SUNFLOWER.MAMA,1) == false) continue;
//                                     }
//                                     App.Utility.log(`\t\tPlanting sunflower mama.`);
//                                     await App.Farm.Plant.add(selectedFarm, "0", App.Constant.SUNFLOWER.MAMA);
//                                     App.Utility.log(`\t\tSunflower mama planted!`);
//                                 }
//                             }
                        } else {
                            App.Utility.log(`\t\tPlanted ${selectedPlant.plantId} (${selectedPlant.plantElement})!`);
                            await App.Farm.Plant.add(selectedFarm, "0", selectedPlant);
                        }
                        motherTree_available--;
                    }
                }
                console.log(skipMotherTreeLots, skipPlantLots)
                if(skipMotherTreeLots && skipPlantLots)
                    break;
            }
            App.Utility.log(`Plant plants - END`);
            App.Utility.log(`Maintening farm - START`);
            var plants = await App.Farm.Plant.getFarming();
            for (var plant in plants.data) {
                plant = plants.data[plant];
                App.Utility.log(`\tFor Plant ${plant.plantId} ${(plant.hasOwnProperty("plantElement") ? '('+plant.plantElement+')' : '(sunflower)')}`);
                if(plant.hasCrow) {
                    App.Utility.log(`\t\tHas crow...`);
                    if(App.Tools.SCARECROW == 0) {
                        App.Utility.log(`\t\t\tNo scarecrow tool. Buying...`);
                        if(await App.Shop.buy_tools(App.Constant.TOOL.SCARECROW,1) == false) continue;
                    }
                    App.Utility.log(`\t\t\tApplying scarecrow to plant...`);
                    await App.Request.post(App.Constant.API.APPLY_TOOL, {
                        farmId: plant._id,
                        toolId: App.Constant.TOOL.SCARECROW
                    });
                    App.Tools.SCARECROW -= 1;
                    App.Utility.log(`\t\t\tCrow gone.`);
                    await App.Utility.timeout();
                }
                if(plant.needWater) {
                    App.Utility.log(`\t\tNeeds water...`);
                    if(App.Tools.WATER < 2) {
                        App.Utility.log(`\t\t\tNo water tool. Buying...`);
                        if(await App.Shop.buy_tools(App.Constant.TOOL.WATER,1) == false) continue;
                    }
                    App.Utility.log(`\t\t\tWatering plant...`);
                    await App.Request.post(App.Constant.API.APPLY_TOOL, {
                        farmId: plant._id,
                        toolId: App.Constant.TOOL.WATER
                    });
                    App.Tools.WATER -= 2;
                    App.Utility.log(`\t\t\tPlant watered.`);
                    await App.Utility.timeout();
                }
                for(var tool in plant.activeTools) {
                    tool = plant.activeTools[tool];
                    if(tool.id == parseInt(App.Constant.TOOL.POT)) {
                        var currentPot = tool.count;
                        while(currentPot < 2) {
                            App.Utility.log(`\t\tPot needed...`);
                            if(App.Tools[tool.type] == 0) {
                                App.Utility.log(`\t\t\tNo pot tool. Buying...`);
                                if(await App.Shop.buy_tools(App.Constant.TOOL.POT,1) == false) break;
                            }
                            App.Utility.log(`\t\t\tAdding pot to plant...`);
                            await App.Request.post(App.Constant.API.APPLY_TOOL, {
                                farmId: plant._id,
                                toolId: App.Constant.TOOL.POT
                            });
                            App.Tools[tool.type] -= 1;
                            App.Utility.log(`\t\t\tPot added.`);
                            currentPot++;
                            await App.Utility.timeout();
                        }
                    }
                }
            }
            App.Utility.log(`Maintening farm - END`);
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
                resolve(await App.Request.get(App.Constant.API.FARMING_STATS));
            });
        },
        Land: {
            getFreeSlots: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.API.FREE_SLOTS));
                });
            },
            getLands: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.API.MY_LANDS));
                });
            },
        },
        Plant: {
            getMyPlants: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.API.MY_PLANTS));
                });
            },
            getMyMotherTrees: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.API.MY_MOTHER_TREES));
                });
            },
            getMySunflowers: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.API.MY_SUNFLOWERS));
                });
            },
            getFarming: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.API.FARMING_PLANTS));
                });
            },
            harvest: function(plant) {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.post(App.Constant.API.HARVEST_PLANT.replace("{{id}}", plant._id)));
                });
            },
            remove: function(plant) {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.post(App.Constant.API.REMOVE_PLANT, {
                        farmId: plant._id
                    }));
                });
            },
            add: function(farm, land, plant) {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    if(plant == App.Constant.SUNFLOWER.SAPLING || plant == App.Constant.SUNFLOWER.MAMA) {
                        resolve(await App.Request.post(App.Constant.API.ADD_PLANT, {
                            farmId: farm._id,
                            landId: land,
                            sunflowerId: plant
                        }));
                    } else {
                        resolve(await App.Request.post(App.Constant.API.ADD_PLANT, {
                            farmId: farm._id,
                            landId: land,
                            plantId: plant.plantId
                        }));
                    }
                });
            }
        },
    },
    init: async function() {
        var startDate = new Date();
        App.Utility.log("Initializing bot...");
        await App.Tools.init();
        await App.Balance.get();
        await App.Weather.get();
        await App.Farm.init();
        var duration = (new Date() - startDate) / 1000;
        App.Utility.log("Bot finished in " + duration + " seconds.");
    }
}
await App.init();
