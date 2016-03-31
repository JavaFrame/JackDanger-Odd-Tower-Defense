/*
Hallo!
Das hir ist deine Spielevorlage!
Ich hoffe, ich habe alles gut genug dokumentiert.

Alles was hier OTD heißt musst du umbennen in etwas sehr
individuelles. So wie KotzeMannGRKDM
Die wirren Buchstaben können wichtig sein, falls jemand anderes
auch KotzeMann entwickelt!

WICHTIG

Wenn dein Spiel geschafft ist, dann rufe

onVictory();

auf! Später wird da dann ein richtiger Gewonnenbildschrim erscheinen!

Wenn man in deinem Spiel verliert dann rufe

onLose()

auf, dardurch wird dein Spiel neugestartet.

Wärend du an deinem Spiel arbeitest, arbeite ich am Drumherum.
So dass es dann alles auch supi aussieht!
*/

JackDanger.OTD = function() {

};

//hier musst du deine Eintragungen vornhemen.
addMyGame("frame.ch.OTD",
    "Odd Tower Defense",
    "frame",
    "Kämpfe dich durch.",
    "Bewegen",
    "Neues Ziel",
    "Schiessen",
    JackDanger.OTD);


JackDanger.OTD.prototype.init = function() {
    logInfo("init Game");
    addLoadingScreen(this, false);//nicht anfassen
}

JackDanger.OTD.prototype.preload = function() {
	this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen
	
    //füge hie rein was du alles laden musst.
    this.load.atlas("sprites", "spritesheet.png", "sprites.json");
    this.load.bitmapFont("font", "testfont.png", "testfont.xml");

    this.load.audio("music1", ["music.ogg"], false);
    this.load.audio("music2", ["music2.ogg"], false);
    this.musics = ["music1", "music2"];
}
//wird nach dem laden gestartet
JackDanger.OTD.prototype.create = function() {
    Pad.init();//nicht anfassen
}

JackDanger.OTD.prototype.mycreate = function() {
    this.nextSong = true;
    this.stage.backgroundColor = "#ffffff";

    this.map_group = game.add.group();

    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.sprites = this.add.physicsGroup(Phaser.Physics.ARCADE);
    this.player_bullets = this.add.physicsGroup(Phaser.Physics.ARCADE);
    this.tower_bullets = this.add.physicsGroup(Phaser.Physics.ARCADE);
    this.fence_group = this.add.physicsGroup(Phaser.Physics.ARCADE);


    this.bar_group = game.add.group();
    this.damage_text_group = game.add.group();
    this.text_group = game.add.group();
    this.info_group = this.add.group();

    this.infoText = new JackDanger.OTD.InfoText(this);
    this.towerLeftText = new JackDanger.OTD.InfoText(this);
    this.towerLeftText.setText("3 von 3 Türmen fehlen\n\n" +
        "Tutorial Abschnitt");
    this.towerLeftText.moveTo(this.camera.width-this.towerLeftText.infoRect.width, this.camera.y);
    this.towerLeftText.setVisible(true);

    this.speedText = new JackDanger.OTD.InfoText(this.game)
    this.speedText.autoDisapearing = true;

    this.coutToEffectDeletText = new JackDanger.OTD.InfoText(this);
    this.coutToEffectDeletText.autoDisapearing = false;

    this.map_sections = {"-1": 0};

    this.fences = new Array();

    this.towers = new Array();
    this.avaibles_towers = 3;

    this.generateMap(this.avaibles_towers);

    this.player = new JackDanger.OTD.Player(this, this.sprites, this.towers);
    this.speed = 400;

    this.lastBullet = 0;
    this.bulletTime = 200;

    this.lastTargetChange = 0;
    this.targetChangeTime = 300;

    this.deleteList = new Array();

    this.currentSection = -1;
    this.currentSectionTotal = 3;
}

JackDanger.OTD.prototype.playNextSong = function() {
    if(this.music != null) {
        this.music.stop();
        this.music.destroy();
    }
    key = this.musics[this.generateNumber(0, this.musics.length)];
    this.music = this.add.audio(key)
    this.music.play(false, 1);
    this.music.onStop.add(function () {
        this.nextSong = true;
    }, this);
    console.log("play next song")
    this.nextSong = false;
}

JackDanger.OTD.prototype.createTower = function(tower, x, y, currentSectionId) {
    x *= 50;
    y *= 50;
    switch (tower) {
        case 0:this.towers.push(new JackDanger.OTD.Tower_1(this, x, y, this.sprites, this.towers, currentSectionId));
            break;
        case 1:this.towers.push(new JackDanger.OTD.Tower_2(this, x, y, this.sprites, this.towers, currentSectionId));
            break;
        case 2:this.towers.push(new JackDanger.OTD.Tower_3(this, x, y, this.sprites, this.towers, currentSectionId));
            break;
        default:
            console.log("Tower Id not exist!");
            return;
    }
    this.map_sections[currentSectionId]++;
    console.log("currentSectionId: "+ currentSectionId + ", map_section[currentSectionId]: " + this.map_sections[currentSectionId]);
}

