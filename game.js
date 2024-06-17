const config = {
    type: Phaser.AUTO,
    width: 2080,
    height: 960,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        key: 'mainScene',
        preload: preload,
        create: create,
        update: update
    }

};

let player;
let cursors;
let enemies;
const enemySpeed = 150;
const respawnDelay = 2000;
let playerHP = 100; // Initial player HP
let playerHPText; // Variable to store the text displaying player HP
let playerScore = 0; // Initial player score
let playerScoreText; // Variable to store the text displaying player score
let isGameOver = false;
let leftButton;
let rightButton;
let jumpButton;
let highScore = 0;


const game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'sky.png');
    this.load.spritesheet('dude', 'dude.png', { frameWidth: 198.8, frameHeight: 138 });
    this.load.spritesheet('jumpdude', 'jumpdude.png', { frameWidth: 198.8, frameHeight: 138 });
    this.load.spritesheet('idledude', 'idledude.png', { frameWidth: 198.9, frameHeight: 138 });
    
    
    this.load.spritesheet('enemy', 'enemysprite.png', { frameWidth: 51.4, frameHeight: 50 }); // Adjust frameWidth and frameHeight
    this.load.image('leftButton', 'leftButton.png');
    this.load.image('rightButton', 'rightButton.png');
    this.load.image('jumpButton', 'jumpButton.png');


    this.load.on('complete', function () {
        document.getElementById('preloader').style.display = 'none';
    });
}

function create() {
 
     let bg = this.add.tileSprite(0, 0, config.width, config.height, 'sky').setOrigin(0, 0);
 
     // Calculate the initial scale to cover the entire screen
     bg.setScale(config.width / bg.width, config.height / bg.height);
 
     // Ensure the background scales correctly when the game is resized
     this.scale.on('resize', function(gameSize) {
         bg.setSize(gameSize.width, gameSize.height);
         bg.setScale(gameSize.width / bg.width, gameSize.height / bg.height);
     }, this);
 
    
    

    // Camera adjustment
    this.cameras.main.setBounds(0, 0, config.width, config.height);
    this.cameras.main.setZoom(1.1);  // Adjust zoom level as needed

    // Ensure the world bounds match the game dimensions
    this.physics.world.setBounds(0, 0, config.width, config.height);


    
    

    // Display player HP text at the top left with a black shadow
    playerHPText = this.add.text(150, 100, 'HP: 100', { fontSize: '62px', fill: '#fff' })
     .setScrollFactor(0)
     .setShadow(2, 2, 'rgba(0,0,0,1)', 2); // Add black shadow




    player = this.physics.add.sprite(config.width / 2, config.height + 30, 'dude');
    player.setSize(40, 100);
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.setScale(2);

    this.physics.world.on('worldbounds', function (body) {
        if (body.gameObject === player) {
            player.setVelocityX(0);
            player.setX(Phaser.Math.Clamp(player.x, 0, config.width));
        }
    }, this);

    createAnimations.call(this);

    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    cursors = this.input.keyboard.createCursorKeys();

   // Create an enemy group
      enemies = this.physics.add.group({});

      // Set properties for each enemy
      enemies.children.iterate(function (enemy) {
          enemy.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          enemy.setCollideWorldBounds(true);
      });

      // Add collider between player and enemies
      this.physics.add.collider(player, enemies, handleEnemyPlayerCollision, null, this);

      // Start the timer to respawn enemies continuously
      this.time.addEvent({
          delay: respawnDelay,
          callback: respawnEnemy,
          callbackScope: this,
          loop: true
      });

      function handleEnemyPlayerCollision(player, enemy) {
 if (isGameOver) {
 enemy.destroy();
            return;
        }
          // Check if the collision is from the top of the enemy and the bottom of the player
          if (player.y < enemy.y && player.body.touching.down && enemy.body.touching.up) {
              enemy.destroy();
               // Increase player score and update the score text
                      playerScore += 10; // Adjust the score based on your preference

              return;
          }
          enemy.destroy();

          // Otherwise, decrease player HP and update the HP text
          playerHP -= 10; // Adjust the amount based on your preference
          playerHP = Phaser.Math.Clamp(playerHP, 0, 100); // Ensure player HP stays between 0 and 100

          playerHPText.setText('HP: ' + playerHP);

          // Additional actions based on player HP, e.g., player death
       if (playerHP === 0) {
              gameOver.call(this); // Call the game over function
              return;
          }
      }

// Load the high score from local storage
const storedHighScore = localStorage.getItem('highScore');
if (storedHighScore) {
    highScore = parseInt(storedHighScore, 10);
}

function gameOver() {
    isGameOver = true;

    // Update high score if the current score is higher
  // Update high score if the current score is higher
    if (playerScore > highScore) {
        highScore = playerScore;

        // Save the high score to local storage
        localStorage.setItem('highScore', highScore);
    }

    // Display game over message and high score
    const gameOverText = this.add.text(config.width / 2, config.height / 2 + 250, 'Game Over', { fontSize: '200px', fill: '#fff' })
        .setOrigin(0.5)
        .setShadow(2, 2, 'rgba(0,0,0,1)', 2);

    const scoreText = this.add.text(config.width / 2, config.height / 2 + 50, 'Score: ' + playerScore, { fontSize: '100px', fill: '#fff' })
        .setOrigin(0.5)
        .setShadow(2, 2, 'rgba(0,0,0,1)', 2);

    const highScoreText = this.add.text(config.width / 2, config.height / 2 + 150, 'High Score: ' + highScore, { fontSize: '100px', fill: '#fff' })
        .setOrigin(0.5)
        .setShadow(2, 2, 'rgba(0,0,0,1)', 2);

    // Create a restart button
    const restartButton = this.add.text(config.width / 2, config.height / 2 -50, 'Restart', { fontSize: '64px', fill: '#fff', backgroundColor: '#66A242' })
        .setOrigin(0.5)
        .setInteractive()
        .setShadow(2, 2, 'rgba(0,0,0,1)', 2);

    // ... (Your existing code)

    // Handle button click event
    restartButton.on('pointerdown', function () {
    playerScore = 0;
    isGameOver = false;
    playerHP = 100;
        this.scene.restart(); // Restart the current scene
    }, this);
}


  // Create onscreen buttons
    leftButton = this.add.sprite(200, config.height - 100, 'leftButton').setInteractive();
    rightButton = this.add.sprite(200, config.height - 100, 'rightButton').setInteractive();
    jumpButton = this.add.sprite(config.width - 100, config.height - 100, 'jumpButton').setInteractive();

    // Scale the buttons and set their alpha to make them semi-transparent
    leftButton.setScale(2).setAlpha(1);
    rightButton.setScale(2).setAlpha(1);
    jumpButton.setScale(2).setAlpha(1);



    // Add click/tap events to the buttons
        leftButton.on('pointerdown', function () {
            cursors.left.isDown = true;
        });
        leftButton.on('pointerup', function () {
            cursors.left.isDown = false;
        });
        leftButton.on('pointerout', function () {
            cursors.left.isDown = false;
        });

        rightButton.on('pointerdown', function () {
            cursors.right.isDown = true;
        });
        rightButton.on('pointerup', function () {
            cursors.right.isDown = false;
        });
        rightButton.on('pointerout', function () {
            cursors.right.isDown = false;
        });

        jumpButton.on('pointerdown', function () {
            cursors.up.isDown = true;
        });
        jumpButton.on('pointerup', function () {
            cursors.up.isDown = false;
        });
        jumpButton.on('pointerout', function () {
            cursors.up.isDown = false;
        });
}

