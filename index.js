/*
    # Bae's PVU Automated Farmer
    
    = 2021-10-16
        - Contribute water to world tree
        - Claim rewards R1-R6 and yesterday's reward
        - Harvest plants and sunflowers
        - Plant sunflower sapling/mama
        - Remove crows
        - Water plants
        - Buy saplings and always retain at least 300 LE
    = 2021-10-18
        - Claim seeds from plants
        - Count inventory
        - Buy saplings if NFT is not yet complete
    = 2021-10-21
        - Optimized automation.
        - Check plants to water, harvest, scarecrow, pot
        - Apply actions only to specific plants
        
*/
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
        confirmPopup: function() {
            return new Promise(async resolve => {
                var button = null;
                while(button == null) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    var confirmButtons = document.querySelectorAll(".btn__confirm, .confirm, .button-confirm");
                    for(var i = 0; i < confirmButtons.length; i++) {
                        if(confirmButtons[i].offsetParent !== null) {
                            button = confirmButtons[i];
                            break;
                        }
                    }
                }
                if(button != null) {
                    App.Utility.log("Confirmed.")
                    button.click();
                }
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        },
        goBack: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go back.")
                document.querySelector(`img[src='${App.Constant.BACK_ICON}']`).parentElement.click();
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        },
        removeOverlay: function() {
            return new Promise(async resolve => {
                App.Utility.log("Remove overlay.")
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.querySelector('.v-overlay.v-overlay--active') != null) {
                        document.querySelector('.v-overlay.v-overlay--active').click();
                        break;
                    }
                }
                resolve();
            });
        },
        hasCaptcha: function() {
            var x = document.querySelector(".v-dialog") == null ? false : document.querySelector(".v-dialog").style.display != "none";
            App.Utility.log("Has captcha? " + x);
            return x;
        },
        isLoading: function() {
            var x = document.querySelector(".loading-page") != null;
            App.Utility.log("Is loading? " + x);
            return x;
        },
    },
    Account: {
        go: function() {
            return new Promise(async resolve => {
                document.querySelector(".account__text").parentElement.click();
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.querySelectorAll(`img[src='${App.Constant.QR_CODE_ICON}']`).length > 1) {
                        if(document.querySelectorAll(`img[src='${App.Constant.QR_CODE_ICON}']`)[1] != null) {
                            if(document.querySelectorAll(`img[src='${App.Constant.QR_CODE_ICON}']`)[1].offsetParent != null) {
                                break;
                            }
                        }
                    }
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(!App.General.isLoading()) {
                        break;
                    }
                }
                resolve();
            });
        },
        goToSeeds: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Seeds");
                if(document.querySelector(`img[src='${App.Constant.SEED_INACTIVE_ICON}']`) != null) {
                    document.querySelector(`img[src='${App.Constant.SEED_INACTIVE_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(!App.General.isLoading()) {
                        break;
                    }
                }
                resolve();
            });
        },
        goToPlant: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Plant");
                if(document.querySelector(`img[src='${App.Constant.PLANT__INACTIVE_ICON}']`) != null) {
                    document.querySelector(`img[src='${App.Constant.PLANT__INACTIVE_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(!App.General.isLoading()) {
                        break;
                    }
                }
                resolve();
            });
        },
        goToMotherTree: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Mother Tree");
                if(document.querySelector(`img[src='${App.Constant.MOTHER_TREE_INACTIVE_ICON}']`) != null) {
                    document.querySelector(`img[src='${App.Constant.MOTHER_TREE_INACTIVE_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(!App.General.isLoading()) {
                        break;
                    }
                }
                resolve();
            });
        },
        goToClaimSeeds: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Claim Seeds");
                if(document.querySelector(`img[src='${App.Constant.CLAIM_SEED_INACTIVE_ICON}']`) != null) {
                    document.querySelector(`img[src='${App.Constant.CLAIM_SEED_INACTIVE_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(!App.General.isLoading()) {
                        break;
                    }
                }
                resolve();
            });
        },
    },
    Inventory: {
        PLANT: 0,
        MOTHER_TREE: 0,
        SF_SAPLING: 0,
        SF_MAMA: 0,
        SEED: 0,
        CLAIM_SEED: 0,
        init: function() {
            return new Promise(async resolve => {
                await App.Inventory.go();
                await App.Farm.Land.goToPlant();
                App.Inventory.PLANT = document.querySelector(".farm-list").childNodes[0].childNodes.length;
                await App.Farm.Land.goToMotherTree();
                App.Inventory.MOTHER_TREE = document.querySelector(".farm-list").childNodes[0].childNodes.length;
                await App.Farm.Land.goToSunflower();
                App.Inventory.SF_SAPLING = App.Farm.Land.getSunflowerSaplingCount().available;
                App.Inventory.SF_MAMA = App.Farm.Land.getSunflowerMamaCount().available;
                await App.Account.go();
                await App.Account.goToSeeds();
                App.Inventory.SEED = document.querySelector(".grid[data-v-00c7124b]").offsetParent == null ? 0 : document.querySelector(".grid[data-v-00c7124b]").childNodes.length;
                await App.Account.goToClaimSeeds();
                App.Inventory.CLAIM_SEED = document.querySelector(".grid[data-v-35f5064c]").offsetParent == null ? 0 : ((document.querySelector(".grid[data-v-35f5064c]").querySelectorAll(".grid__item").length > 0) ? parseInt(document.querySelector(".grid[data-v-35f5064c]").querySelectorAll(".grid__item")[0].querySelector("p.numSeed").textContent) : 0);
                await App.Farm.go();
                resolve();
            });
        },
        checkForClaimSeed: function() {
            if(App.Inventory.CLAIM_SEED > 0) {
                alert("You have a seed to claim.");
            }
        },
        go: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Inventory");
                if(document.querySelectorAll(".farm-list").length == 0) {
                    document.querySelector(`img[src='${App.Constant.INVENTORY_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.querySelectorAll(".farm-list").length == 1) {
                        break;
                    }
                }
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        }
    },
    Balance: {
        LE: {
            get: function() {
                var x = parseInt(document.querySelector(".wallet-text").textContent);
                App.Utility.log("LE Balance: " + x);
                return x;
            }
        },
        Sapling: {
            get: function() {
                var x = parseInt(document.querySelector(".exchange-number").textContent);
                App.Utility.log("Sapling Balance: " + x);
                return x;
            },
            checkForSeed: function() {
                if(App.Balance.Sapling.get() >= 100) {
                    alert("You can now convert 100 saplings to a seed!")
                }
            }
        },
        PVU: {
            get: function() {
                var x = parseInt(document.querySelector(".farmed-text").textContent);
                App.Utility.log("PVU Balance: " + x);
                return x;
            }
        },
        BNB: {
            get: function() {
                var x = parseFloat(document.querySelector(".token__name-orange").parentElement.childNodes[2].textContent);
                App.Utility.log("BNB Balance: " + x);
                return x;
            }
        }
    },
    WorldTree: {
        init: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to World Tree.");
                document.querySelector(`img[src='${App.Constant.WORLD_TREE_ICON}']`).parentElement.click();
                await App.WorldTree.isLoaded();
                if(document.querySelectorAll("button.claim.disable").length != 0) {
                    await App.WorldTree.contributeWater();
                }
                await App.WorldTree.claimRewards();
                await App.General.goBack();
                resolve();
            });
        },
        isLoaded: function() {
            return new Promise(async resolve => {
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.querySelector(".status__value").textContent != "") {
                        break;
                    }
                }
                App.Utility.log("World Tree has loaded.");
                resolve();
            });
        },
        hasContributed: function() {
            return new Promise(async resolve => {
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(parseInt(document.querySelector(".status__value").textContent) >= 20) {
                        break;
                    }
                }
                App.Utility.log("Water contributed.");
                resolve();
            });
        },
        getContributedWater: function() {
            var x = parseInt(document.querySelector(".water__amount").textContent.trim());
            App.Utility.log("Contributed water: " + x);
            return x;
        },
        contributeWater: function() {
            return new Promise(async resolve => {
                if(parseInt(document.querySelector(".status__value").textContent) < 20) {
                    if(App.WorldTree.getContributedWater() < 20) {
                        App.Utility.log("Not enough water to contribute. Buying water...");
                        await App.General.goBack();
                        await App.Shop.go();
                        await App.Shop.buy(App.Constant.WATER);
                        await App.General.goBack();
                        document.querySelector(`img[src='${App.Constant.WORLD_TREE_ICON}']`).parentElement.click();
                        await App.WorldTree.isLoaded();
                    }
                    App.Utility.log("Contributing water.");
                    document.querySelector(".give-water-new").click();
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    await App.General.confirmPopup();
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    await App.WorldTree.hasContributed();
                } else {
                    App.Utility.log("Already contributed water.");
                }
                resolve();
            });
        },
        getRewardNumber: function(el) {
            var x = 0;
            try {
                x = parseInt(el.parentElement.querySelector("p").textContent.trim()[1]);
            } catch(error) {
                console.log(error);   
            }
            return x;
        },
        claimRewards: function() {
            return new Promise(async resolve => {
                var claims = document.querySelectorAll("button.claim");
                for(var i = 0; i < claims.length; i++) {
                    var el = claims[i];
                    if(el.offsetParent !== null) {
                        var rewardNumber = App.WorldTree.getRewardNumber(el);
                        await App.Utility.timeout(App.Constant.TIMEOUT);
                        App.Utility.log("Getting reward #" + rewardNumber);
                        el.click();
                        await App.Utility.timeout(App.Constant.TIMEOUT);
                        await App.General.confirmPopup();
                        if(rewardNumber == 4 || rewardNumber == 6 || rewardNumber == 0) {
                            await App.Utility.timeout(3000);
                            await App.General.confirmPopup();
                        }
                    }
                }
                resolve();
            });
        }
    },
    Tools: {
        use: function(tool) {
            return new Promise(async resolve => {
                var icon = App.Utility.getIcon(tool);
                if(icon == "") {
                    App.Utility.log("Tool not found");
                    return null;
                }
                App.Utility.log(`Using ${tool}...`);
                if(App.Tools.count(tool) == 0) {
                    App.Utility.log(`Not enough ${tool}.`);
                    await App.Shop.buy(tool);
                }
                document.querySelector(`[src='${icon}']`).parentElement.parentElement.childNodes[2].querySelector("button").click();
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        },
        count: function(tool) {
            var icon = App.Utility.getIcon(tool);
            if(icon == "") {
                App.Utility.log("Tool not found");
                return null;
            }
            var x = parseInt(document.querySelector(`[src='${icon}']`).parentElement.childNodes[4].textContent.trim());
            App.Utility.log(`Count of ${tool}: ${x}`);
            return x;
        }
    },
    Shop: {
        init: function() {
            return new Promise(async resolve => {
                await App.Shop.buyExtraSapling();
                resolve();
            });
        },
        buyExtraSapling: function() {
            return new Promise(async resolve => {
                App.Utility.log("Total plants: " + App.Inventory.PLANT);
                App.Utility.log("Total mother tree: " + App.Inventory.MOTHER_TREE);
                App.Utility.log("Total claimed seeds: " + App.Inventory.SEED);
                App.Utility.log("Total unclaimed seeds: " + App.Inventory.CLAIM_SEED);
                App.Utility.log("----");
                var plantNeeded = (5 - App.Inventory.PLANT < 0) ? 0 : 5 - App.Inventory.PLANT;
                var motherTreeNeeded = (1 - App.Inventory.MOTHER_TREE < 0) ? 0 : 1 - App.Inventory.MOTHER_TREE;
                var totalNeeded = plantNeeded + motherTreeNeeded - App.Inventory.SEED - App.Inventory.CLAIM_SEED;
                App.Utility.log("Total needed: " + totalNeeded);
                await App.Utility.timeout(App.Constant.TIMEOUT);
                if(totalNeeded > 0) {
                    App.Utility.log("Need more plants.");
                    await App.Farm.isLoaded();
                    if(App.Balance.LE.get() > 400 && App.Balance.Sapling.get() < 100) {
                        var saplingNeeded = 100 - App.Balance.Sapling.get();
                        var saplingToBuy = Math.floor((App.Balance.LE.get() - 300) / 100);
                        if(saplingToBuy > saplingNeeded) {
                            saplingToBuy = saplingNeeded;
                        }
                        App.Utility.log("Has extra LE to buy sapling.");
                        await App.Shop.go();
                        await App.Shop.goToSunflower();
                        await App.Shop.buy(App.Constant.SF_SAPLING, saplingToBuy)
                        await App.General.goBack();
                    } else {
                        App.Utility.log("No extra LE to buy sapling.");
                    }
                }
                resolve();
            });
        },
        go: function() {
            return new Promise(async resolve => {
                if(document.querySelectorAll(".shop-container").length == 0) {
                    document.querySelector(`img[src='${App.Constant.SHOP_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.querySelectorAll(".shop-container").length == 1) {
                        break;
                    }
                }
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        },
        goToSunflower: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Sunflower");
                if(document.querySelector(`img[src='${App.Constant.SUNFLOWER_INACTIVE_ICON}']`) != null) {
                    document.querySelector(`img[src='${App.Constant.SUNFLOWER_INACTIVE_ICON}']`).parentElement.click();
                }
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        },
        goToTools: function() {
            return new Promise(async resolve => {
                App.Utility.log("Go to Tools");
                if(document.querySelector(`img[src='${App.Constant.SHOP__TOOLS_INACTIVE_ICON}']`) != null) {
                    document.querySelector(`img[src='${App.Constant.SHOP__TOOLS_INACTIVE_ICON}']`).parentElement.click();
                }
                await App.Utility.timeout(App.Constant.TIMEOUT);
                resolve();
            });
        },
        buy: function(tool, quantity) {
            return new Promise(async resolve => {
                await App.Shop.go();
                
                App.Utility.log(`Buying ${tool}.`);
                if([App.Constant.WATER, App.Constant.SMALL_POT, App.Constant.BIG_POT, App.Constant.SCARECROW, App.Constant.GREENHOUSE].includes(tool)) {
                    await App.Shop.goToTools();
                } else if([App.Constant.SF_SAPLING, App.Constant.SF_MAMA].includes(tool)) {
                    await App.Shop.goToSunflower();
                }

                var icon = App.Utility.getIcon(tool);
                var item = document.querySelector(`img[src='${icon}'][data-v-493daa3c]`);
                var container = item.parentElement.parentElement;

                
                if(quantity == null) {
                    quantity = 1;
                }
                var currentQuantitySelected = 1;
                var max = 20;
                while(quantity > 0) {
                    var loop = quantity - 1;
                    if(quantity > max) {
                        loop = max - 1;
                    }
                    if(quantity - currentQuantitySelected > 0) {
                        for(var i = 0; i < loop; i++) {
                            currentQuantitySelected += 1;
                            container.querySelector("button.plus").click();
                            await App.Utility.timeout(100);
                        }
                    } else {
                        for(var i = 0; i < max-loop-1; i++) {
                            currentQuantitySelected -= 1;
                            container.querySelector("button.minus").click();
                            await App.Utility.timeout(100);
                        }
                    }
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(item != null) {
                            container.querySelector("button.btn-buy-tool").click();
                            break;
                        }
                    }
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    await App.General.confirmPopup();
                    await App.General.removeOverlay();
                    if(quantity > max) {
                        quantity -= max;
                    } else {
                        quantity -= quantity;
                    }
                }

                resolve();
            });
        },
    },
    Farm: {
        init: async function() {
            await App.Farm.harvestPlants();
            await App.Farm.plant();
            await App.Farm.waterPlants();
        },
        go: function() {
            return new Promise(async resolve => {
                if(document.querySelector(`img[src='${App.Constant.FARM_INACTIVE_ICON}']`).offsetParent != null) {
                    document.querySelector(`img[src='${App.Constant.FARM_INACTIVE_ICON}']`).parentElement.click();
                }
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(!App.General.isLoading()) {
                        break;
                    }
                }
                resolve();
            });
        },
        new: function() {
            return new Promise(async resolve => {
                document.querySelector(".new-farm").click();
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.querySelector(".select") != null) {
                        break;
                    }
                }
                resolve();
            });
        },
        isLoaded: function() {
            return new Promise(async resolve => {
                while(true) {
                    await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                    if(document.getElementById("overflow-y") != null) {
                        break;
                    }
                }
                resolve();
            });
        },
        hasPlantsToHarvest: function() {
            var hasPlantsToHarvest = !document.querySelector("button.harvest-all").classList.contains("disabled");
            if(hasPlantsToHarvest) {
                App.Utility.log("There are plants to harvest.");
            } else {
                App.Utility.log("No plants to harvest.");
            }
            return hasPlantsToHarvest;
        },
        getPlantsToScarecrow: function() {
            var getPlantsToScarecrow = [];
            document.querySelectorAll("img.crow-icon").forEach(function(el,i) {
                if(el.style.display != "none") {
                    getPlantsToScarecrow.push(i);
                }
            });
            if(getPlantsToScarecrow.length != 0) {
                App.Utility.log("There are plants to scare crows.");
            } else {
                App.Utility.log("No plants to scare crows.");
            }
            return getPlantsToScarecrow;
        },
        getPlantsToDropSeed: function() {
            var getPlantsToDropSeed = [];
            document.querySelectorAll(".seed-icon").forEach(function(el,i) {
                if(el.style.display != "none") {
                    getPlantsToDropSeed.push(i);
                }
            });
            if(getPlantsToDropSeed.length != 0) {
                App.Utility.log("There are plants that has seed drop.");
            } else {
                App.Utility.log("No plants with seed drop.");
            }
            return getPlantsToDropSeed;
        },
        getPlantsToWater: function() {
            var getPlantsToWater =  [];
            document.querySelectorAll(`img[src='${App.Constant.WATER_ICON}'][data-v-75e1029d]`).forEach(function(el,i) {
                if(el.parentElement.querySelector(".plant-attr-number span").textContent < 2) {
                    getPlantsToWater.push(i);;
                }
            });
            if(getPlantsToWater.length != 0) {
                App.Utility.log("There are plants to water.");
            } else {
                App.Utility.log("No plants to water.");
            }
            return getPlantsToWater;
        },
        getPlantsToPot: function () {
            var getPlantsToPot =  [];
            document.getElementById("overflow-y").querySelector("div").querySelectorAll(".grid-item").forEach(function(el,i) {
                var x = el.querySelector(`img[src='${App.Constant.SMALL_POT_ICON}']`) != null;
                var y = el.querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`) != null;
                var pot = 0;
                if((x || y) == false) {
                    getPlantsToPot.push(i);
                    return;
                }
                if(el.querySelector("p.id") != null) {
                    if(el.querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`) != null) {
                        if(el.querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`).parentElement.querySelector(".plant-attr-number span") != null) {
                            pot += parseInt(el.querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`).parentElement.querySelector(".plant-attr-number span").textContent);
                        } else {
                            pot += 1;
                        }
                    }
                    if(el.querySelector(`img[src='${App.Constant.SMALL_POT_ICON}']`) != null) {
                        if(el.querySelector(`img[src='${App.Constant.SMALL_POT_ICON}']`).parentElement.querySelector(".plant-attr-number span") != null) {
                            pot += parseInt(el.querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`).parentElement.querySelector(".plant-attr-number span").textContent);
                        } else {
                            pot += 1;
                        }
                    }
                    if(pot < 2) {
                        getPlantsToPot.push(i);
                        return;
                    }
                }
            });
            if(getPlantsToPot.length != 0) {
                App.Utility.log("There are plants to pot.");
            } else {
                App.Utility.log("No plants to pot.");
            }
            return getPlantsToPot;
        }, 
        Land: {
            select: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Selecting land...");
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(document.querySelector(".select") != null) {
                            break;
                        }
                    }
                    document.querySelector(".select").click();
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(document.querySelector(".change") != null) {
                            break;
                        }
                    }
                    App.Utility.log("Land is selected.");
                    resolve();
                });
            },
            goToSunflower: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Go to Sunflower");
                    if(document.querySelector(`img[src='${App.Constant.SUNFLOWER_INACTIVE_ICON}']`) != null) {
                        document.querySelector(`img[src='${App.Constant.SUNFLOWER_INACTIVE_ICON}']`).parentElement.click();
                    }
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(!App.General.isLoading()) {
                            break;
                        }
                    }
                    resolve();
                });
            },
            goToPlant: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Go to Plant");
                    if(document.querySelector(`img[src='${App.Constant.PLANT__INACTIVE_ICON}']`) != null) {
                        document.querySelector(`img[src='${App.Constant.PLANT__INACTIVE_ICON}']`).parentElement.click();
                    }
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(!App.General.isLoading()) {
                            break;
                        }
                    }
                    resolve();
                });
            },
            goToMotherTree: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Go to Mother Tree");
                    if(document.querySelector(`img[src='${App.Constant.MOTHER_TREE_INACTIVE_ICON}']`) != null) {
                        document.querySelector(`img[src='${App.Constant.MOTHER_TREE_INACTIVE_ICON}']`).parentElement.click();
                    }
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(!App.General.isLoading()) {
                            break;
                        }
                    }
                    resolve();
                });
            },
            getPlantCount: function() {
                var x = document.querySelector(`img[src='${App.Constant.PLANT_ICON}']`).parentElement.childNodes[2].textContent.split("/");
                App.Utility.log("Plant Count: " + x);
                return {
                    current: parseInt(x[0]),
                    max: parseInt(x[1])
                }
            },
            getMotherTreeCount: function() {
                var x = document.querySelector(`img[src='${App.Constant.MOTHER_TREE_ICON}']`).parentElement.childNodes[2].textContent.split("/");
                App.Utility.log("Mother Tree Count: " + x);
                return {
                    current: parseInt(x[0]),
                    max: parseInt(x[1])
                }
            },
            getSunflowerSaplingCount: function() {
                var x = document.querySelector(`img[src='${App.Constant.INVENTORY__SF_SAPLING_ICON}']`).parentElement.childNodes[0].textContent.trim().split("/");
                App.Utility.log("Sunflower Sapling Count: " + x);
                return {
                    available: parseInt(x[0]),
                    max: parseInt(x[1])
                }
            },
            getSunflowerMamaCount: function() {
                var x = document.querySelector(`img[src='${App.Constant.INVENTORY__SF_MAMA_ICON}']`).parentElement.childNodes[0].textContent.trim().split("/");
                App.Utility.log("Sunflower Mama Count: " + x);
                return {
                    available: parseInt(x[0]),
                    max: parseInt(x[1])
                }
            },
            plantSunflowerSapling: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Planting Sunflower Sapling.");
                    document.querySelector(`img[src='${App.Constant.INVENTORY__SF_SAPLING_ICON}']`).parentElement.childNodes[6].click();
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(!App.General.isLoading()) {
                            break;
                        }
                    }
                    resolve();
                });
            },
            plantSunflowerMama: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Planting Sunflower Mama.");
                    document.querySelector(`img[src='${App.Constant.INVENTORY__SF_MAMA_ICON}']`).parentElement.childNodes[6].click();
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(!App.General.isLoading()) {
                            break;
                        }
                    }
                    resolve();
                });
            }
        },
        Plant: {
            selected: null,
            select: function(i) {
                return new Promise(async resolve => {
                    App.Utility.log("Selecting plant #" + (i+1));
                    while(true) {
                        document.getElementById("overflow-y").querySelector("div").childNodes[i].click();
                        await App.Utility.timeout(200);
                        if(document.querySelector(".farmactive") != null) {
                            App.Farm.Plant.selected = document.querySelector(".farmactive");
                            App.Utility.log("Selected plant #" + (i+1));
                            break;
                        }
                    }
                    resolve();
                });
            },
            isFarming: function() {
                var x = App.Farm.Plant.selected.parentElement.childNodes[2].querySelector(`img[src='${App.Constant.SMALL_POT_ICON}']`) != null;
                var y = App.Farm.Plant.selected.parentElement.childNodes[2].querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`) != null;
                App.Utility.log("isFarming? " + x + " " + y);
                return x || y;
            },
            unselect: function(i) {
                App.Utility.log("Unselecting plant #" + (i+1));
                return new Promise(async resolve => {
                    while(true) {
                        document.getElementById("overflow-y").querySelector("div").childNodes[i].click();
                        await App.Utility.timeout(200);
                        if(document.querySelector(".farmactive") == null) {
                            App.Farm.Plant.selected = null;
                            App.Utility.log("Unselected plant #" + (i+1));
                            break;
                        }
                    }
                    resolve();
                });
            },
            harvest: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Harvest selected plant.");
                    App.Farm.Plant.selected.parentElement.parentElement.querySelector(".btn-harvest").click();
                    while(true) {
                        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                        if(!App.Farm.Plant.canHarvest()) {
                            break;
                        }
                    }
                    resolve();
                });
            },
            getWaterCount: function() {
                var x = parseInt(App.Farm.Plant.selected.parentElement.childNodes[2].childNodes[0].querySelector(`img[src='${App.Constant.WATER_ICON}']`).parentElement.querySelector(".plant-attr-number span").textContent);
                App.Utility.log("Current water count: " + x);
                return x;
            },
            getBigPotCount: function() {
                var x = 0;
                if(App.Farm.Plant.selected.parentElement.childNodes[2].childNodes[0].querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`) != null) {
                    if(App.Farm.Plant.selected.parentElement.childNodes[2].childNodes[0].querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`).parentElement.querySelector(".plant-attr-number span") != null) {
                        x = parseInt(App.Farm.Plant.selected.parentElement.childNodes[2].childNodes[0].querySelector(`img[src='${App.Constant.BIG_POT_ICON}']`).parentElement.querySelector(".plant-attr-number span").textContent);
                    } else {
                        x = 1;
                    }
                }
                App.Utility.log("Current big pot count: " + x);
                return x;
            },
            canHarvest: function() {
                var x = App.Farm.Plant.selected.parentElement.parentElement.querySelector(".btn-harvest") != null;
                App.Utility.log("canHarvest? " + x);
                return x;
            },
            hasCrow: function() {
                var x = App.Farm.Plant.selected.querySelector("img.crow-icon").style.display != "none";
                App.Utility.log("hasCrow? " + x);
                return x;
            },
            hasSeed: function() {
                var x = App.Farm.Plant.selected.querySelector(".seed-icon").style.display != "none";
                App.Utility.log("hasSeed? " + x);
                return x;
            },
            claimSeed: function() {
                return new Promise(async resolve => {
                    if(App.Farm.Plant.hasSeed()) {
                        App.Farm.Plant.selected.querySelector(".seed-icon").click();
                        var hasSeed = await App.Farm.Plant.hasSeed();
                        while(hasSeed) {
                            await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                            hasSeed = await App.Farm.Plant.hasSeed();
                        }
                    }
                    resolve();
                });
            },
            canWater: function() {
                var x = App.Farm.Plant.getWaterCount() < 2;
                App.Utility.log("canWater? " + x);
                return x;
            },
            canBigPot: function() {
                var x = App.Farm.Plant.getBigPotCount() < 2;
                App.Utility.log("canBigPot? " + x);
                return x;
            },
            isSunflower: function() {
                var x = App.Farm.Plant.selected.parentElement.parentElement.querySelector("p.id") == null;
                App.Utility.log("isSunflower? " + x);
                return x;
            },
            remove: function() {
                return new Promise(async resolve => {
                    App.Utility.log("Remove active plant.");
                    App.Farm.Plant.selected.parentElement.parentElement.querySelector(".btn-remove").click();
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    document.querySelector(".popup .btn-confirm").click();
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    resolve();
                });
            }
        },
        harvestPlants: function() {
            return new Promise(async resolve => {
                await App.Farm.isLoaded();
                if(!App.Farm.hasPlantsToHarvest()) {
                    App.Utility.log("No plants to harvest. Skipping.");
                    resolve();
                    return;
                }
                App.Utility.log("Start harvesting plants.");
                var maxPlants = document.getElementById("overflow-y").querySelector("div").querySelectorAll(".grid-item").length;
                for(var i = 0; i < maxPlants; i++) {
                    await App.Farm.Plant.select(i);
                    await App.Utility.timeout(100);
                    if(App.Farm.Plant.canHarvest()) {
                        App.Utility.log("Plant can be harvested.");
                        await App.Farm.Plant.harvest();
                        if(App.Farm.Plant.isSunflower()) {
                            await App.Farm.Plant.remove();
                            i = i-2;
                            if(i < 0) i = 0;
                            maxPlants = maxPlants-1;
                            await App.Utility.timeout(200);
                        }                        
                    }
                    if(App.General.hasCaptcha()) break;
                    await App.Utility.timeout(100);
                    await App.Farm.Plant.unselect(i);
                }
                App.Utility.log("Finished harvesting plants.");
                resolve();
            });
        },
        plant: function() {
            return new Promise(async resolve => {
                if(document.getElementById("overflow-y").querySelector("div").querySelectorAll(".grid-item").length < 6) {
                    await App.Farm.new();
                    await App.Farm.Land.select();
                    while(App.Farm.Land.getPlantCount().current < App.Farm.Land.getPlantCount().max) {
                        await App.Farm.Land.goToPlant();
                        if(document.querySelector(".farm-list").childNodes[0].childNodes.length > 0) {
                            document.querySelector(".farm-list").childNodes[0].childNodes[0].querySelector("button").click();
                            await App.Utility.timeout(App.Constant.TIMEOUT);
                            continue;
                        }

                        await App.Farm.Land.goToSunflower();
                        if(App.Farm.Land.getSunflowerSaplingCount().available == 0) 
                            break;
                        await App.Farm.Land.plantSunflowerSapling();
                    }
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    while(App.Farm.Land.getMotherTreeCount().current < App.Farm.Land.getMotherTreeCount().max) {
                        await App.Farm.Land.goToMotherTree();
                        if(document.querySelector(".farm-list").childNodes[0].childNodes.length > 0) {
                            document.querySelector(".farm-list").childNodes[0].childNodes[0].querySelector("button").click();
                            await App.Utility.timeout(App.Constant.TIMEOUT);
                            continue;
                        }

                        await App.Farm.Land.goToSunflower();
                        if(App.Farm.Land.getSunflowerMamaCount().available == 0) 
                            break;
                        await App.Farm.Land.plantSunflowerMama();
                    }
                    await App.Utility.timeout(App.Constant.TIMEOUT);
                    await App.General.goBack();
                    await App.General.goBack();
                }
                await App.Farm.isLoaded();
                var plantsToPot = App.Farm.getPlantsToPot();
                if(plantsToPot.length != 0) {     
                    App.Utility.log("Start adding pots to plants.");
                    for(var i of plantsToPot) {
                        await App.Farm.Plant.select(i);
                        await App.Utility.timeout(100);
                        if(App.Farm.Plant.isSunflower()) {
                            if(await App.Farm.Plant.isFarming() == false) {
                                if(App.Tools.count(App.Constant.SMALL_POT) == 0) {
                                    await App.Shop.buy(App.Constant.SMALL_POT);
                                    await App.General.goBack();
                                    await App.Farm.Plant.select(i);
                                }
                                await App.Tools.use(App.Constant.SMALL_POT);
                            }
                        } else {
                            while(App.Farm.Plant.canBigPot()) {
                                if(App.Tools.count(App.Constant.BIG_POT) == 0) {
                                    await App.Shop.buy(App.Constant.BIG_POT);
                                    await App.General.goBack();
                                    await App.Farm.Plant.select(i);
                                }
                                await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                                if(!App.General.isLoading() && !App.General.hasCaptcha()) {
                                    await App.Tools.use(App.Constant.BIG_POT);
                                    if(App.Farm.Plant.getBigPotCount() == 2) break;
                                }
                                if(App.General.hasCaptcha()) break;
                            }
                        }
                        if(App.General.hasCaptcha()) return;
                        await App.Utility.timeout(200);
                        await App.Farm.Plant.unselect(i);
                    };
                    App.Utility.log("Finished adding pots to plants.");
                }
                resolve();
            });
        },
        waterPlants: function() {
            return new Promise(async resolve => {
                await App.Farm.isLoaded();
                var plantsToWater = App.Farm.getPlantsToWater();
                if(plantsToWater.length != 0) {
                    App.Utility.log("Start watering plants.");
                    for(var i of plantsToWater) {
                        await App.Farm.Plant.select(i);
                        await App.Utility.timeout(100);
                        if(App.Farm.Plant.canHarvest()) {
                            App.Utility.log("Plant can be harvested. Skipping plant...");
                            return;
                        }
                        while(App.Farm.Plant.canWater()) {
                            await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
                            if(!App.General.isLoading() && !App.General.hasCaptcha()) {
                                if(App.Tools.count(App.Constant.WATER) == 0) {
                                    await App.Shop.buy(App.Constant.WATER);
                                    await App.General.goBack();
                                    await App.Farm.Plant.select(i);
                                }
                                await App.Tools.use(App.Constant.WATER);
                                if(App.Farm.Plant.getWaterCount() == 2) break;
                            }
                        }
                        await App.Utility.timeout(100);
                        await App.Farm.Plant.unselect(i);
                    }
                    App.Utility.log("Finished watering plants.");
                }
                var plantsToScarecrow = App.Farm.getPlantsToScarecrow();
                if(plantsToScarecrow.length != 0) {
                    App.Utility.log("Start scaring crows.");
                    for(var i of plantsToScarecrow) {
                        await App.Farm.Plant.select(i);
                        await App.Utility.timeout(100);
                        if(App.Farm.Plant.canHarvest()) {
                            App.Utility.log("Plant can be harvested. Skipping plant...");
                            return;
                        }
                        if(App.Farm.Plant.hasCrow()) {
                            App.Utility.log("Plant has crow. Removing...");
                            App.Tools.use(App.Constant.SCARECROW);
                        }
                        await App.Utility.timeout(100);
                        await App.Farm.Plant.unselect(i);
                    };
                    App.Utility.log("Finished scaring crows.");
                }
                var plantsToDropSeed = App.Farm.getPlantsToDropSeed();
                if(plantsToDropSeed.length != 0) {
                    App.Utility.log("Start claiming seed.");
                    for(var i of plantsToDropSeed) {
                        await App.Farm.Plant.select(i);
                        await App.Utility.timeout(100);
                        if(App.Farm.Plant.canHarvest()) {
                            App.Utility.log("Plant can be harvested. Skipping plant...");
                            return;
                        }
                        if(App.Farm.Plant.hasSeed()) {
                            await App.Farm.Plant.claimSeed();
                        }
                        await App.Utility.timeout(100);
                        await App.Farm.Plant.unselect(i);
                    };
                    App.Utility.log("Finished claiming seed.");
                }
                resolve();
            });
        }
    },
    getData: async function() {
        const options = {
            method: 'get',
            headers: new Headers({
                'authorization': 'Bearer Token: ' + localStorage.getItem("token"),
            })
        };
        const r1 = await fetch("https://backend-farm.plantvsundead.com/farms?limit=10&offset=0",options);
        const j1 = await r1.json();
        j1["sapling"] = parseInt(document.querySelector(".exchange-number").textContent);
        j1["pvu"] = parseFloat(document.querySelector(".farmed-text").textContent.trim());
        j1["le"] = parseInt(document.querySelector(".wallet-text").textContent.trim());
        const r2 = await fetch("https://backend-farm.plantvsundead.com/my-plants?limit=9&offset=0&type=1",options);
        const j2 = await r2.json();
        const r3 = await fetch("https://backend-farm.plantvsundead.com/my-plants?limit=9&offset=0&type=2",options);
        const j3 = await r3.json();
        const r4 = await fetch("https://backend-farm.plantvsundead.com/get-seeds-inventory?index=0&limit=15",options);
        const j4 = await r4.json();
        const r5 = await fetch("https://backend-farm.plantvsundead.com/weather-today",options);
        const j5 = await r5.json();
        for(var x in j3.data) {
            j2.data.push(j3.data[x]);
        }
        await App.Account.go();
        j1["bnb"] = App.Balance.BNB.get();
        await App.Account.goToClaimSeeds();
        j1["unclaimed_seeds"] = document.querySelector(".grid[data-v-35f5064c]").offsetParent == null ? 0 : ((document.querySelector(".grid[data-v-35f5064c]").querySelectorAll(".grid__item").length > 0) ? parseInt(document.querySelector(".grid[data-v-35f5064c]").querySelectorAll(".grid__item")[0].querySelector("p.numSeed").textContent) : 0);
        await App.Farm.go();
        document.querySelector("body").innerHTML = document.querySelector("body").getInnerHTML() + `<textarea id="juvs">${JSON.stringify(j1)}\n${JSON.stringify(j2)}\n${JSON.stringify(j4)}\n${JSON.stringify(j5)}</textarea>`;
        document.querySelector("#juvs").select();
        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
        document.execCommand("copy");
        await App.Utility.timeout(App.Constant.SHORT_TIMEOUT);
        console.log("Done");
        location.reload();
    },
    init: async function() {
        var startDate = new Date();
        App.Utility.log("Initializing bot...");
        await App.WorldTree.init();
        await App.Farm.init();
        await App.Inventory.init();
        await App.Shop.init();
        App.Balance.Sapling.checkForSeed();
        App.Inventory.checkForClaimSeed();
        var duration = (new Date() - startDate) / 1000;
        App.Utility.log("Bot finished in " + duration + " seconds.");
    }
}
await App.init();