JackDanger.OTD.prototype.destroyTower = function(tower) {
    this.towers.splice(this.towers.indexOf(tower), 1);
}

JackDanger.OTD.prototype.render = function() {
    /*this.game.debug.text("player y: " + this.player.sprite.y, 10, 150);
    this.game.debug.text("next Section: " + ((this.currentSection+1)*this.sectionLenght*50 + (this.tutorialLenght*50)), 10, 170);
    this.game.debug.text("next Section in Blocks: " + ((this.currentSection+1)*this.sectionLenght + (this.tutorialLenght)), 10, 190);
    this.game.debug.text("current Section+1: " + (this.currentSection+1), 10, 210);
    this.game.debug.text("Lefted tower in current section: " + this.map_sections[this.currentSection], 10, 230);
    this.game.debug.text("Total towrs in current section: " + this.currentSectionTotal, 10, 250);*/
}

JackDanger.OTD.prototype.update = function() {
    //console.log(this.music.currentTime + "/" +  this.music.durationMS)
    if(this.nextSong) {
        this.nextSong = false;
        this.playNextSong();
    }
    var dt = this.time.physicsElapsedMS * 0.001;
    for(i = 0; i < this.towers.length; i++) {
        var t = this.towers[i];
        t.update(dt);
        t.updateAimCircle();
    }

    this.playerControlls(dt);

    this.deleteList = new Array();
    this.physics.arcade.collide(this.sprites, this.player.sprite);
    this.physics.arcade.overlap(this.sprites, this.player_bullets, this.towerCollideCallBack , null, this);
    this.physics.arcade.overlap(this.player.sprite, this.tower_bullets, this.player.tower_hit , null, this.player);

    this.physics.arcade.collide(this.player.sprite, this.fence_group);
    this.physics.arcade.overlap(this.player_bullets, this.fence_group, this.fenceCallback, null, this);
    this.physics.arcade.overlap(this.tower_bullets, this.fence_group, this.imortal_fenceCallback, null, this);

    for(i = 0; i < this.deleteList.length; i++) {
        this.deleteList[i].destroy();
    }

    this.infoText.update();
    this.speedText.update();

    if (this.player.sprite.y > ((this.currentSection+1)*this.sectionLenght*50 + (this.tutorialLenght*50))) {
        this.currentSection++;
        this.currentSectionTotal = this.map_sections[this.currentSection];
        this.towerLeftText.setText(this.map_sections[this.currentSection] + " von " + this.currentSectionTotal + " Türmen fehlen\n\n" +
            (this.currentSection+1) + " von " + Object.keys(this.map_sections).length + " Abschnitte");
        console.log("update Section to " + this.currentSection)
    }

    this.player.update();

}

JackDanger.OTD.prototype.towerCollideCallBack = function(sprite, bullet) {
    bullet.destroy();

    x = sprite.x;
    y = sprite.y;
    for(i = 0; i < this.towers.length; i++) {
        var t = this.towers[i];
        if(t.sprite.x == x) {
            if(t.sprite.y == y) {
                t.hp -= bullet.damage;
                t.updateHpText(this.player);
                new JackDanger.OTD.DamageText(bullet.damage, x, y, this);
            }
        }
    }
}

JackDanger.OTD.prototype.fenceCallback = function(bullet, fence) {
    this.deleteList.push(bullet);
    for(i = 0; i < this.fences.length; i++) {
        f = this.fences[i];
        if(fence.x == f.sprite.x) {
            if(fence.y == f.sprite.y) {
                f.hit();
            }
        }
    }
}
JackDanger.OTD.prototype.imortal_fenceCallback = function(bullet, fence) {
    this.deleteList.push(bullet);
}