function update() {

leftButton.x = this.cameras.main.worldView.left + 150;
rightButton.x = this.cameras.main.worldView.left + 400;
jumpButton.x = this.cameras.main.worldView.right - 150;



leftButton.y = this.cameras.main.worldView.bottom - 100;
rightButton.y = this.cameras.main.worldView.bottom - 100;
jumpButton.y = this.cameras.main.worldView.bottom - 100;


    if (cursors.left.isDown) {
        player.setVelocityX(-250);
        player.flipX = true;
        player.body.onFloor() ? player.anims.play('left', true) : null;
    } else if (cursors.right.isDown) {
        player.setVelocityX(250);
        player.flipX = false;
        player.body.onFloor() ? player.anims.play('right', true) : null;
    } else {
        player.setVelocityX(0);
        player.body.onFloor() ? player.anims.play('idle', true) : null;
    }

    if (cursors.up.isDown && player.body.onFloor()) {
        player.setVelocityY(-800);
        player.anims.play('jump', true);
    }

    // Additional check to play 'jump' animation when jumping while walking
    if (!player.body.onFloor() && (cursors.left.isDown || cursors.right.isDown)) {
        player.anims.play('jump', true);
    }

    // Update enemy behavior
    enemies.children.iterate(function (enemy) {

        // Chasing behavior
        if (player.x < enemy.x) {
            enemy.setVelocityX(-enemySpeed);
        } else {
            enemy.setVelocityX(enemySpeed);
        }
    });

    // Adjusting gravity based on whether the player is on the floor or in the air
    player.body.velocity.y > 0 ? player.body.gravity.y = 10000 : player.body.gravity.y = 300;
}






// Add a new function to respawn enemies
function respawnEnemy() {
   if (isGameOver) {
            return;
        }
    // Create a new enemy at the starting point (either from the very left or very right)
    const startX = Phaser.Math.Between(0, 1) === 0 ? -50 : config.width + 50;
    const startY = Phaser.Math.Between(0, config.height);

    const newEnemy = enemies.create(startX, startY, 'enemy');
    newEnemy.setSize(40, 0); // Set size based on your sprite dimensions
    newEnemy.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    newEnemy.setScale(2)
    newEnemy.setCollideWorldBounds(true);

    // Flip the enemy horizontally if it's moving from right to left
    newEnemy.flipX = startX === config.width + 50;

    // Add animations if your sprite sheet has them
    this.anims.create({
        key: 'enemyAnimation',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 14 }), // Adjust the range based on your sprite sheet
        frameRate: 20,
        repeat: -1
    });

    newEnemy.anims.play('enemyAnimation');
}



function createAnimations() {
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 1 }],
        frameRate: 40
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('jumpdude', { start: 0, end: 7, first: 0 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('idledude', { start: 0, end: 6, first: 0 }),
        frameRate: 10,
        repeat: -1
    });

    player.anims.play('idle');
}
