const gamesList = [
    {
        name: "Bubble Shooter",
        slug: "bubble-shooter",
        imgUrl: "games/bubble-shooter/bubble_shooter_small.webp",
        description: "Pop your way to victory! Aim carefully and match 3 or more colorful bubbles to clear the board. Use strategy and skill to drop massive clusters for bonus points. A classic puzzle challenge that's easy to play but hard to master!",
        filepathCode: "games/bubble-shooter/index.html",
        category: ["Arcade", "Logic"]
    },
    {
        name: "Candy Crush",
        slug: "candy-crush",
        imgUrl: "games/candy-crush/candy_crush_small.webp",
        description: "Satisfy your sweet tooth with this delicious puzzle adventure! Swap and match tasty candies to create explosive combos and clear challenging levels. Each stage brings new treats and goals to keep you hooked. Can you conquer the candy kingdom?",
        filepathCode: "games/candy-crush/index.html",
        category: ["Logic", "Arcade"]
    },
    {
        name: "Tic Tac Toe",
        slug: "tic-tac-toe",
        imgUrl: "games/tic-tac-toe/tic_tac_toe_small.webp",
        description: "The classic game of logic, now with a stunning neon design! Challenge a friend or test your wits against our smart AI. Whether you're a beginner or a grandmaster, it's the perfect quick brain workout for all ages.",
        filepathCode: "games/tic-tac-toe/index.html",
        category: ["Logic"]
    },
    {
        name: "Fruit Slicer",
        slug: "fruit-slicer",
        imgUrl: "games/fruit-slicer/fruit_slice_small.webp",
        description: "Become the ultimate fruit chef! Swipe your way through a cascade of fresh fruits while avoiding dangerous bombs. Chain together massive combos for extra points and show off your blade mastery. Satisfyingly juicy action starts now!",
        filepathCode: "games/fruit-slicer/index.html",
        category: ["Action", "Arcade"]
    },
    {
        name: "Water Sort Puzzle",
        slug: "water-sort-puzzle",
        imgUrl: "games/water-sort-puzzle/water_sort_puzzle_small.webp",
        description: "Relax and sharpen your mind with this colorful liquid sorting challenge! Pour water between tubes to group matching colors together. It's simple at first, but gets trickier with every level. The ultimate stress-free brain teaser!",
        filepathCode: "games/water-sort-puzzle/index.html",
        category: ["Logic", "Educational"]
    },
    {
        name: "Block Ninja",
        slug: "block-ninja",
        imgUrl: "games/block-ninja/block_ninja_small.webp",
        description: "Master the art of the blade! Slice through falling blocks with lightning speed and precise swipes. Avoid the red blocks and keep your combo going to achieve the ultimate high score. Pure, fast-paced arcade action awaits!",
        filepathCode: "games/block-ninja/index.html",
        category: ["Action", "Arcade"]
    },
    {
        name: "Tower Blocks",
        slug: "tower-blocks",
        imgUrl: "games/tower-blocks/tower_block_small.webp",
        description: "Reach for the clouds! Build the tallest skyscraper by stacking blocks with perfect timing. Every miss makes your tower thinner, increasing the challenge. How high can you go before the wind takes over? Precision is everything!",
        filepathCode: "games/tower-blocks/index.html",
        category: ["Arcade"]
    },
    {
        name: "Neon Rider",
        slug: "neon-rider",
        imgUrl: "games/neon-rider/neon_rider_small.webp",
        description: "Buckle up for a high-speed journey through a glowing neon world! Control your futuristic bike, jump over gaps, and dodge obstacles in this pulse-pounding racing game. With vibrant visuals and intense speed, every run is an adrenaline rush!",
        filepathCode: "games/neon-rider/index.html",
        category: ["Action", "Arcade"]
    },
    {
        name: "Puzzle Master",
        slug: "puzzle-master",
        imgUrl: "games/puzzle-master/puzzle_master_small.webp",
        description: "The world's favorite jigsaw experience is here! Choose from a vast collection of stunning images and piece them together. With adjustable difficulty levels, it's the perfect way to unwind and focus your mind. Rediscover the joy of puzzling!",
        filepathCode: "games/puzzle-master/index.html",
        category: ["Logic"]
    },
    {
        name: "Guess the Quiz!",
        slug: "guess-the-quiz",
        imgUrl: "games/guess-the-quiz/guess_the_quiz_small.webp",
        description: "Think you're a genius? Prove it in this ultimate test of knowledge! Answer hundreds of fun and challenging questions across history, science, pop culture, and more. Compete for the highest score and become the true Quiz Master!",
        filepathCode: "games/guess-the-quiz/index.html",
        category: ["Educational"]
    },
    {
        name: "Hexa Match",
        slug: "hexa-match",
        imgUrl: "games/hexa-match/hexa_match_small.webp",
        description: "Step into a world of hexagonal strategy! Fit colorful blocks onto the board to create and clear full lines. There's no time limit, so take your time and plan the perfect move. A soothing and addictive puzzle experience for everyone!",
        filepathCode: "games/hexa-match/index.html",
        category: ["Logic"]
    },
    {
        name: "Genius Memory",
        slug: "genius-memory",
        imgUrl: "games/genius-memory/genius_momory_small.webp",
        description: "Give your brain a premium workout! Flip cards and find matches in this beautifully designed memory trainer. With multiple levels of difficulty, it's a fun way to improve your focus and concentration. How sharp is your memory truly?",
        filepathCode: "games/genius-memory/index.html",
        category: ["Educational", "Logic"]
    },
    {
        name: "Connect Balls",
        slug: "connect-balls",
        imgUrl: "games/connect-balls/connect_balls_small.webp",
        description: "Flow with logic! Connect matching colored balls with smooth lines to fill the entire grid. Paths cannot cross, so you'll need a clear strategy to solve every puzzle. Hundreds of mind-bending levels are waiting for you!",
        filepathCode: "games/connect-balls/index.html",
        category: ["Logic"]
    },
    {
        name: "Golden Fighter",
        slug: "golden-fighter",
        imgUrl: "games/golden-fighter/golden_fighter_small.webp",
        description: "Enter the arena and claim your glory! Choose your warrior and unleash powerful combos in this intense 2D fighting game. Face off against skilled opponents and master special moves to become the undisputed champion. The fight of your life begins!",
        filepathCode: "games/golden-fighter/index.html",
        category: ["Action"]
    },
    {
        name: "Monkey Jump",
        slug: "monkey-jump",
        imgUrl: "games/monkey-jump/monkey_jump_small.webp",
        description: "Leap into adventure with the cheekiest monkey in the jungle! Tap to jump between moving platforms, collect delicious bananas, and avoid tricky traps. See how high you can climb in this endless jumping fun. A perfect game for quick bursts of joy!",
        filepathCode: "games/monkey-jump/index.html",
        category: ["Action", "Arcade"]
    }
];