JackDanger.OTD.prototype.playerControlls = function(dt) {
    if (Pad.isDown(Pad.LEFT)) {
        this.player.moveBy(-(this.speed * dt),0);
        this.player.rotate(270);
    }

    if (Pad.isDown(Pad.RIGHT)) {
        this.player.moveBy((this.speed * dt),0);
        this.player.rotate(90);
    }

    if (Pad.isDown(Pad.UP)) {
        this.player.moveBy(0, -(this.speed*dt));
        this.player.rotate(0);
    }

    if (Pad.isDown(Pad.DOWN)) {
        this.player.moveBy(0, (this.speed*dt));
        this.player.rotate(180);
    }

    if(Pad.isDown(Pad.SHOOT)) {
        if (this.time.now - this.lastBullet > this.bulletTime) {
            if(this.player.autoAimTarget == null) {
                this.player.searchNewTarget(true);
            }
            this.player.checkTarget();
            start_point = new Phaser.Point(this.player.sprite.x, this.player.sprite.y);
            if(this.player.autoAimTarget != null) {
                target_point = new Phaser.Point(this.player.autoAimTarget.sprite.x, this.player.autoAimTarget.sprite.y);
            } else {
                target_point = this.player.getBulletTarget();
            }
            new JackDanger.OTD.Bullet(start_point, target_point, 400, this.player_bullets, "bullet", 30, 0, this);
            this.lastBullet = this.time.now;
        }
    }

    if(Pad.isDown(Pad.JUMP)) {
        if (this.time.now - this.lastTargetChange > this.targetChangeTime) {
            this.player.searchNewTarget(false);
            this.lastTargetChange = this.time.now;
        }
    }

    this.player.updateAutoAimCircle();
}


JackDanger.OTD.prototype.generateMap = function(avaibles_towers){
    this.width = 16;
    this.height = 105;
    this.real_width = this.width*50;
    this.real_height = this.height*50;
    this.world.setBounds(0,0, this.real_width, this.real_height);
    this.map = new Array(this.width);
    this.last_x = Math.floor(this.width/2);
    nextLine = false;
    this.tutorialLenght = 20;
    fence = false;
    this.rowCountSinceLastFence = 0;

    currentSectionId = 0;
    this.map_sections[currentSectionId] = 0;
    this.sectionLenght = 10;
    currentSectionLenght = 0;
    for(yi = this.tutorialLenght; yi < this.height; yi++) {
        this.rowCountSinceLastFence++;
        nextLine = false;
        fence = false;
        currentSectionLenght++;
        if(currentSectionLenght >= this.sectionLenght) {
            fence = true;
            for (i = 0; i < this.width; i++) {
                new JackDanger.OTD.Fence(this, i, yi, currentSectionId)
            }
            currentSectionId++;
            currentSectionLenght = 0;
            this.map_sections[currentSectionId] = 0;
            console.log("change sectionId to " + currentSectionId)
        }
        for(xi = 0; xi < this.width; xi++) {
            this.map[xi] = new Array(this.height);
            if (nextLine) {
                this.map[xi][yi] = this.createBlock("grass", xi, yi);
                if (this.generateNumber(0, 50) == 0) {
                    if(!fence) {
                        this.createTower(this.generateNumber(0, avaibles_towers), xi, yi, currentSectionId);
                    }
                }
                continue;
            }
            if (xi == this.last_x) {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
            } else if (xi == this.last_x - 1) {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
            } else if (xi == this.last_x + 1) {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
                this.last_x = this.generateNextWayCord(this.last_x);
                nextLine = true;
            } else {
                this.map[xi][yi] = this.createBlock("grass", xi, yi);
                if (this.generateNumber(0, 50) == 0) {
                    if(!fence) {
                        this.createTower(this.generateNumber(0, avaibles_towers), xi, yi, currentSectionId);
                    }
                }
            }

        }
    }

    for(i = 0; i < this.map_sections.length; i++) {
        console.log("Add Location Text at " + i*this.sectionLenght+this.tutorialLenght*50)
        this.game.add.bitmapText(this.real_width-150, i*this.sectionLenght*50+this.tutorialLenght*50+this.sectionLenght*50,
            'font', i+1 + " von " + this.map_sections.length, 32, this.text_group);
    }

    this.game.add.bitmapText(0, this.real_height-40, 'font', "Ziel", 32, this.text_group);
    this.generateTutorialMap()
    this.generateTutorialItems();
}

JackDanger.OTD.prototype.generateTutorialItems = function() {
    this.game.add.bitmapText(10, 300, 'font', "Das ist ein Zaun", 20, this.text_group);
    this.game.add.bitmapText(300, 300, 'font', "Schiess ein Loch hinein", 20, this.text_group);
    for(x =0; x < 7; x++) {
        new JackDanger.OTD.Fence(this, x, 7);
    }

    this.game.add.bitmapText(10, 450, 'font', "Das ist ein Tower.", 20, this.text_group);
    this.game.add.bitmapText(10, 570, 'font', "Wenn du im roten Radius bist,\n beschiesst der Tower dich.", 20, this.text_group);
    this.createTower(0, 1, 10, -1);


    this.game.add.bitmapText(10, 750, 'font', "Mit 'Springen' wechselst du das Ziel.\nEs muss aber im blauen Radius sein.", 20, this.text_group);

    for(x = 0; x < 5; x++) {
        new JackDanger.OTD.Fence(this, x, 16);
    }
    this.createTower(0, 1, 18, -1);
    this.createTower(0, 3, 18, -1);
    this.createTower(1, 3, 2, -1);
}

