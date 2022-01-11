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
            FARMS: "/farms/",
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
            MAMA: "MAMA",
            SAPLING: "SAPLING",
        }
    },
    Gathering: {
        ROOT_URL: "https://gather.plantvsundead.com",
        API: {
            ENTER_GATHER: "/user/enter-gather",
            ROUTE: "/map/route",
            SKIP_ROUTE: "/map/force-skip-current-route",
            START_MINIGAME: "/map/start-minigame",
            START_MYSTERY: "/map/start-mystery",

            CHOPPING_MAP: "/chopping/get-map",
            CHOPPING_TREE: "/chopping/chopping-tree",
            CHOPPING_REWARD: "/chopping/collect-reward",
            CHOPPING_FINISH: "/chopping/finish-map",

            MINING_MAP: "/mining/get-map",
            MINING_START: "/mining/start",
            MINING_SHOOT: "/mining/shoot",
            MINING_REWARD: "/mining/reward",
            MINING_BAG: "/mining/add-travel-bag",
            MINING_FINISH: "/mining/finish-map",
        },
        CHOPPING_INDEX: 0,
        MINING_INDEX: 1,
        FISHING_INDEX: 2,
        MYSTERY_INDEX: 3,
        STATUS_CODE: {
            TRAVEL_BAG_FULL: 1100,
        },
        getPrioritizedMiniGames: () => [App.Gathering.MYSTERY_INDEX, App.Gathering.CHOPPING_INDEX, App.Gathering.MINING_INDEX, App.Gathering.FISHING_INDEX],
        data: {},
        init: function() {
            return new Promise(async function(resolve) {
                var nextAvailableGame = null;
                App.Utility.log("Initializing Gathering Mode");
                while(true) {
                    await App.Gathering.enter();
                    await App.Gathering.route();
                    var playingIndex = App.Gathering.data.route.playingRouteIndex;
                    var map = App.Gathering.data.route.config;
                    
                    if(App.Gathering.data.route.playingMiniGameIndex != -1) {
                        await App.Gathering.skip_route();
                    }

                    var passedMiniGameIndex = App.Gathering.data.route.passedMiniGameIndex;
                    if(passedMiniGameIndex.length != 0) {
                        var lastPassedMiniGame = map[passedMiniGameIndex.length-1].miniGames[passedMiniGameIndex[passedMiniGameIndex.length-1]];
                        nextAvailableGame = lastPassedMiniGame.outGoing;
                    }

                    var currentStep = map[playingIndex];
                    App.Utility.log("Current step: " + playingIndex);
                    var selectedMiniGame = null;
                    for(var x in App.Gathering.getPrioritizedMiniGames()) {
                        var prioritizedMiniGame = App.Gathering.getPrioritizedMiniGames()[x];
                        for(var y in currentStep.miniGames) {
                            if(nextAvailableGame != null) {
                                if(!nextAvailableGame.includes(parseInt(y))) {
                                    continue;
                                }
                            }
                            var availableMiniGame = currentStep.miniGames[y];
                            if(availableMiniGame.nodeType == prioritizedMiniGame) {
                                selectedMiniGame = availableMiniGame;
                                break;
                            }
                        }
                        if(selectedMiniGame != null) break;
                    }
                    App.Utility.log("Selected mini game: ");
                    console.log(selectedMiniGame);
                    if(selectedMiniGame.nodeType == App.Gathering.MYSTERY_INDEX) {
                        var mysteryResponse = await App.Gathering.MiniGame.Mystery.init();
                        if(!mysteryResponse.data.hasOwnProperty("miniGame")) {
                            App.Utility.log("Mystery has no mini game assigned");
                            break;
                        }
                        selectedMiniGame = mysteryResponse.data.miniGame;
                    }
                    if(selectedMiniGame.nodeType == App.Gathering.CHOPPING_INDEX) {
                        await App.Gathering.MiniGame.Chopping.init();
                    } else if(selectedMiniGame.nodeType == App.Gathering.MINING_INDEX) {
                        await App.Gathering.MiniGame.Mining.init();
                    } else {
                        break;
                    }
                    if(App.Gathering.data.enter.currentStamina < 50) {
                        break;
                    }
                }
                App.Utility.log("Finished Gathering Mode");
                resolve();
            });
        },
        enter: function() {
            return new Promise(async function(resolve) {
                const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.ENTER_GATHER);
                App.Gathering.data["enter"] = response.data;
                resolve();
            });
        },
        route: function() {
            return new Promise(async function(resolve) {
                const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.ROUTE);
                App.Gathering.data["route"] = response.data;
                resolve();
            });
        },
        skip_route: function() {
            return new Promise(async function(resolve) {
                const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.SKIP_ROUTE);
                App.Gathering.data["route"] = response.data.route;
                resolve();
            });
        },
        start: function(miniGameIndex) {
            return new Promise(async function(resolve) {
                const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.START_MINIGAME, {
                    "miniGameIndex": miniGameIndex
                });
                resolve(response.data);
            });
        },
        MiniGame: {
            Chopping: {
                SMALL_TREE: "SMALL_TREE",
                SMALL_STUMP: "SMALL_STUMP",
                init: function() {
                    return new Promise(async function(resolve) {
                        App.Utility.log("\tStarting Chopping MiniGame");
                        var start = await App.Gathering.start(App.Gathering.CHOPPING_INDEX);
                        await App.Utility.timeout(1000);
                        var map = await App.Gathering.MiniGame.Chopping.getMap(start.playingMiniGameId);
                        var trees = map.objects;
                        for(var treeIndex in trees) {
                            var tree = trees[treeIndex];
                            while(App.Gathering.data.enter.currentStamina != 0) {
                                App.Utility.log("\t\tChopping tree #" + treeIndex + "...");
                                var choppedTree = await App.Gathering.MiniGame.Chopping.chop(treeIndex);
                                App.Gathering.data.enter.currentStamina--;
                                if(choppedTree.hasOwnProperty("rewards")) {      
                                    if(choppedTree.rewards.length != 0) {
                                        for(var rewardIndex in choppedTree.rewards) {
                                            await App.Utility.timeout(500);
                                            var reward = choppedTree.rewards[rewardIndex];
                                            App.Utility.log("\t\t\tClaiming reward " + reward.token);
                                            await App.Gathering.MiniGame.Chopping.reward(reward.token);
                                        }
                                    }
                                    await App.Utility.timeout(100);
                                    if(choppedTree.tree.type == App.Gathering.MiniGame.SMALL_STUMP && choppedTree.tree.isExploited) {
                                        App.Utility.log("\t\t\tTree #" + treeIndex + " chopped.");
                                        break;
                                    }
                                } else {
                                    break;
                                }
                            }
                            await App.Utility.timeout(2000);
                        }
                        App.Utility.log("\tFinished Chopping MiniGame");
                        if(App.Gathering.data.enter.currentStamina != 0) {
                            await App.Gathering.MiniGame.Chopping.finish();
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                },
                getMap: function(miniGameId) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.CHOPPING_MAP + "?miniGameId=" + miniGameId);
                        resolve(response.data);
                    });
                },
                chop: function(treeIndex) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.CHOPPING_TREE, {
                            "treeIndex": treeIndex
                        });
                        resolve(response.data);
                    });
                },
                reward: function(rewardToken) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.CHOPPING_REWARD, {
                            "rewardToken": rewardToken
                        });
                        resolve();
                    });
                },
                finish: function() {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.CHOPPING_FINISH);
                        resolve();
                    });
                }
            },
            Mining: {
                ItemType: {
                    COMMON_ROCK: 11,
                    RARE_ROCK: 12,
                },
                generateObjectId: function(gemId) {
                    // ez pattern pvu devs
                    var objectId = "";
                    var abc = "abcdefghijklmnopqrstuvwxyz".split("");
                    var part = 0;
                    gemId.split("").forEach(function(char, index) {
                        if(char != "-") {
                            var shiftCount = gemId.split("-")[part].split("").length;
                            if(char.toUpperCase() != char.toLowerCase()) {
                                char = abc[(abc.indexOf(char) + shiftCount) % abc.length]
                            } else {
                                char = (parseInt(char) + shiftCount) % 10;
                            }
                        } else {
                            part++;
                        }
                        objectId += char;
                    });
                    return objectId;
                },
                init: function() {
                    return new Promise(async function(resolve) {
                        App.Utility.log("\tStarting Mining MiniGame");
                        var start = await App.Gathering.start(App.Gathering.MINING_INDEX);
                        await App.Utility.timeout(1000);
                        var map = await App.Gathering.MiniGame.Mining.getMap(start.playingMiniGameId);
                        var gems = map.objects;
                        var gemsMined = 0;
                        var timer = await App.Gathering.MiniGame.Mining.start();
                        App.Utility.log("\t\tTimer started.")
                        var isStart = true;
                        var check = setInterval(function() {
                            var secondsRemaining = timer.validUntil/1000 - Date.now()/1000;
                            App.Utility.log("\t\tTime remaining: " + secondsRemaining);
                            if(secondsRemaining <= 2) {
                                isStart = false;
                                clearInterval(check);
                            }
                        }, 1000);
                        while(isStart) {
                            var selectedGem = gems[0];
                            for(var gemIndex in gems) {
                                // get lowest Y
                                if(gem.isExploted)
                                    continue;
                                var gem = gems[gemIndex];
                                if(gem.y <= selectedGem.y)
                                    selectedGem = gem;
                            }
                            App.Utility.log("\t\t\tMining gem " + selectedGem.id + "...");
                            var objectId = App.Gathering.MiniGame.Mining.generateObjectId(selectedGem.id);
                            var shootResponse = await App.Gathering.MiniGame.Mining.shoot(objectId);
                            App.Utility.log("\t\t\t\tGem " + selectedGem.id + " shot. Getting rewards...");
                            var rewardResponse = await App.Gathering.MiniGame.Mining.reward(map.mapId,objectId,shootResponse.token);
                            for(var rewardIndex in rewardResponse.rewards) {
                                var reward = rewardResponse.rewards[rewardIndex];
                                App.Utility.log("\t\t\t\tGetting gem " + selectedGem.id + " reward " + reward.name + " (" + reward.guid + ")");
                                var addBag = await App.Gathering.MiniGame.Mining.add_travel_bag(reward);
                            }
                        }
                        App.Utility.log("\tFinished Mining MiniGame");
                        if(App.Gathering.data.enter.currentStamina != 0) {
                            await App.Gathering.MiniGame.Mining.finish();
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                },
                start: function() {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.MINING_START);
                        resolve(response.data);
                    });
                },
                getMap: function(miniGameId) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.MINING_MAP + "?miniGameId=" + miniGameId);
                        resolve(response.data);
                    });
                },
                shoot: function(objectId) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.MINING_SHOOT + "?objectId=" + objectId);
                        resolve(response.data);
                    });
                },
                reward: function(mapId, objectId, token) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.get(App.Gathering.ROOT_URL + App.Gathering.API.MINING_REWARD + "?mapId=" + mapId + "&objectId=" + objectId + "&token=" + token);
                        resolve(response.data);
                    });
                },
                add_travel_bag: function(item) {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.MINING_BAG, {
                            items: [{
                                "ID": 0,
                                "amount": item.amount,
                                "count": 1,
                                "guid": item.guid,
                                "name": item.name,
                                "type": App.Gathering.MiniGame.MiniGame.ItemType[item.name]
                            }]
                        });
                        resolve(response.data);
                    });
                },
                finish: function() {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.MINING_FINISH);
                        resolve();
                    });
                },
            }, 
            Fishing: {
                init: function() {
                    return new Promise(async function(resolve) {
                        // i dont want this game
                        resolve(true);
                    });
                },
            },
            Mystery: {
                init: function() {
                    return new Promise(async function(resolve) {
                        var start = await App.Gathering.MiniGame.Mystery.start();
                        resolve(start);
                    });
                },
                start: function() {
                    return new Promise(async function(resolve) {
                        const response = await App.Request.post(App.Gathering.ROOT_URL + App.Gathering.API.START_MYSTERY, {
                            "miniGameIndex": App.Gathering.CHOPPING_INDEX
                        });
                        resolve(response.data);
                    });
                },
            }
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
                const request = await fetch(url, App.Request.getHeaderOptions(method, data));
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
                const farming_stats = await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.FARMING_STATS);
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
                const my_tools = await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.MY_TOOLS);
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
                await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.AVAILABLE_TOOLS);
                // await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.SUNFLOWERS);
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
                    await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.BUY_TOOLS, {
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
//                     await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.BUY_SUNFLOWERS, {
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
                const weather = await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.WEATHER_TODAY);
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
                App.Utility.log(`\tFor Plant ${plant.plantId} ${(plant.plant.hasOwnProperty("stats") ? '('+plant.plant.stats.type+')' : '(sunflower)')}`);
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
            var totalAvailable = null;
            var skipPlantLots = false;
            var skipMotherTreeLots = false;
            while(plant_available != 0 || motherTree_available != 0) {
                var free_slots = await App.Farm.Land.getFreeSlots();
                plant_available = 0;
                motherTree_available = 0;
                totalAvailable = 0;
                for(var land in free_slots.data.availableSlots) {
                    land = free_slots.data.availableSlots[land];
                    plant_available += land.availablePlantCapacity;
                    motherTree_available += land.availableMotherTreeCapacity;
                    totalAvailable += land.availablePlantCapacity + land.availableMotherTreeCapacity;
                }
                if(plant_available == 0) skipPlantLots = true;
                if(motherTree_available == 0) skipMotherTreeLots = true;
                
                var seasonEndDate = new Date(App.Weather.data.seasonEndTime);
                var today = new Date();
                var diffHours = Math.floor(Math.abs(today-seasonEndDate) / 1000 / 60 / 60);
                
                if(totalAvailable != 0) {
                    App.Utility.log(`\tHas ${totalAvailable} free slots!`);
                    // var selectedFarm = free_slots.data.farm[0];
                    if(plant_available > 0 && !skipPlantLots) {
                        var plants = await App.Farm.Plant.getMyPlants();
                        var selectedPlant = null;
                        for(var plant in plants.data) {
                            plant = plants.data[plant];
                            if(App.Weather.data.allowedPlants.includes(plant.plant.stats.type) && plant.plant.farmConfig.hours < diffHours) {
                                if(selectedPlant == null) {
                                    selectedPlant = plant;
                                } else if(selectedPlant.plant.farmConfig.le / selectedPlant.plant.farmConfig.hours < plant.plant.farmConfig.le / plant.plant.farmConfig.le) {
                                    selectedPlant = plant;
                                }
                            }
                        }
                        if(selectedPlant == null) {
                            // App.Utility.log(`\t\tNo extra plants. Skipping...`);
                            // skipPlantLots = true;
                            plants = await App.Farm.Plant.getMySunflowers();
                            var found = false;
                            for(var plant in plants.data) {
                                plant = plants.data[plant];
                                if(plant.type == App.Constant.SUNFLOWER.SAPLING) {
                                    if(App.Weather.data.allowedPlants.includes(plant.seasonType) && plant.rate.hours < diffHours && plant.usages != 0) {
                                        found = true;
                                        App.Utility.log(`\t\tPlanting sunflower sapling.`);
                                        await App.Farm.Plant.add("0", plant.sunflowerId);
                                        App.Utility.log(`\t\tSunflower sapling planted!`);
                                    } else {
                                        break;
                                    }
                                }
                            }
                            if(!found) skipPlantLots =  true;
                        } else {
                            App.Utility.log(`\t\tPlanted ${selectedPlant.plantId} (${selectedPlant.plant.stats.type})!`);
                            await App.Farm.Plant.add("0", selectedPlant);
                        }
                        plant_available--;
                    } else if(motherTree_available > 0 && !skipMotherTreeLots) {
                        var plants = await App.Farm.Plant.getMyMotherTrees();
                        var selectedPlant = null;
                        for(var plant in plants.data) {
                            plant = plants.data[plant];
                            if(App.Weather.data.allowedPlants.includes(plant.plant.stats.type) && plant.plant.farmConfig.hours < diffHours) {
                                if(selectedPlant == null) {
                                    selectedPlant = plant;
                                } else if(selectedPlant.plant.farmConfig.le / selectedPlant.plant.farmConfig.hours < plant.plant.farmConfig.le / plant.plant.farmConfig.le) {
                                    selectedPlant = plant;
                                }
                            }
                        }
                        if(selectedPlant == null) {
                            // App.Utility.log(`\t\tNo extra plants. Skipping...`);
                            // skipMotherTreeLots = true;
                            plants = await App.Farm.Plant.getMySunflowers();
                            var found = false;
                            for(var plant in plants.data) {
                                plant = plants.data[plant];
                                if(plant.type == App.Constant.SUNFLOWER.MAMA) {
                                    if(App.Weather.data.allowedPlants.includes(plant.seasonType) && plant.rate.hours < diffHours && plant.usages != 0) {
                                        App.Utility.log(`\t\tPlanting sunflower mama.`);
                                        await App.Farm.Plant.add("0", plant.sunflowerId);
                                        App.Utility.log(`\t\tSunflower mama planted!`);
                                    } else {
                                        break;
                                    }
                                }
                            }
                            if(!found) skipMotherTreeLots =  true;
                        } else {
                            App.Utility.log(`\t\tPlanted ${selectedPlant.plantId} (${selectedPlant.plant.stats.type})!`);
                            await App.Farm.Plant.add("0", selectedPlant);
                        }
                        motherTree_available--;
                    }
                }
                if(skipMotherTreeLots && skipPlantLots)
                    break;
            }
            App.Utility.log(`Plant plants - END`);
            App.Utility.log(`Maintening farm - START`);
            var plants = await App.Farm.Plant.getFarming();
            for (var plantIndex in plants.data) {
                var plant = plants.data[plantIndex];
                App.Utility.log(`\tFor Plant ${plant.plantId} ${(plant.plant.hasOwnProperty("stats") ? '('+plant.plant.stats.type+')' : '(sunflower)')}`);
                if(plant.stage == "new") {
                    App.Utility.log(`\t\tPot needed...`);
                    if(App.Tools["POT"] == 0) {
                        App.Utility.log(`\t\t\tNo pot tool. Buying...`);
                        if(await App.Shop.buy_tools(App.Constant.TOOL.POT,1) == false) break;
                    }
                    App.Utility.log(`\t\t\tAdding pot to plant...`);
                    await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.APPLY_TOOL, {
                        farmId: plant._id,
                        toolId: App.Constant.TOOL.POT
                    });
                    plants = await App.Farm.Plant.getFarming();
                    plant = plants.data[plantIndex];
                }
                if(plant.stage == "farming") { 
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
                                await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.APPLY_TOOL, {
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
                if(plant.hasCrow) {
                    App.Utility.log(`\t\tHas crow...`);
                    if(App.Tools.SCARECROW == 0) {
                        App.Utility.log(`\t\t\tNo scarecrow tool. Buying...`);
                        if(await App.Shop.buy_tools(App.Constant.TOOL.SCARECROW,1) == false) continue;
                    }
                    App.Utility.log(`\t\t\tApplying scarecrow to plant...`);
                    await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.APPLY_TOOL, {
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
                    await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.APPLY_TOOL, {
                        farmId: plant._id,
                        toolId: App.Constant.TOOL.WATER
                    });
                    App.Tools.WATER -= 2;
                    App.Utility.log(`\t\t\tPlant watered.`);
                    await App.Utility.timeout();
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
                resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.FARMING_STATS));
            });
        },
        Land: {
            getFreeSlots: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.FREE_SLOTS));
                });
            },
            getLands: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.MY_LANDS));
                });
            },
        },
        Plant: {
            getMyPlants: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.MY_PLANTS));
                });
            },
            getMyMotherTrees: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.MY_MOTHER_TREES));
                });
            },
            getMySunflowers: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.MY_SUNFLOWERS));
                });
            },
            getFarming: function() {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.get(App.Constant.ROOT_URL + App.Constant.API.FARMING_PLANTS));
                });
            },
            harvest: function(plant) {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.HARVEST_PLANT.replace("{{id}}", plant._id)));
                });
            },
            remove: function(plant) {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    resolve(await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.REMOVE_PLANT, {
                        farmId: plant._id
                    }));
                });
            },
            add: function(land, plant) {
                return new Promise(async function(resolve) {
                    await App.Utility.timeout();
                    if(!isNaN(plant)) {
                        resolve(await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.FARMS, {
                            landId: land,
                            sunflowerId: plant
                        }));
                    } else {
                        resolve(await App.Request.post(App.Constant.ROOT_URL + App.Constant.API.FARMS, {
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
// await App.Gathering.init();