function loadCategories() {
    const desktopContainer = document.getElementById("desktopCategories");
    const mobileContainer = document.getElementById("mobileMenu");

    if (!desktopContainer || !mobileContainer) return;

    const categories = new Set(["All"]);

    gamesList.forEach(game => {
        if (game.category) {
            game.category.forEach(cat => {
                categories.add(cat);
            });
        }
    });

    const categoryArray = Array.from(categories);
    const params = new URLSearchParams(window.location.search);
    let catParam = params.get('category');
    if (!catParam) {
        const pathCat = window.location.pathname.split('/').filter(Boolean)[0];
        if (pathCat && categoryArray.some(c => c.toLowerCase() === pathCat.toLowerCase())) {
            catParam = pathCat.toLowerCase();
        }
    }
    const initialCategory = catParam ? (categoryArray.find(c => c.toLowerCase() === catParam.toLowerCase()) || "All") : "All";

    const renderButtons = (container, isMobile) => {
        container.innerHTML = "";
        categoryArray.forEach(cat => {
            const btn = document.createElement("button");

            const baseDesktop = "category-btn px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-primary/50 hover:shadow-glow-sm hover:text-white hover:bg-white/10";
            const baseMobile = "category-btn w-full py-2.5 rounded-2xl text-base font-medium transition-all duration-300 shadow-lg border border-white/20 text-white flex justify-center items-center backdrop-blur-xl transform";

            btn.className = isMobile ? baseMobile : baseDesktop;

            if (isMobile) {
                if (cat === initialCategory) {
                    btn.classList.add("bg-primary", "border-primary", "shadow-glow-md");
                } else {
                    btn.classList.add("bg-white/5");
                }
            } else {
                if (cat === initialCategory) {
                    btn.classList.add("bg-primary", "text-white", "shadow-glow-sm", "border-primary/50");
                } else {
                    btn.classList.add("bg-white/5", "text-muted-foreground");
                }
            }

            btn.textContent = cat;
            btn.dataset.category = cat;
            btn.dataset.isMobile = isMobile;

            btn.addEventListener("click", () => {
                window.location.href = cat === "All" ? "/" : `/${cat.toLowerCase()}`;
            });

            container.appendChild(btn);
        });
    };

    renderButtons(desktopContainer, false);
    renderButtons(mobileContainer, true);
}

function loadGames(selectedCategory = "All") {
    const grid = document.getElementById("gamesGrid");

    if (!grid) {
        return;
    }
    grid.innerHTML = "";

    const filteredGames = selectedCategory === "All"
        ? gamesList
        : gamesList.filter(game => game.category && game.category.includes(selectedCategory));

    filteredGames.forEach(game => {
        const card = document.createElement("div");
        card.className = "group w-full max-w-sm mx-auto border border-white/20 rounded-3xl overflow-hidden cursor-pointer bg-white/5 backdrop-blur-xl md:hover:bg-white/10 md:hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center p-2";

        card.innerHTML = `
            <div class="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner">
                <img src="${game.imgUrl}" alt="${game.name}" loading="lazy" class="w-full h-full object-cover md:group-hover:scale-[1.07] transition-transform duration-500">
            </div>
            <div class="w-full text-center pt-3 pb-1 md:pt-4 md:pb-2">
                <h3 class="font-medium md:font-extrabold text-white text-base md:text-lg md:tracking-wide drop-shadow-sm md:group-hover:text-primary transition-colors">${game.name}</h3>
            </div>
        `;

        card.addEventListener("click", () => {
            window.location.href = `/details/${game.slug}`;
        });
        grid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Handle generic document start correctly parsing URL path
    const urlParams = new URLSearchParams(window.location.search);
    let catParam = urlParams.get('category');

    // Dynamically build allowed categories from gamesList
    const allowedCategories = Array.from(new Set(["All"].concat(
        gamesList.flatMap(g => g.category || [])
    )));

    if (!catParam) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts.length === 1) {
            const pathCat = pathParts[0];
            const exemptPages = ['about-us', 'privacy-policy', 'terms-conditions', 'contact-us', 'faq', 'how-to-play', 'details', '404'];
            if (allowedCategories.some(c => c.toLowerCase() === pathCat.toLowerCase())) {
                catParam = pathCat.toLowerCase();
            } else if (!window.location.pathname.endsWith('.html') && !exemptPages.includes(pathCat.toLowerCase())) {
                window.location.href = "/404";
                return;
            }
        }
    }
    const category = catParam ? (allowedCategories.find(c => c.toLowerCase() === catParam.toLowerCase()) || "All") : "All";

    loadCategories();
    loadGames(category);
});