JackDanger.OTD.prototype.generateTutorialMap = function(xi, yi, nextline) {
    for(yi = 0; yi < this.tutorialLenght; yi++) {
        for (xi = 0; xi < this.width; xi++) {
            if (yi == this.tutorialLenght-1) {
                new JackDanger.OTD.Fence(this, xi, yi);
            }

            if(xi+1 < this.last_x) {
                this.map[xi][yi] = this.createBlock("grass", xi, yi);
            } else if(xi-1 > this.last_x) {
                this.map[xi][yi] = this.createBlock("grass", xi, yi);
            } else {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
            }
            /*if (nextLine) {
                this.map[xi][yi] = this.createBlock("grass", xi, yi);
                return;
            }
            if (xi == last_x) {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
            } else if (xi == last_x - 1) {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
            } else if (xi == last_x + 1) {
                this.map[xi][yi] = this.createBlock("earth", xi, yi);
                nextLine = true;
            } else {
                this.map[xi][yi] = this.createBlock("grass", xi, yi);
            }*/
        }
    }
}

JackDanger.OTD.prototype.generateNumber = function(min, max) {
    return Math.floor(Math.random() *(max - min) + min);;
}

JackDanger.OTD.prototype.generateNextWayCord = function(last_x) {
    ran = this.generateNumber(-1, 2)
    last_x += ran;
    if(last_x > this.width-2) {
        last_x = this.width-2;
    }
    if(last_x < 1) {
        last_x = 1;
    }
    return last_x;
}

JackDanger.OTD.prototype.createBlock = function(texture, x, y) {
    var block = this.map_group.create(x*50, y*50, "sprites", texture);

    block.width = 50;
    block.height = 50;
    block.autoCull = true;
    return block;
}

JackDanger.OTD.Player = function (game, sprites) {
    this.game = game;

    this.target_index = 0;
    this.potential_targets = new Array();
    this.potential_fences = new Array();

    this.autoAimTarget = null;
    this.autoAimRadix = 200;


    this.firecross = game.add.sprite(0,0, "sprites","fire_cross");
    this.firecross.anchor.setTo(0.5, 0.5);
    this.firecross.width = 100;
    this.firecross.height = 100;
    this.firecross.visible = false;


    //this.sprite = sprites.create(0, 0, 'JD');
    this.sprite = game.add.sprite(game.real_width/2,200, "sprites", "JD");
    this.sprite.width = 50;
    this.sprite.height = 23;
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.z = 1000;

    this.game.physics.arcade.enable(this.sprite);

    game.camera.follow(this.sprite.body, Phaser.Camera.FOLLOW_LOCKON);

    this.autoAimCircle = game.add.sprite(this.sprite.x, this.sprite.y, "sprites", "aim_circle");
    this.autoAimCircle.anchor.setTo(0.5, 0.5);
    this.autoAimCircle.x = this.sprite.x;
    this.autoAimCircle.y = this.sprite.y;
    this.autoAimCircle.height = this.autoAimRadix*2;
    this.autoAimCircle.width = this.autoAimRadix*2;

    this.hp = 100;

    this.bar = new JackDanger.OTD.HealthBar(game, 100, this.game.camera.y + this.game.camera.height-50, this.game.camera.width-200, 20, 100);

    this.lastSpeedAttack = 0;
    this.deleteSpeedEffect = 5000;
}

