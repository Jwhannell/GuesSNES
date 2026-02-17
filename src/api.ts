import type { SNESGame } from './types';
import { appendToSet, readSet, clearKey } from './storage';
import { generateHintsFromText, filterOutUsedHints, hashHint, shuffleArray } from './hints';

const USED_HINTS_KEY = 'sgl_used_hint_hashes_v1';
const SEEN_GAME_IDS_KEY = 'sgl_seen_game_ids_v1';
const MAX_HINT_HISTORY = 500;
const MAX_GAME_HISTORY = 200;
const MAX_HINTS_PER_GAME = 6;

// Mock SNES games data (titles only; hints are fetched/generated at runtime)
// Expanded library covering the US SNES library across multiple genres
const mockGamesData: SNESGame[] = [
  // Platform Games
  { id: '1', title: 'Super Mario World', reviewSnippets: [], reviewScore: 94, summary: 'A platformer where Mario explores Dinosaur Land to rescue Princess Toadstool from Bowser, featuring Yoshi and introducing new power-ups like the Cape Feather.', externalLink: 'https://en.wikipedia.org/wiki/Super_Mario_World' },
  { id: '2', title: 'Super Mario World 2: Yoshi\'s Island', reviewSnippets: [], reviewScore: 96, summary: 'A prequel starring Baby Mario riding on Yoshi\'s back through colorful hand-drawn levels, known for its unique art style and egg-throwing mechanics.', externalLink: 'https://en.wikipedia.org/wiki/Yoshi%27s_Island' },
  { id: '3', title: 'Donkey Kong Country', reviewSnippets: [], reviewScore: 92, summary: 'A platformer featuring Donkey Kong and Diddy Kong on a quest to recover their stolen banana hoard, renowned for its pre-rendered 3D graphics.', externalLink: 'https://en.wikipedia.org/wiki/Donkey_Kong_Country' },
  { id: '4', title: 'Donkey Kong Country 2: Diddy\'s Kong Quest', reviewSnippets: [], reviewScore: 92, summary: 'Diddy Kong and Dixie Kong adventure to rescue Donkey Kong from the evil pirate King K. Rool, featuring more complex levels and atmospheric music.', externalLink: 'https://en.wikipedia.org/wiki/Donkey_Kong_Country_2:_Diddy%27s_Kong_Quest' },
  { id: '5', title: 'Donkey Kong Country 3: Dixie Kong\'s Double Trouble!', reviewSnippets: [], reviewScore: 87, summary: 'The third DKC game stars Dixie Kong and her cousin Kiddy Kong searching for Donkey and Diddy Kong in the Northern Kremisphere.', externalLink: 'https://en.wikipedia.org/wiki/Donkey_Kong_Country_3:_Dixie_Kong%27s_Double_Trouble!' },
  { id: '6', title: 'Super Mario All-Stars', reviewSnippets: [], reviewScore: 88, summary: 'A compilation of Super Mario Bros. 1, 2, 3, and The Lost Levels, all remade with enhanced 16-bit graphics and sound.', externalLink: 'https://en.wikipedia.org/wiki/Super_Mario_All-Stars' },
  { id: '7', title: 'Kirby Super Star', reviewSnippets: [], reviewScore: 88, summary: 'A compilation of eight different games featuring Kirby with unique gameplay modes, including cooperative play and copy abilities.', externalLink: 'https://en.wikipedia.org/wiki/Kirby_Super_Star' },
  { id: '8', title: 'Kirby\'s Dream Land 3', reviewSnippets: [], reviewScore: 74, summary: 'Kirby teams up with animal friends to save Dream Land from Dark Matter, featuring pastel-colored graphics and creative level design.', externalLink: 'https://en.wikipedia.org/wiki/Kirby%27s_Dream_Land_3' },
  { id: '9', title: 'Kirby\'s Dream Course', reviewSnippets: [], reviewScore: 76, summary: 'A unique golf-style puzzle game where Kirby is the ball, navigating isometric courses to collect enemies and reach the goal.', externalLink: 'https://en.wikipedia.org/wiki/Kirby%27s_Dream_Course' },
  { id: '10', title: 'Aladdin', reviewSnippets: [], reviewScore: 82, summary: 'Based on Disney\'s animated film, players control Aladdin through Agrabah with fluid animation and challenging platforming.', externalLink: 'https://en.wikipedia.org/wiki/Disney%27s_Aladdin_(Virgin_Games_video_game)' },
  { id: '11', title: 'The Lion King', reviewSnippets: [], reviewScore: 75, summary: 'A challenging platformer following Simba\'s journey from cub to king, known for its difficult gameplay and faithful adaptation of the film.', externalLink: 'https://en.wikipedia.org/wiki/The_Lion_King_(video_game)' },
  { id: '12', title: 'Earthworm Jim', reviewSnippets: [], reviewScore: 85, summary: 'A humorous run-and-gun platformer starring a worm in a robotic suit, featuring quirky level design and animation.', externalLink: 'https://en.wikipedia.org/wiki/Earthworm_Jim_(video_game)' },
  { id: '13', title: 'Earthworm Jim 2', reviewSnippets: [], reviewScore: 84, summary: 'The sequel expands on the original with more varied gameplay, surreal humor, and creative level concepts.', externalLink: 'https://en.wikipedia.org/wiki/Earthworm_Jim_2' },
  { id: '14', title: 'Sparkster', reviewSnippets: [], reviewScore: 80, summary: 'A fast-paced action platformer starring a rocket-powered opossum knight defending his kingdom from invaders.', externalLink: 'https://en.wikipedia.org/wiki/Sparkster_(1994_video_game)' },
  { id: '15', title: 'The Magical Quest Starring Mickey Mouse', reviewSnippets: [], reviewScore: 78, summary: 'Mickey Mouse searches for his dog Pluto through magical lands, using costume changes that grant different abilities.', externalLink: 'https://en.wikipedia.org/wiki/The_Magical_Quest_Starring_Mickey_Mouse' },
  
  // Action-Adventure & RPGs
  { id: '16', title: 'The Legend of Zelda: A Link to the Past', reviewSnippets: [], reviewScore: 95, summary: 'Link must rescue Hyrule from Ganon by traveling between the Light and Dark Worlds, widely considered one of the greatest games of all time.', externalLink: 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_A_Link_to_the_Past' },
  { id: '17', title: 'Super Metroid', reviewSnippets: [], reviewScore: 96, summary: 'Samus Aran explores planet Zebes to rescue a Metroid larva, featuring atmospheric exploration and non-linear progression.', externalLink: 'https://en.wikipedia.org/wiki/Super_Metroid' },
  { id: '18', title: 'Chrono Trigger', reviewSnippets: [], reviewScore: 95, summary: 'A time-traveling RPG where Crono and friends prevent the apocalypse across different eras, featuring multiple endings and innovative gameplay.', externalLink: 'https://en.wikipedia.org/wiki/Chrono_Trigger' },
  { id: '19', title: 'Final Fantasy VI', reviewSnippets: [], reviewScore: 94, summary: 'An epic RPG about a group of rebels fighting against an empire seeking to harness magic, featuring an ensemble cast and emotional storytelling.', externalLink: 'https://en.wikipedia.org/wiki/Final_Fantasy_VI' },
  { id: '20', title: 'Final Fantasy IV', reviewSnippets: [], reviewScore: 85, summary: 'Dark Knight Cecil\'s journey of redemption features a dramatic story, memorable characters, and the innovative Active Time Battle system.', externalLink: 'https://en.wikipedia.org/wiki/Final_Fantasy_IV' },
  { id: '21', title: 'Final Fantasy V', reviewSnippets: [], reviewScore: 83, summary: 'Features an intricate job system allowing extensive character customization as four heroes try to prevent Exdeath from controlling the crystals.', externalLink: 'https://en.wikipedia.org/wiki/Final_Fantasy_V' },
  { id: '22', title: 'Earthbound', reviewSnippets: [], reviewScore: 75, summary: 'A quirky RPG set in modern America where Ness and friends battle aliens with psychic powers, known for its unique humor and charm.', externalLink: 'https://en.wikipedia.org/wiki/EarthBound' },
  { id: '23', title: 'Secret of Mana', reviewSnippets: [], reviewScore: 86, summary: 'An action RPG featuring real-time combat and cooperative multiplayer as three heroes wield the Mana Sword against evil forces.', externalLink: 'https://en.wikipedia.org/wiki/Secret_of_Mana' },
  { id: '24', title: 'Secret of Evermore', reviewSnippets: [], reviewScore: 72, summary: 'An action RPG where a boy and his dog travel through different fantasy realms trying to find their way home.', externalLink: 'https://en.wikipedia.org/wiki/Secret_of_Evermore' },
  { id: '25', title: 'Super Mario RPG: Legend of the Seven Stars', reviewSnippets: [], reviewScore: 89, summary: 'A collaboration between Nintendo and Square, combining Mario\'s world with turn-based RPG mechanics and timed attacks.', externalLink: 'https://en.wikipedia.org/wiki/Super_Mario_RPG' },
  { id: '26', title: 'Breath of Fire', reviewSnippets: [], reviewScore: 78, summary: 'A traditional RPG where Ryu, who can transform into dragons, leads a party to stop the Dark Dragon Goddess.', externalLink: 'https://en.wikipedia.org/wiki/Breath_of_Fire_(video_game)' },
  { id: '27', title: 'Breath of Fire II', reviewSnippets: [], reviewScore: 79, summary: 'The sequel follows a new Ryu on a quest to stop a demon masquerading as a god, featuring expanded gameplay and darker themes.', externalLink: 'https://en.wikipedia.org/wiki/Breath_of_Fire_II' },
  { id: '28', title: 'Illusion of Gaia', reviewSnippets: [], reviewScore: 81, summary: 'An action-adventure game following Will\'s journey through ancient ruins based on real-world locations, with puzzle-solving and combat.', externalLink: 'https://en.wikipedia.org/wiki/Illusion_of_Gaia' },
  { id: '29', title: 'Terranigma', reviewSnippets: [], reviewScore: 84, summary: 'An action RPG where Ark must resurrect the world and all its creatures, exploring the relationship between creation and destruction.', externalLink: 'https://en.wikipedia.org/wiki/Terranigma' },
  { id: '30', title: 'Lufia II: Rise of the Sinistrals', reviewSnippets: [], reviewScore: 85, summary: 'A prequel featuring innovative puzzle-filled dungeons and a tragic storyline about heroes fighting the immortal Sinistrals.', externalLink: 'https://en.wikipedia.org/wiki/Lufia_II:_Rise_of_the_Sinistrals' },
  { id: '31', title: 'Lufia & The Fortress of Doom', reviewSnippets: [], reviewScore: 74, summary: 'A traditional RPG where descendants of legendary heroes must stop the resurrected Sinistrals from conquering the world.', externalLink: 'https://en.wikipedia.org/wiki/Lufia_%26_the_Fortress_of_Doom' },
  { id: '32', title: 'Star Ocean', reviewSnippets: [], reviewScore: 82, summary: 'A sci-fi RPG blending swords and spaceships with real-time combat and a unique crafting system, never officially released in North America.', externalLink: 'https://en.wikipedia.org/wiki/Star_Ocean_(video_game)' },
  { id: '33', title: 'Tales of Phantasia', reviewSnippets: [], reviewScore: 83, summary: 'The first Tales game features time travel, real-time combat, and animated cutscenes, originally only released in Japan.', externalLink: 'https://en.wikipedia.org/wiki/Tales_of_Phantasia' },
  { id: '34', title: 'Seiken Densetsu 3', reviewSnippets: [], reviewScore: 85, summary: 'The Secret of Mana sequel with six playable characters, branching storylines, and class changes, never officially released in the West until 2019.', externalLink: 'https://en.wikipedia.org/wiki/Trials_of_Mana' },
  
  // Action Games
  { id: '35', title: 'Mega Man X', reviewSnippets: [], reviewScore: 88, summary: 'A futuristic Mega Man featuring X and Zero fighting Mavericks with wall-jumping, dash mechanics, and armor upgrades.', externalLink: 'https://en.wikipedia.org/wiki/Mega_Man_X_(video_game)' },
  { id: '36', title: 'Mega Man X2', reviewSnippets: [], reviewScore: 84, summary: 'X battles new Mavericks and the X-Hunters to recover Zero\'s parts, introducing the air dash ability.', externalLink: 'https://en.wikipedia.org/wiki/Mega_Man_X2' },
  { id: '37', title: 'Mega Man X3', reviewSnippets: [], reviewScore: 82, summary: 'The third X game features Zero as a playable character and introduces the ability to upgrade weapons and ride armor vehicles.', externalLink: 'https://en.wikipedia.org/wiki/Mega_Man_X3' },
  { id: '38', title: 'Contra III: The Alien Wars', reviewSnippets: [], reviewScore: 90, summary: 'An intense run-and-gun shooter with Bill and Lance battling aliens through explosive action sequences and memorable boss fights.', externalLink: 'https://en.wikipedia.org/wiki/Contra_III:_The_Alien_Wars' },
  { id: '39', title: 'Super Castlevania IV', reviewSnippets: [], reviewScore: 91, summary: 'Simon Belmont\'s gothic adventure features 8-directional whip control and atmospheric levels in a remake of the original Castlevania.', externalLink: 'https://en.wikipedia.org/wiki/Super_Castlevania_IV' },
  { id: '40', title: 'Castlevania: Dracula X', reviewSnippets: [], reviewScore: 76, summary: 'Richter Belmont storms Dracula\'s castle to rescue Annette, a challenging but shorter entry in the series.', externalLink: 'https://en.wikipedia.org/wiki/Castlevania:_Dracula_X' },
  { id: '41', title: 'Zombies Ate My Neighbors', reviewSnippets: [], reviewScore: 84, summary: 'A humorous top-down shooter where Zeke and Julie rescue neighbors from zombies, aliens, and horror movie monsters.', externalLink: 'https://en.wikipedia.org/wiki/Zombies_Ate_My_Neighbors' },
  { id: '42', title: 'ActRaiser', reviewSnippets: [], reviewScore: 86, summary: 'A unique blend of action platforming and city-building simulation where a god helps civilizations flourish.', externalLink: 'https://en.wikipedia.org/wiki/ActRaiser' },
  { id: '43', title: 'ActRaiser 2', reviewSnippets: [], reviewScore: 72, summary: 'The sequel focuses purely on action platforming, removing the simulation elements but adding demon-battling gameplay.', externalLink: 'https://en.wikipedia.org/wiki/ActRaiser_2' },
  { id: '44', title: 'Soul Blazer', reviewSnippets: [], reviewScore: 78, summary: 'An action RPG where players release captured souls to rebuild towns and defeat the evil Deathtoll.', externalLink: 'https://en.wikipedia.org/wiki/Soul_Blazer' },
  { id: '45', title: 'Teenage Mutant Ninja Turtles IV: Turtles in Time', reviewSnippets: [], reviewScore: 87, summary: 'A beat-\'em-up where the turtles travel through time to rescue April and defeat Shredder, featuring cooperative gameplay.', externalLink: 'https://en.wikipedia.org/wiki/Teenage_Mutant_Ninja_Turtles:_Turtles_in_Time' },
  { id: '46', title: 'The Adventures of Batman & Robin', reviewSnippets: [], reviewScore: 82, summary: 'A challenging action game based on the animated series with impressive graphics and intense shoot-\'em-up gameplay.', externalLink: 'https://en.wikipedia.org/wiki/The_Adventures_of_Batman_%26_Robin_(video_game)' },
  { id: '47', title: 'Maximum Carnage', reviewSnippets: [], reviewScore: 73, summary: 'Spider-Man and Venom team up in a beat-\'em-up to stop Carnage\'s rampage through New York City.', externalLink: 'https://en.wikipedia.org/wiki/Spider-Man_and_Venom:_Maximum_Carnage' },
  { id: '48', title: 'Sunset Riders', reviewSnippets: [], reviewScore: 81, summary: 'A wild west run-and-gun game where bounty hunters chase outlaws through action-packed side-scrolling levels.', externalLink: 'https://en.wikipedia.org/wiki/Sunset_Riders' },
  { id: '49', title: 'Wild Guns', reviewSnippets: [], reviewScore: 83, summary: 'A sci-fi western shooting gallery game mixing steampunk aesthetics with fast-paced action.', externalLink: 'https://en.wikipedia.org/wiki/Wild_Guns' },
  
  // Fighting Games
  { id: '50', title: 'Street Fighter II Turbo', reviewSnippets: [], reviewScore: 87, summary: 'The enhanced version of Street Fighter II with faster gameplay, new moves, and all characters playable.', externalLink: 'https://en.wikipedia.org/wiki/Street_Fighter_II%27_Turbo:_Hyper_Fighting' },
  { id: '51', title: 'Super Street Fighter II', reviewSnippets: [], reviewScore: 89, summary: 'Adds four new characters and refined gameplay to the legendary fighting game series.', externalLink: 'https://en.wikipedia.org/wiki/Super_Street_Fighter_II' },
  { id: '52', title: 'Mortal Kombat', reviewSnippets: [], reviewScore: 78, summary: 'The controversial fighting game featuring digitized graphics, brutal fatalities, and a tournament to save Earthrealm.', externalLink: 'https://en.wikipedia.org/wiki/Mortal_Kombat_(1992_video_game)' },
  { id: '53', title: 'Mortal Kombat II', reviewSnippets: [], reviewScore: 85, summary: 'The sequel expands the roster and gore with more fighters, fatalities, and stages in Outworld\'s tournament.', externalLink: 'https://en.wikipedia.org/wiki/Mortal_Kombat_II' },
  { id: '54', title: 'Mortal Kombat 3', reviewSnippets: [], reviewScore: 80, summary: 'Introduces the run button and kombos while Shao Kahn invades Earthrealm with new and returning fighters.', externalLink: 'https://en.wikipedia.org/wiki/Mortal_Kombat_3' },
  { id: '55', title: 'Killer Instinct', reviewSnippets: [], reviewScore: 84, summary: 'A combo-heavy fighting game featuring pre-rendered graphics, ultra combos, and announcer voice clips.', externalLink: 'https://en.wikipedia.org/wiki/Killer_Instinct_(1994_video_game)' },
  { id: '56', title: 'Street Fighter Alpha 2', reviewSnippets: [], reviewScore: 86, summary: 'A prequel to Street Fighter II with custom combos, air blocking, and alpha counters.', externalLink: 'https://en.wikipedia.org/wiki/Street_Fighter_Alpha_2' },
  { id: '57', title: 'Samurai Shodown', reviewSnippets: [], reviewScore: 83, summary: 'A weapon-based fighting game set in feudal Japan with deliberate pacing and powerful strikes.', externalLink: 'https://en.wikipedia.org/wiki/Samurai_Shodown_(1993_video_game)' },
  { id: '58', title: 'Fatal Fury', reviewSnippets: [], reviewScore: 75, summary: 'The first SNK fighting game featuring Terry Bogard battling for revenge in the King of Fighters tournament.', externalLink: 'https://en.wikipedia.org/wiki/Fatal_Fury:_King_of_Fighters' },
  { id: '59', title: 'Fatal Fury Special', reviewSnippets: [], reviewScore: 82, summary: 'An enhanced version with all characters playable, new moves, and refined gameplay mechanics.', externalLink: 'https://en.wikipedia.org/wiki/Fatal_Fury_Special' },
  
  // Racing Games
  { id: '60', title: 'Super Mario Kart', reviewSnippets: [], reviewScore: 92, summary: 'The game that defined the kart racing genre with Mario characters racing on inventive tracks using items and power-ups.', externalLink: 'https://en.wikipedia.org/wiki/Super_Mario_Kart' },
  { id: '61', title: 'F-Zero', reviewSnippets: [], reviewScore: 84, summary: 'A futuristic racer showcasing Mode 7 graphics with high-speed hovercraft racing on challenging courses.', externalLink: 'https://en.wikipedia.org/wiki/F-Zero_(video_game)' },
  { id: '62', title: 'Top Gear', reviewSnippets: [], reviewScore: 78, summary: 'A racing game featuring international tracks, split-screen multiplayer, and behind-the-car perspective.', externalLink: 'https://en.wikipedia.org/wiki/Top_Gear_(video_game)' },
  { id: '63', title: 'Rock n\' Roll Racing', reviewSnippets: [], reviewScore: 82, summary: 'An isometric racing game with vehicular combat, rock music soundtrack, and destructive weapons.', externalLink: 'https://en.wikipedia.org/wiki/Rock_n%27_Roll_Racing' },
  { id: '64', title: 'Stunt Race FX', reviewSnippets: [], reviewScore: 77, summary: 'A 3D polygon racing game using the Super FX chip for impressive visuals and stunt-based gameplay.', externalLink: 'https://en.wikipedia.org/wiki/Stunt_Race_FX' },
  
  // Sports Games
  { id: '65', title: 'NBA Jam', reviewSnippets: [], reviewScore: 87, summary: 'Over-the-top arcade basketball with two-on-two gameplay, big dunks, and memorable commentary: "He\'s on fire!"', externalLink: 'https://en.wikipedia.org/wiki/NBA_Jam' },
  { id: '66', title: 'NBA Jam Tournament Edition', reviewSnippets: [], reviewScore: 88, summary: 'Enhanced version adding more players, teams, secret characters, and gameplay modes to the arcade basketball hit.', externalLink: 'https://en.wikipedia.org/wiki/NBA_Jam#Tournament_Edition' },
  { id: '67', title: 'Ken Griffey Jr. Presents Major League Baseball', reviewSnippets: [], reviewScore: 83, summary: 'An arcade-style baseball game featuring MLB teams with accessible gameplay and the Griffey seal of approval.', externalLink: 'https://en.wikipedia.org/wiki/Ken_Griffey_Jr._Presents_Major_League_Baseball' },
  { id: '68', title: 'Madden NFL 94', reviewSnippets: [], reviewScore: 82, summary: 'John Madden\'s football sim featuring NFL teams, play calling, and authentic football action.', externalLink: 'https://en.wikipedia.org/wiki/Madden_NFL_94' },
  { id: '69', title: 'NHL 94', reviewSnippets: [], reviewScore: 88, summary: 'Considered one of the best hockey games ever, with smooth gameplay, one-timers, and all NHL teams.', externalLink: 'https://en.wikipedia.org/wiki/NHL_94' },
  { id: '70', title: 'International Superstar Soccer', reviewSnippets: [], reviewScore: 85, summary: 'A soccer game praised for its realistic gameplay, fluid animations, and strategic depth.', externalLink: 'https://en.wikipedia.org/wiki/International_Superstar_Soccer' },
  { id: '71', title: 'Super Punch-Out!!', reviewSnippets: [], reviewScore: 86, summary: 'Little Mac fights through the World Video Boxing Association with pattern-based boxing and colorful opponents.', externalLink: 'https://en.wikipedia.org/wiki/Super_Punch-Out!!' },
  
  // Puzzle & Strategy Games
  { id: '72', title: 'Tetris Attack', reviewSnippets: [], reviewScore: 86, summary: 'A panel-swapping puzzle game featuring Yoshi characters with addictive gameplay and competitive multiplayer.', externalLink: 'https://en.wikipedia.org/wiki/Tetris_Attack' },
  { id: '73', title: 'Super Bomberman', reviewSnippets: [], reviewScore: 80, summary: 'Classic bomb-laying action puzzle game with maze-like levels and chaotic multiplayer battles.', externalLink: 'https://en.wikipedia.org/wiki/Super_Bomberman_(1993_video_game)' },
  { id: '74', title: 'Super Bomberman 2', reviewSnippets: [], reviewScore: 81, summary: 'Expands the formula with new power-ups, more detailed graphics, and refined multiplayer gameplay.', externalLink: 'https://en.wikipedia.org/wiki/Super_Bomberman_2' },
  { id: '75', title: 'Lemmings', reviewSnippets: [], reviewScore: 82, summary: 'A puzzle game where players guide lemmings to safety by assigning them tasks to overcome obstacles.', externalLink: 'https://en.wikipedia.org/wiki/Lemmings_(video_game)' },
  { id: '76', title: 'SimCity', reviewSnippets: [], reviewScore: 85, summary: 'The city-building simulation where players manage zones, budgets, and infrastructure using SNES mouse support.', externalLink: 'https://en.wikipedia.org/wiki/SimCity_(1989_video_game)' },
  { id: '77', title: 'Ogre Battle: The March of the Black Queen', reviewSnippets: [], reviewScore: 84, summary: 'A tactical RPG combining real-time strategy with turn-based combat as rebels fight to liberate the kingdom.', externalLink: 'https://en.wikipedia.org/wiki/Ogre_Battle:_The_March_of_the_Black_Queen' },
  { id: '78', title: 'Final Fantasy Tactics', reviewSnippets: [], reviewScore: 83, summary: 'A tactical RPG set in Ivalice with deep job systems and political intrigue. Note: primarily a PS1 game.', externalLink: 'https://en.wikipedia.org/wiki/Final_Fantasy_Tactics' },
  { id: '79', title: 'Harvest Moon', reviewSnippets: [], reviewScore: 78, summary: 'A farming simulation where players grow crops, raise animals, and build relationships in a rural town.', externalLink: 'https://en.wikipedia.org/wiki/Harvest_Moon_(video_game)' },
  
  // Shoot 'em Ups
  { id: '80', title: 'Super R-Type', reviewSnippets: [], reviewScore: 79, summary: 'A challenging horizontal shooter with the iconic Force weapon system and biomechanical Bydo enemies.', externalLink: 'https://en.wikipedia.org/wiki/Super_R-Type' },
  { id: '81', title: 'Gradius III', reviewSnippets: [], reviewScore: 81, summary: 'The Vic Viper returns with customizable weapon configurations and intense shoot-\'em-up action.', externalLink: 'https://en.wikipedia.org/wiki/Gradius_III' },
  { id: '82', title: 'Axelay', reviewSnippets: [], reviewScore: 85, summary: 'A unique shooter alternating between vertical and horizontal perspectives with impressive Mode 7 effects.', externalLink: 'https://en.wikipedia.org/wiki/Axelay' },
  { id: '83', title: 'U.N. Squadron', reviewSnippets: [], reviewScore: 80, summary: 'A horizontal shooter based on the Area 88 manga with mercenary pilots and purchasable weapons.', externalLink: 'https://en.wikipedia.org/wiki/U.N._Squadron' },
  { id: '84', title: 'Space Megaforce', reviewSnippets: [], reviewScore: 82, summary: 'An intense vertical shooter with multiple weapon types and relentless enemy waves, known as Aleste in Japan.', externalLink: 'https://en.wikipedia.org/wiki/Super_Aleste' },
  { id: '85', title: 'Phalanx', reviewSnippets: [], reviewScore: 68, summary: 'A horizontal shooter infamous for its bizarre box art featuring a banjo player, but with solid gameplay.', externalLink: 'https://en.wikipedia.org/wiki/Phalanx_(video_game)' },
  
  // Adventure & Point-and-Click
  { id: '86', title: 'The Lost Vikings', reviewSnippets: [], reviewScore: 84, summary: 'A puzzle platformer where three Vikings with unique abilities must work together to escape alien captivity.', externalLink: 'https://en.wikipedia.org/wiki/The_Lost_Vikings' },
  { id: '87', title: 'Shadowrun', reviewSnippets: [], reviewScore: 85, summary: 'A cyberpunk action RPG blending magic and technology in a dark futuristic Seattle with investigation and combat.', externalLink: 'https://en.wikipedia.org/wiki/Shadowrun_(1993_video_game)' },
  { id: '88', title: 'Cybernator', reviewSnippets: [], reviewScore: 79, summary: 'A side-scrolling mech action game with deliberate movement and strategic weapon management.', externalLink: 'https://en.wikipedia.org/wiki/Assault_Suits_Valken' },
  { id: '89', title: 'Blackthorne', reviewSnippets: [], reviewScore: 78, summary: 'A cinematic platformer with rotoscoped animation where Kyle Blackthorne battles to reclaim his throne.', externalLink: 'https://en.wikipedia.org/wiki/Blackthorne' },
  { id: '90', title: 'Out of This World', reviewSnippets: [], reviewScore: 87, summary: 'A cinematic adventure with polygon graphics following a scientist stranded on an alien planet.', externalLink: 'https://en.wikipedia.org/wiki/Another_World_(video_game)' },
  
  // Other Notable Titles
  { id: '91', title: 'Star Fox', reviewSnippets: [], reviewScore: 88, summary: 'A 3D rail shooter using the Super FX chip where Fox McCloud\'s team defends the Lylat system.', externalLink: 'https://en.wikipedia.org/wiki/Star_Fox_(1993_video_game)' },
  { id: '92', title: 'Pilot Wings', reviewSnippets: [], reviewScore: 82, summary: 'A flight simulation game showcasing Mode 7 graphics with hang gliding, skydiving, and rocket belt challenges.', externalLink: 'https://en.wikipedia.org/wiki/Pilotwings' },
  { id: '93', title: 'Yoshi\'s Safari', reviewSnippets: [], reviewScore: 70, summary: 'A light gun game using the Super Scope where Yoshi and Mario rescue princes in a first-person shooter format.', externalLink: 'https://en.wikipedia.org/wiki/Yoshi%27s_Safari' },
  { id: '94', title: 'Super Scope 6', reviewSnippets: [], reviewScore: 72, summary: 'A collection of six games designed to showcase the Super Scope light gun peripheral.', externalLink: 'https://en.wikipedia.org/wiki/Super_Scope#Super_Scope_6' },
  { id: '95', title: 'Demon\'s Crest', reviewSnippets: [], reviewScore: 82, summary: 'A dark action platformer where the demon Firebrand collects crests to gain new powers and forms.', externalLink: 'https://en.wikipedia.org/wiki/Demon%27s_Crest' },
  { id: '96', title: 'Battletoads in Battlemaniacs', reviewSnippets: [], reviewScore: 78, summary: 'The Battletoads fight through challenging beat-\'em-up and racing stages with their signature difficulty.', externalLink: 'https://en.wikipedia.org/wiki/Battletoads_in_Battlemaniacs' },
  { id: '97', title: 'Battletoads & Double Dragon', reviewSnippets: [], reviewScore: 76, summary: 'A crossover beat-\'em-up combining two franchises as Battletoads and Double Dragon team up against the Shadow Boss.', externalLink: 'https://en.wikipedia.org/wiki/Battletoads_%26_Double_Dragon' },
  { id: '98', title: 'Teenage Mutant Ninja Turtles: Tournament Fighters', reviewSnippets: [], reviewScore: 79, summary: 'A one-on-one fighting game featuring the Turtles and allies in tournament-style combat.', externalLink: 'https://en.wikipedia.org/wiki/Teenage_Mutant_Ninja_Turtles:_Tournament_Fighters' },
  { id: '99', title: 'Super Turrican', reviewSnippets: [], reviewScore: 81, summary: 'A run-and-gun platformer with exploration elements, multiple weapons, and intense action.', externalLink: 'https://en.wikipedia.org/wiki/Super_Turrican' },
  { id: '100', title: 'Pocky & Rocky', reviewSnippets: [], reviewScore: 83, summary: 'A cute top-down shooter where a shrine maiden and tanuki battle yokai through Japanese folklore-inspired levels.', externalLink: 'https://en.wikipedia.org/wiki/Pocky_%26_Rocky' },
  { id: '101', title: 'Pocky & Rocky 2', reviewSnippets: [], reviewScore: 84, summary: 'The sequel adds new characters and refined gameplay to the charming yokai-battling shooter series.', externalLink: 'https://en.wikipedia.org/wiki/Pocky_%26_Rocky_2' },
  { id: '102', title: 'Super Ghouls \'n Ghosts', reviewSnippets: [], reviewScore: 86, summary: 'Arthur battles through punishing levels in armor that gets destroyed as he takes damage in this brutally difficult platformer.', externalLink: 'https://en.wikipedia.org/wiki/Super_Ghouls_%27n_Ghosts' },
  { id: '103', title: 'Goof Troop', reviewSnippets: [], reviewScore: 74, summary: 'Goofy and Max solve puzzles on Spoonerville Island in this cooperative action-puzzle game.', externalLink: 'https://en.wikipedia.org/wiki/Goof_Troop_(video_game)' },
  { id: '104', title: 'Super Adventure Island', reviewSnippets: [], reviewScore: 72, summary: 'Master Higgins runs and jumps through tropical islands armed with weapons to rescue his bride.', externalLink: 'https://en.wikipedia.org/wiki/Super_Adventure_Island' },
  { id: '105', title: 'Super Adventure Island II', reviewSnippets: [], reviewScore: 75, summary: 'A departure from the series with Metroidvania-style exploration and RPG elements.', externalLink: 'https://en.wikipedia.org/wiki/Super_Adventure_Island_II' },
  { id: '106', title: 'Joe & Mac', reviewSnippets: [], reviewScore: 76, summary: 'Cavemen Joe and Mac rescue women from rival cavemen in this colorful prehistoric platformer.', externalLink: 'https://en.wikipedia.org/wiki/Joe_%26_Mac' },
  { id: '107', title: 'The Jungle Book', reviewSnippets: [], reviewScore: 73, summary: 'Platform game based on Disney\'s film where Mowgli navigates the jungle with various abilities.', externalLink: 'https://en.wikipedia.org/wiki/The_Jungle_Book_(video_game)' },
  { id: '108', title: 'Toy Story', reviewSnippets: [], reviewScore: 71, summary: 'Play as Woody in this platformer following the plot of Pixar\'s groundbreaking animated film.', externalLink: 'https://en.wikipedia.org/wiki/Toy_Story_(video_game)' },
  { id: '109', title: 'Spider-Man', reviewSnippets: [], reviewScore: 74, summary: 'Spider-Man swings through New York in a side-scrolling beat-\'em-up fighting classic villains.', externalLink: 'https://en.wikipedia.org/wiki/Spider-Man_(1995_video_game)' },
  { id: '110', title: 'Spider-Man and the X-Men: Arcade\'s Revenge', reviewSnippets: [], reviewScore: 65, summary: 'Spider-Man and X-Men characters each have unique levels in Arcade\'s deadly game simulations.', externalLink: 'https://en.wikipedia.org/wiki/Spider-Man/X-Men:_Arcade%27s_Revenge' },
  { id: '111', title: 'X-Men: Mutant Apocalypse', reviewSnippets: [], reviewScore: 78, summary: 'An action platformer featuring five X-Men with unique abilities fighting through themed stages.', externalLink: 'https://en.wikipedia.org/wiki/X-Men:_Mutant_Apocalypse' },
  { id: '112', title: 'Biker Mice from Mars', reviewSnippets: [], reviewScore: 70, summary: 'Racing and combat game based on the animated series featuring motorcycle-riding mice.', externalLink: 'https://en.wikipedia.org/wiki/Biker_Mice_from_Mars_(video_game)' },
  { id: '113', title: 'Power Rangers: The Fighting Edition', reviewSnippets: [], reviewScore: 72, summary: 'A one-on-one fighting game featuring Mighty Morphin Power Rangers characters and Megazords.', externalLink: 'https://en.wikipedia.org/wiki/Mighty_Morphin_Power_Rangers:_The_Fighting_Edition' },
  { id: '114', title: 'Mighty Morphin Power Rangers', reviewSnippets: [], reviewScore: 73, summary: 'Side-scrolling beat-\'em-up with the Rangers fighting Rita Repulsa\'s monsters in two different gameplay modes.', externalLink: 'https://en.wikipedia.org/wiki/Mighty_Morphin_Power_Rangers_(video_game)' },
  { id: '115', title: 'Jurassic Park', reviewSnippets: [], reviewScore: 76, summary: 'Top-down action adventure where Alan Grant navigates Isla Nublar solving puzzles and evading dinosaurs.', externalLink: 'https://en.wikipedia.org/wiki/Jurassic_Park_(SNES_video_game)' },
  { id: '116', title: 'Jurassic Park 2: The Chaos Continues', reviewSnippets: [], reviewScore: 74, summary: 'Side-scrolling action game where commandos fight through the park to contain the dinosaur outbreak.', externalLink: 'https://en.wikipedia.org/wiki/Jurassic_Park_Part_2:_The_Chaos_Continues' },
  { id: '117', title: 'Star Wars: Super Return of the Jedi', reviewSnippets: [], reviewScore: 77, summary: 'Play through the events of Return of the Jedi in this side-scrolling action platformer.', externalLink: 'https://en.wikipedia.org/wiki/Super_Star_Wars:_Return_of_the_Jedi' },
  { id: '118', title: 'Star Wars: The Empire Strikes Back', reviewSnippets: [], reviewScore: 78, summary: 'Side-scrolling action game adapting the second Star Wars film with varied gameplay and Mode 7 effects.', externalLink: 'https://en.wikipedia.org/wiki/Super_Star_Wars:_The_Empire_Strikes_Back' },
  { id: '119', title: 'Tin Star', reviewSnippets: [], reviewScore: 71, summary: 'A light gun game using the Super Scope where a sheriff defends the Wild West town of East Driftwood.', externalLink: 'https://en.wikipedia.org/wiki/Tin_Star_(video_game)' },
  { id: '120', title: 'Rendering Ranger R2', reviewSnippets: [], reviewScore: 80, summary: 'A rare and expensive run-and-gun shooter mixing Contra-style action with Turrican elements, only released in Japan and Europe.', externalLink: 'https://en.wikipedia.org/wiki/Rendering_Ranger_R2' },
];

// --- Non-repeating game selection -------------------------------------------------
export function getSeenGameIds(): Set<string> {
  return readSet(SEEN_GAME_IDS_KEY);
}

export function rememberGame(gameId: string): Set<string> {
  return appendToSet(SEEN_GAME_IDS_KEY, [gameId], MAX_GAME_HISTORY);
}

export function resetSeenGames(): void {
  clearKey(SEEN_GAME_IDS_KEY);
}

export function selectNonRepeatingGame(games: SNESGame[]): SNESGame {
  const seen = getSeenGameIds();
  const unseen = games.filter(g => !seen.has(g.id));
  const pool = unseen.length > 0 ? unseen : games;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (!picked) {
    throw new Error('No games available');
  }
  // If we had to reuse (no unseen left), reset the history to reduce repeats next time
  if (unseen.length === 0) {
    resetSeenGames();
  }
  rememberGame(picked.id);
  return picked;
}

// --- Hint fetching/generation ------------------------------------------------------
// Wikipedia summary endpoint (no API key needed; use origin=* for CORS)
const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function fetchWikiExtract(title: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    exsentences: '40',
    format: 'json',
    origin: '*',
    titles: title,
  });
  // Ensure plain text; MediaWiki API expects `explaintext=1`
  params.append('explaintext', '1');
  try {
    const resp = await fetchImpl(`${WIKI_API}?${params.toString()}`);
    if (!resp.ok) throw new Error(`Wiki fetch failed: ${resp.status}`);
    const json = await resp.json();
    const pages = json?.query?.pages ?? {};
    const firstPageKey = Object.keys(pages)[0];
    if (!firstPageKey) return null;
    const extract = pages[firstPageKey]?.extract as string | undefined;
    if (!extract) return null;
    return extract;
  } catch (err) {
    console.warn('Failed to fetch wiki extract', err);
    return null;
  }
}