JackDanger.OTD.Player.prototype = {
    moveBy: function(x, y) {
        px = this.sprite.x;
        py = this.sprite.y;
        //console.log(px + "/" + py + "//" + this.game.real_width +"/" + this.game.real_height);
        if(px > this.game.real_width) {
            this.sprite.x = this.game.real_width;
            return;
        }
        if(px < 0){
            this.sprite.x = 0;
            return;
        }
        if(py > this.game.real_height) {
            this.game.music.stop();
            onVictory();
            return;
        }
        if(py < 0){
            this.sprite.y = 0;
            return;
        }
        this.sprite.body.x += x;
        this.sprite.body.y += y;

        this.bar.setPosition(100, this.game.camera.y + this.game.camera.height-50);
        this.game.infoText.moveTo(0, this.game.camera.y+20);

        this.game.towerLeftText.moveTo(this.game.camera.width-this.game.towerLeftText.infoRect.width, this.game.camera.y);

        this.game.coutToEffectDeletText.moveTo(this.game.camera.width-this.game.coutToEffectDeletText.infoRect.width,
            this.game.camera.y + this.game.camera.height - this.game.coutToEffectDeletText.infoRect.height);
    },
    rotate: function (a) {
        this.sprite.angle = a;
    },
    getBulletTarget: function() {
        vx = 0;
        vy = 0;
        switch (this.sprite.angle) {
            case 0:
                vy = -10;
                break;
            case 90:
                vx = 10;
                break;
            case 180:
                vy = 10;
                break;
            case 270:
                vx = -10;
                break;
            case -90:
                vx = -10;
                break;
            case -180:
                vy = 10;
                break;
            case -270:
                vx = -10;
                break;
        }
        return new Phaser.Point(this.sprite.x + vx, this.sprite.y + vy);
    },
    searchNewTarget: function(newList) {
        if(newList == true) {
            this.potential_targets = new Array();
            this.target_index = 0;
        }
        for(i = 0; i < this.potential_targets.length; i++) {
            t = this.potential_targets[i];
            diffX = t.sprite.x-this.sprite.x;
            diffY = t.sprite.y-this.sprite.y;
            diff = Math.sqrt(diffX*diffX + diffY*diffY);
            if(diff > this.autoAimRadix) {
                if(this.game.towers.indexOf(t) == -1) {

                    this.potential_targets.splice(i, 1);
                    console.log("splice target")
                } else if(this.game.towers[this.game.towers.indexOf(t)].sprite == null) {
                    this.potential_targets.splice(i, 1);
                    console.log("splice target")
                }
            }
        }

        for(i = 0; i < this.game.towers.length; i++) {
            t = this.game.towers[i];
            diffX = t.sprite.x-this.sprite.x;
            diffY = t.sprite.y-this.sprite.y;
            diff = Math.sqrt(diffX*diffX + diffY*diffY);
            if(diff < this.autoAimRadix) {
                if (this.potential_targets.indexOf(t) == -1) {
                    this.potential_targets.push(t);
                }
            }
        }


        if(this.target_index >= this.potential_targets.length) {
            this.autoAimTarget = this.potential_fences[this.target_index-this.potential_targets.length];
        } else {
            this.autoAimTarget = this.potential_targets[this.target_index];
        }

        this.target_index++;
        if(this.target_index >= (this.potential_targets.length)) {
            this.target_index = 0;
        }
        if(this.autoAimTarget != null) {
            this.firecross.x = this.autoAimTarget.sprite.x + this.autoAimTarget.sprite.width / 2;
            this.firecross.y = this.autoAimTarget.sprite.y + this.autoAimTarget.sprite.height / 2;
            this.firecross.visible = true;
        } else {
            this.firecross.visible = false;
        }
    },
    checkTarget: function() {
        var t = this.autoAimTarget;
        if(t == null)
            return;
        diffX = t.sprite.x-this.sprite.x;
        diffY = t.sprite.y-this.sprite.y;
        diff = Math.sqrt(diffX*diffX + diffY*diffY);
        if(diff > this.autoAimRadix) {
            this.searchNewTarget(true);
        }
    },
    updateAutoAimCircle: function (){
        this.autoAimCircle.x = this.sprite.x;
        this.autoAimCircle.y = this.sprite.y;
    },
    tower_hit: function(player, bullet) {
        if (bullet.effect == 0) {
            this.hp = this.hp - bullet.damage;
            new JackDanger.OTD.DamageText(bullet.damage, this.sprite.x, this.sprite.y, this.game);
            this.bar.setValue(this.hp);
            console.log("attack");
            if (this.hp <= 0) {
                this.game.music.stop();
                onLose();
            }
        } else if(bullet.effect == 1) {
            this.game.speed = 200;
            if(this.game.speed < 0) {
                this.game.speed = 0;
            }

            this.lastSpeedAttack = this.game.time.now;
            console.log(this)
            this.game.speedText.setText("Deine Geschwindigkeit wurde um die hälfter veringert verringert!");
            this.game.speedText.moveTo((this.game.camera.width/2)-this.game.speedText.infoRect.width/2, this.game.camera.y + this.game.camera.height/2)
            this.game.speedText.setVisible(true);

            this.game.coutToEffectDeletText.setText(this.deleteSpeedEffect/1000 + " sekunden");
            this.game.coutToEffectDeletText.setVisible(true);
            console.log("speed attack speed: " + this.game.speed);
        }
        bullet.destroy();
    },
    update: function() {
        timeTo = (this.deleteSpeedEffect - (this.game.time.now - this.lastSpeedAttack))/1000;
        if(timeTo < 0) timeTo = 0;
        this.game.coutToEffectDeletText.setText(timeTo + "\nsekunden");

        if(this.game.time.now - this.lastSpeedAttack > this.deleteSpeedEffect) {
            if(this.game.speed == 400)return
            this.game.speed = 400;
            this.game.speedText.setText("Deine Geschwindigkeit wurde zurückgesetzt!");
            this.game.speedText.moveTo((this.game.camera.width/2)-this.game.speedText.infoRect.width/2, this.game.camera.y + this.game.camera.height/2)
            this.game.speedText.setVisible(true);

            this.game.coutToEffectDeletText.setVisible(false);
        }
    }
}

JackDanger.OTD.Bullet = function(start_point, target, speed, bullets, texture, damage, effect, game) {
    this.vx = target.x-start_point.x;
    this.vy = target.y-start_point.y;
   // if(enemy) {
        this.sprite = bullets.create(start_point.x, start_point.y, "sprites", texture);
   /* } else {
        this.sprite = bullets.create(start_point.x, start_point.y, "sprites", "bullet");
    }*/
    this.sprite.width = 10;
    this.sprite.height = 10;
    if(texture == "snow_shot") {
        this.sprite.width = 30;
        this.sprite.height = 30;
    }
    game.physics.arcade.moveToXY(this.sprite, this.vx + start_point.x, this.vy+start_point.y, speed)
    this.sprite.damage = damage;
    this.sprite.effect = effect;
}


JackDanger.OTD.Tower = function (game) {
    this.game = game;
    this.maxHp = 100;
    this.hp = this.maxHp;

    this.shotRadix = 250;

    this.lastShot = 0;
    this.shotIntervall = 600;
    this.shotReCall = function(){};

    this.tower_context = this;
}

JackDanger.OTD.Tower.prototype = {
    update: function(delta){
        //console.log("shoot" + this.game.time.now + "/" + this.lastShot);
        if(this.game.time.now-this.lastShot > this.shotIntervall) {
            this.shotReCall.call(this.tower_context);
            this.lastShot = this.game.time.now;
        }
    }
}

JackDanger.OTD.Tower_1 = function(game, x, y, sprites, towers, sectionId) {
    this.game = game;
    this.sprites = sprites;
    this.towers = towers;
    this.sectionId = sectionId;

    this.sprite = this.sprites.create(x, y, "sprites", "t1_ground");
    this.sprite.width = 50;
    this.sprite.height = 50;
    this.game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;

    this.aim_circle = game.add.sprite(x-this.shotRadix, y-this.shotRadix, "sprites", "enenmy_aim_cirlce");
    this.aim_circle.width = this.shotRadix*2;
    this.aim_circle.height = this.shotRadix*2;

    this.hp = 100;
    this.bar = new JackDanger.OTD.HealthBar(game, x-25, y, 100, 20, 100);

    this.tower_context = this;
    this.shotReCall = function () {
        diffX = this.game.player.sprite.x - this.sprite.x;
        diffY = this.game.player.sprite.y - this.sprite.y;

        diff = Math.sqrt(diffX*diffX + diffY*diffY);
        if(diff > this.shotRadix) {
            return;
        }

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.game.player.sprite.x, this.game.player.sprite.y);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);
    }
}

JackDanger.OTD.Tower_1.prototype = new JackDanger.OTD.Tower();

JackDanger.OTD.Tower_1.prototype.updateHpText = function(player) {
    if(this.bar != null)
        this.bar.setValue(this.hp);
    if(this.hp <= 0) {
        this.game.deleteList.push(this.sprite);
        this.bar.destroy();
        this.aim_circle.destroy();
        this.game.destroyTower(this);
        player.searchNewTarget(true);
        this.game.map_sections[this.sectionId]--;
        if(this.game.currentSection == -1) {
        this.game.towerLeftText.setText(this.game.map_sections[this.game.currentSection] + " von " + this.game.currentSectionTotal + " Türmen fehlen\n\n" +
            "Tutorial Abschnitt");
        } else {
            this.game.towerLeftText.setText(this.game.map_sections[this.game.currentSection] + " von " + this.game.currentSectionTotal + " Türmen fehlen\n\n" +
                (this.game.currentSection + 1) + " von " + Object.keys(this.game.map_sections).length + " Abschnitte");
        }
    }
}

JackDanger.OTD.Tower_1.prototype.updateAimCircle = function() {
    diffX = this.game.player.sprite.x - this.sprite.x;
    diffY = this.game.player.sprite.y - this.sprite.y;

    diff = Math.sqrt(diffX*diffX + diffY*diffY);

    if(diff < this.shotRadix) {
        alpha = 1;
    } else {
        alpha = 0.05;
    }
    this.aim_circle.alpha = alpha;
}
JackDanger.OTD.Tower_2 = function(game, x, y, sprites, towers, sectionId) {
    this.game = game;
    this.sprites = sprites;
    this.towers = towers;
    this.sectionId = sectionId;

    this.sprite = this.sprites.create(x, y, "sprites", "t2_ground");
    this.sprite.width = 50;
    this.sprite.height = 50;
    this.game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;

    this.aim_circle = game.add.sprite(x-this.shotRadix, y-this.shotRadix, "sprites", "enenmy_aim_cirlce");
    this.aim_circle.width = this.shotRadix*2;
    this.aim_circle.height = this.shotRadix*2;

    this.hp = 100;
    this.bar = new JackDanger.OTD.HealthBar(game, x-25, y, 100, 20, 100);

    this.tower_context = this;
    this.shotReCall = function () {
        diffX = this.game.player.sprite.x - this.sprite.x;
        diffY = this.game.player.sprite.y - this.sprite.y;

        diff = Math.sqrt(diffX*diffX + diffY*diffY);
        if(diff > this.shotRadix) {
            return;
        }

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.game.player.sprite.x, this.game.player.sprite.y);
        new JackDanger.OTD.Bullet(start_point, target_point, 500, this.game.tower_bullets, "snow_shot", 4, 1, this.game);
    }
}