export function getUsedHintHashes(): Set<string> {
  return readSet(USED_HINTS_KEY);
}

export function rememberHints(hints: string[]): Set<string> {
  const hashes = hints.map(hashHint);
  return appendToSet(USED_HINTS_KEY, hashes, MAX_HINT_HISTORY);
}

export function resetUsedHints(): void {
  clearKey(USED_HINTS_KEY);
}

function fallbackHintsFromMock(game: SNESGame): string[] {
  // Provide a small pool of generic hints if external fetch fails; still shuffle and dedupe.
  const fallbackText = [
    `${game.title} was critically acclaimed on the SNES.`,
    `Players praised ${game.title} for its gameplay and visuals.`,
    `${game.title} introduced memorable mechanics for its genre.`,
    `${game.title} has a soundtrack fans still adore.`,
    `${game.title} features iconic bosses and levels.`,
    `${game.title} remains a fan favorite decades later.`
  ].join(' ');
  return generateHintsFromText(fallbackText, { maxHints: MAX_HINTS_PER_GAME });
}

export async function fetchHintsForGame(game: SNESGame, opts?: { fetchImpl?: typeof fetch; rng?: () => number }): Promise<string[]> {
  const { fetchImpl = fetch, rng = Math.random } = opts || {};
  const usedHashSet = getUsedHintHashes();

  // Try Wikipedia extract first
  const extract = await fetchWikiExtract(game.title, fetchImpl);
  const rawHints = extract
    ? generateHintsFromText(extract, { maxHints: MAX_HINTS_PER_GAME * 5, rng })
    : fallbackHintsFromMock(game);

  // Remove already used hints across sessions
  const filtered = filterOutUsedHints(rawHints, usedHashSet);

  if (filtered.length === 0) {
    // No new hints available for this game at the moment; let caller decide to pick a new game.
    throw new Error('No new hints available for this game');
  }

  // Shuffle again to avoid same order even if same hints remain
  const shuffled = shuffleArray(filtered, rng);
  const finalHints = shuffled.slice(0, MAX_HINTS_PER_GAME);
  rememberHints(finalHints);
  return finalHints;
}

// Fetch SNES games from a real API (if available) or return mock data as fallback
export async function fetchSNESGames(): Promise<SNESGame[]> {
  try {
    // Placeholder for a real API call (e.g., RAWG, GiantBomb). Keep mock fallback for now.
    return mockGamesData;
  } catch (error) {
    console.warn('Failed to fetch games, using mock data:', error);
    return mockGamesData;
  }
}

// Backwards-compatible function for older callers; prefer selectNonRepeatingGame
export function selectRandomGame(games: SNESGame[]): SNESGame {
  const randomIndex = Math.floor(Math.random() * games.length);
  const game = games[randomIndex];
  if (!game) {
    throw new Error('No games available');
  }
  return game;
}