JackDanger.OTD.Tower_2.prototype = new JackDanger.OTD.Tower();

JackDanger.OTD.Tower_2.prototype.updateHpText = function(player) {
    if(this.bar != null)
        this.bar.setValue(this.hp);
    if(this.hp <= 0) {
        this.game.deleteList.push(this.sprite);
        this.bar.destroy();
        this.aim_circle.destroy();
        this.game.destroyTower(this);
        player.searchNewTarget(true);
        this.game.map_sections[this.sectionId]--;
        if(this.game.currentSection == -1) {
        this.game.towerLeftText.setText(this.game.map_sections[this.game.currentSection] + " von " + this.game.currentSectionTotal + " Türmen fehlen\n\n" +
            "Tutorial Abschnitt");
        } else {
            this.game.towerLeftText.setText(this.game.map_sections[this.game.currentSection] + " von " + this.game.currentSectionTotal + " Türmen fehlen\n\n" +
                (this.game.currentSection + 1) + " von " + Object.keys(this.game.map_sections).length + " Abschnitte");
        }
    }
}

JackDanger.OTD.Tower_2.prototype.updateAimCircle = function() {
    diffX = this.game.player.sprite.x - this.sprite.x;
    diffY = this.game.player.sprite.y - this.sprite.y;

    diff = Math.sqrt(diffX*diffX + diffY*diffY);

    if(diff < this.shotRadix) {
        alpha = 1;
    } else {
        alpha = 0.05;
    }
    this.aim_circle.alpha = alpha;
}
JackDanger.OTD.Tower_3 = function(game, x, y, sprites, towers, sectionId) {
    this.game = game;
    this.sprites = sprites;
    this.towers = towers;
    this.sectionId = sectionId;

    this.sprite = this.sprites.create(x, y, "sprites", "t3_ground");
    this.sprite.width = 50;
    this.sprite.height = 50;
    this.game.physics.arcade.enable(this.sprite);
    this.sprite.body.immovable = true;

    this.aim_circle = game.add.sprite(x-this.shotRadix, y-this.shotRadix, "sprites", "enenmy_aim_cirlce");
    this.aim_circle.width = this.shotRadix*2;
    this.aim_circle.height = this.shotRadix*2;

    this.hp = 100;
    this.bar = new JackDanger.OTD.HealthBar(game, x-25, y, 100, 20, 100);

    this.tower_context = this;
    this.shotReCall = function () {
        diffX = this.game.player.sprite.x - this.sprite.x;
        diffY = this.game.player.sprite.y - this.sprite.y;

        diff = Math.sqrt(diffX*diffX + diffY*diffY);
        if(diff > this.shotRadix) {
            return;
        }

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x+10, this.sprite.y+0);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x-10, this.sprite.y+0);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x+0, this.sprite.y+10);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x+0, this.sprite.y-10);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x+10, this.sprite.y+10);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x-10, this.sprite.y+10);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x-10, this.sprite.y-10);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);

        start_point = new Phaser.Point(this.sprite.x, this.sprite.y);
        target_point = new Phaser.Point(this.sprite.x+10, this.sprite.y-10);
        new JackDanger.OTD.Bullet(start_point, target_point, 300, this.game.tower_bullets, "enemy_bullet", 4, 0, this.game);
    }
}

JackDanger.OTD.Tower_3.prototype = new JackDanger.OTD.Tower();

JackDanger.OTD.Tower_3.prototype.updateHpText = function(player) {
    if(this.bar != null)
        this.bar.setValue(this.hp);
    if(this.hp <= 0) {
        this.game.deleteList.push(this.sprite);
        this.bar.destroy();
        this.aim_circle.destroy();
        this.game.destroyTower(this);
        player.searchNewTarget(true);
        this.game.map_sections[this.sectionId]--;
        if(this.game.currentSection == -1) {
        this.game.towerLeftText.setText(this.game.map_sections[this.game.currentSection] + " von " + this.game.currentSectionTotal + " Türmen fehlen\n\n" +
            "Tutorial Abschnitt");
        } else {
            this.game.towerLeftText.setText(this.game.map_sections[this.game.currentSection] + " von " + this.game.currentSectionTotal + " Türmen fehlen\n\n" +
                (this.game.currentSection + 1) + " von " + Object.keys(this.game.map_sections).length + " Abschnitte");
        }
    }
}

JackDanger.OTD.Tower_3.prototype.updateAimCircle = function() {
    diffX = this.game.player.sprite.x - this.sprite.x;
    diffY = this.game.player.sprite.y - this.sprite.y;

    diff = Math.sqrt(diffX*diffX + diffY*diffY);

    if(diff < this.shotRadix) {
        alpha = 1;
    } else {
        alpha = 0.05;
    }
    this.aim_circle.alpha = alpha;
}

JackDanger.OTD.Fence = function(game, x, y, sectionId) {
    this.game = game;
    this.sectionId = sectionId;

    console.log("init Fence with sectionId " + sectionId)

    this.sprite = game.fence_group.create(x*50, y*50, "sprites", "fence");
    this.sprite.body.immovable = true;
    this.sprite.width = 68;
    this.sprite.height = 50;

    this.hp = 100;

    this.bar = new JackDanger.OTD.HealthBar(game, x*50+5, y*50, 30, 10, 100);
    game.fences.push(this);
}

JackDanger.OTD.Fence.prototype.hit = function() {
    if(this.game.map_sections[this.sectionId] > 0) {
        this.game.infoText.setText("Alle Türme in einem Abnscht müsse\nzerstört sein, um weiter\nzu kommen!")
        this.game.infoText.setVisible(true);
        return;
    }
    this.hp -= 40;
    this.bar.setValue(this.hp);
    if(this.hp <= 0) {
        this.game.deleteList.push(this.sprite);
        this.game.fences.splice(this.game.fences.indexOf(this), 1);
        this.game.player.searchNewTarget();
        this.bar.destroy();
    }
}

JackDanger.OTD.HealthBar = function(game, x, y, width, height, max) {
    this.game = game;
    this.max = max;
    this.max_width = width;
    this.bar = game.bar_group.create(x, y, "sprites", "loading_bar");
    this.bar.width = width;
    this.bar.height = height;

    this.bar_around = game.bar_group.create(x, y, "sprites", "loading_bar_around");
    this.bar_around.width = width;
    this.bar_around.height = height;
}

JackDanger.OTD.HealthBar.prototype = {
    setValue: function(value) {
        width = this.max_width*value/this.max;
        if(width < 0)
            width = 0;
        this.bar.width = width;
    },
    destroy: function() {
        this.bar.destroy();
        this.bar_around.destroy();
    },
    setPosition: function(x, y) {
        this.bar.x = x;
        this.bar.y = y;
        this.bar_around.x = x;
        this.bar_around.y = y;
    }
}

JackDanger.OTD.InfoText = function(game, text) {
    this.game = game;

    this.infoRect = this.game.add.sprite(0, 0, "sprites", "infoRect", this.game.info_group);
    this.infoRect.alpha = 0;
    this.infoText = this.game.add.bitmapText(0, 0, 'font', "Info", 20, this.game.info_group);
    this.infoText.alpha = 0;
    if(text != null) this.setText(text);

    this.disapearDelay = 5000;
    this.lastApear = 0;

    this.visible = false;
    this.autoDisapearing = false;
}

JackDanger.OTD.InfoText.prototype = {
    moveBy: function(x, y) {
        this.infoRect.x += x;
        this.infoRect.y += y;

        this.infoText.x = this.infoRect.x+10;
        this.infoText.y = this.infoRect.y+10;
    },
    moveTo: function(x, y) {
        this.infoRect.x = x;
        this.infoRect.y = y;

        this.infoText.x = this.infoRect.x+10;
        this.infoText.y = this.infoRect.y+10;
    },
    setText: function(text) {
        this.infoText.setText(text);
        this.infoRect.width = this.infoText.width+20;
        this.infoRect.height = this.infoText.height+20;
    },
    setVisible: function(visible) {
        this.visible = visible;
        this.lastApear = this.game.time.now;
        if(visible) {
            this.fadeIn();
        } else {
            this.fadeOut();
        }
    },
    update: function() {
        if(!this.autoDisapearing) return;
        if(!this.visible) return;
        if(this.game.time.now - this.lastApear > this.disapearDelay) {
            this.setVisible(false);
        }
    },
    fadeIn: function() {
        game.add.tween(this.infoText).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
        game.add.tween(this.infoRect).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
    },
    fadeOut: function() {
        game.add.tween(this.infoText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);
        game.add.tween(this.infoRect).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);
    }
}

JackDanger.OTD.DamageText = function(damage, x, y, game) {
    this.text = game.add.bitmapText(x, y, 'font', "" + damage, 20, game.info_group, game.damage_text_group);
    game.add.tween(this.text).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
    game.add.tween(this.text).to({y: y+20}, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
    game.game.time.events.add(500, function(){
        this.text.destroy();
    }, this)
}
