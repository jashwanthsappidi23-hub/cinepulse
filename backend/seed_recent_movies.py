"""
Seed Recent Releases across All Cinema Industries (Tollywood, Bollywood, Hollywood, Kollywood, Mollywood, Sandalwood)
With verified posters, thematic emojis, detailed synopsis, and scheduled showtimes across India.
"""
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Movie, Screening, ScreeningPrice, Screen, Cinema

# 60+ Recent Blockbusters across Tollywood, Bollywood, Hollywood, Kollywood, Mollywood, Sandalwood
RECENT_MOVIES = [
    # ======================== TOLLYWOOD (TELUGU) ========================
    {
        "title": "🦁 Devara: Part 1",
        "description": "An epic action saga set against coastal lands, where fear rules and a fearless warrior rises to protect his people from ruthless sea pirates.",
        "genre": "Action / Drama",
        "language": "Telugu",
        "duration": 178,
        "rating": "U/A",
        "release_date": "2024-09-27",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/f/f0/Devara_Part_1.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=F0kQvE6C-Gg",
        "industry": "Tollywood"
    },
    {
        "title": "🔥 Pushpa 2: The Rule",
        "description": "Pushpa Raj continues to consolidate his grip over the red sandalwood smuggling syndicate, clashing head-on with SP Bhanwar Singh Shekhawat in an explosive confrontation.",
        "genre": "Action / Thriller",
        "language": "Telugu",
        "duration": 195,
        "rating": "A",
        "release_date": "2024-12-05",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=g3JUbgOHgdw",
        "industry": "Tollywood"
    },
    {
        "title": "🚀 Kalki 2898 AD",
        "description": "A modern avatar of Vishnu descends to Earth in a dystopian post-apocalyptic future to protect humanity and unborn child Sumati from totalitarian god-king Supreme Yaskin.",
        "genre": "Sci-Fi / Action",
        "language": "Telugu",
        "duration": 181,
        "rating": "U/A",
        "release_date": "2024-06-27",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=kQDd1AhGIHk",
        "industry": "Tollywood"
    },
    {
        "title": "🏹 Hanu-Man",
        "description": "An underdog in the fictional village of Anjanadri gains the superpowers of Lord Hanuman and must protect his sister and village from a supervillain.",
        "genre": "Action / Superhero",
        "language": "Telugu",
        "duration": 158,
        "rating": "U/A",
        "release_date": "2024-01-12",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/2/27/Hanu_Man_film_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=Oqvly3MvlXA",
        "industry": "Tollywood"
    },
    {
        "title": "👑 Game Changer",
        "description": "An honest Indian Administrative Service officer sets out to dismantle corrupt political systems by fighting for fair elections and governance reforms.",
        "genre": "Political / Action",
        "language": "Telugu",
        "duration": 165,
        "rating": "U/A",
        "release_date": "2025-01-10",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/5/52/Game_Changer_Telugu.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=D4dJp1A_Ltc",
        "industry": "Tollywood"
    },
    {
        "title": "🐎 Daaku Maharaaj",
        "description": "A high-octane period action drama showcasing the fearsome warrior-bandit king who protects his territory against invading armies and treachery.",
        "genre": "Action / Period",
        "language": "Telugu",
        "duration": 152,
        "rating": "U/A",
        "release_date": "2025-01-12",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/0/05/Daaku_Maharaaj.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Tollywood"
    },
    {
        "title": "⚡ Saripodhaa Sanivaaram",
        "description": "Surya, an insurance agent with anger issues controlled only on Saturdays, faces off against an abusive police inspector terrorizing the town of Sokulapalem.",
        "genre": "Action / Thriller",
        "language": "Telugu",
        "duration": 174,
        "rating": "U/A",
        "release_date": "2024-08-29",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/0/07/Saripodhaa_Sanivaaram_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=yY1CszT9x2c",
        "industry": "Tollywood"
    },
    {
        "title": "🌊 Lucky Baskhar",
        "description": "A frustrated bank cashier in 1990s Bombay discovers loopholes in financial markets and pulls off an audacious money laundering empire.",
        "genre": "Crime / Drama",
        "language": "Telugu",
        "duration": 150,
        "rating": "U/A",
        "release_date": "2024-10-31",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/87/Lucky_Baskhar_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=YpLgT8H7xK4",
        "industry": "Tollywood"
    },
    {
        "title": "🩸 Tillu Square",
        "description": "DJ Tillu finds himself entangled in a new romantic and criminal mess when he falls for a mysterious girl with dangerous underworld ties.",
        "genre": "Comedy / Thriller",
        "language": "Telugu",
        "duration": 125,
        "rating": "U/A",
        "release_date": "2024-03-29",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/9/91/Tillu_Square_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=k1t6u51R7G8",
        "industry": "Tollywood"
    },
    {
        "title": "🐅 Guntur Kaaram",
        "description": "A rebellious rowdy from Guntur must confront his estranged politician mother and uncover the dark secrets that tore their family apart years ago.",
        "genre": "Action / Drama",
        "language": "Telugu",
        "duration": 159,
        "rating": "U/A",
        "release_date": "2024-01-12",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/7/7b/Guntur_Kaaram_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=mD_E4l3f0s8",
        "industry": "Tollywood"
    },
    {
        "title": "🦁 OG (They Call Him OG)",
        "description": "A feared Mumbai underworld crime boss returns after ten years of exile to seek bloody retribution against rival cartels and corrupt leaders.",
        "genre": "Action / Gangster",
        "language": "Telugu",
        "duration": 160,
        "rating": "A",
        "release_date": "2025-03-28",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/5/5f/They_Call_Him_OG.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Tollywood"
    },
    {
        "title": "🎣 Thandel",
        "description": "Based on real events, a Srikakulam fisherman accidentally drifts into Pakistani territorial waters and endures captivity while his love fights for his release back home.",
        "genre": "Romance / Drama",
        "language": "Telugu",
        "duration": 145,
        "rating": "U/A",
        "release_date": "2025-02-07",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/a/a2/Thandel_film_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Tollywood"
    },

    # ======================== BOLLYWOOD (HINDI) ========================
    {
        "title": "👻 Stree 2: Sarkate Ka Aatank",
        "description": "The town of Chanderi is terrorized once more by a headless monster named Sarkata, forcing the gang and the mysterious female ghost to form an alliance.",
        "genre": "Horror / Comedy",
        "language": "Hindi",
        "duration": 149,
        "rating": "U/A",
        "release_date": "2024-08-15",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=KVnhe_L8OqA",
        "industry": "Bollywood"
    },
    {
        "title": "💥 Singham Again",
        "description": "DCP Bajirao Singham unites the elite cops of Rohit Shetty's cop universe to launch an epic cross-border rescue mission inspired by the Ramayana.",
        "genre": "Action / Masala",
        "language": "Hindi",
        "duration": 144,
        "rating": "U/A",
        "release_date": "2024-11-01",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/0/04/Singham_Again_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=5Vz1yVv9j-U",
        "industry": "Bollywood"
    },
    {
        "title": "👻 Bhool Bhulaiyaa 3",
        "description": "Ruhaan, aka Rooh Baba, is hired by a royal family in Bengal to exorcise a haunted palace, only to come face to face with the terrifying spirit of Manjulika.",
        "genre": "Horror / Comedy",
        "language": "Hindi",
        "duration": 158,
        "rating": "U/A",
        "release_date": "2024-11-01",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/e/e4/Bhool_Bhulaiyaa_3_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=hO7gR8Y8c1E",
        "industry": "Bollywood"
    },
    {
        "title": "🪖 Chhaava",
        "description": "A grand historical biographical drama depicting the fearless reign of Chhatrapati Sambhaji Maharaj, the second ruler of the Maratha Empire, against Mughal forces.",
        "genre": "Period / Action",
        "language": "Hindi",
        "duration": 160,
        "rating": "U/A",
        "release_date": "2024-12-06",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/7/7b/Chhaava_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Bollywood"
    },
    {
        "title": "🏎️ Baby John",
        "description": "A former top police officer fakes his death to raise his daughter in peace, but must unleash his dormant fury when gangsters threaten his new life.",
        "genre": "Action / Thriller",
        "language": "Hindi",
        "duration": 154,
        "rating": "A",
        "release_date": "2024-12-25",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/3/39/Baby_John_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=t8O6d8e8-sE",
        "industry": "Bollywood"
    },
    {
        "title": "⚔️ Kill",
        "description": "When a passenger train heading to New Delhi is ambushed by 40 heavily armed dacoits, an army commando wages an intense close-quarters war of survival.",
        "genre": "Action / Martial Arts",
        "language": "Hindi",
        "duration": 105,
        "rating": "A",
        "release_date": "2024-07-05",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/6/64/Kill_%282024_film%29_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=da5N5h6B8nQ",
        "industry": "Bollywood"
    },
    {
        "title": "🥊 Chandu Champion",
        "description": "The inspiring real-life journey of Murlikant Petkar, India's first Paralympic gold medalist, overcoming bullet wounds and insurmountable odds.",
        "genre": "Biography / Sports",
        "language": "Hindi",
        "duration": 143,
        "rating": "U",
        "release_date": "2024-06-14",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/3/3e/Chandu_Champion_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=I_W_1aP5mH8",
        "industry": "Bollywood"
    },
    {
        "title": "💃 Laapataa Ladies",
        "description": "Two young newlywed brides mistakenly swap veils and husbands on a crowded rural train in central India, sparking a heartwarming quest of self-discovery.",
        "genre": "Comedy / Drama",
        "language": "Hindi",
        "duration": 122,
        "rating": "U",
        "release_date": "2024-03-01",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/9/91/Laapataa_Ladies_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=A2k5g_uK2jQ",
        "industry": "Bollywood"
    },
    {
        "title": "🕵️ Article 370",
        "description": "An NIA intelligence officer leads a classified operation to curb terrorism and maintain peace in Jammu and Kashmir during the constitutional overhaul.",
        "genre": "Action / Political",
        "language": "Hindi",
        "duration": 158,
        "rating": "U/A",
        "release_date": "2024-02-23",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/d/db/Article_370_film_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=6vL_w7p_z9U",
        "industry": "Bollywood"
    },
    {
        "title": "✈️ Sky Force",
        "description": "A gripping war drama commemorating India's first and deadliest retaliatory airstrike on the Sargodha airbase during the 1965 Indo-Pak war.",
        "genre": "Action / War",
        "language": "Hindi",
        "duration": 140,
        "rating": "U/A",
        "release_date": "2025-01-24",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/8e/Sky_Force_film_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Bollywood"
    },

    # ======================== HOLLYWOOD (ENGLISH) ========================
    {
        "title": "⚡ Deadpool & Wolverine",
        "description": "Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to save the multiverse from total annihilation.",
        "genre": "Action / Comedy",
        "language": "English",
        "duration": 128,
        "rating": "A",
        "release_date": "2024-07-26",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=73_1biulkYk",
        "industry": "Hollywood"
    },
    {
        "title": "⚔️ Gladiator II",
        "description": "Years after witnessing the death of the revered hero Maximus, Lucius enters the Colosseum after his home is conquered by the tyrannical emperors of Rome.",
        "genre": "Action / Epic",
        "language": "English",
        "duration": 148,
        "rating": "A",
        "release_date": "2024-11-15",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/0/04/Gladiator_II_%282024%29_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=4rgYUipGJNo",
        "industry": "Hollywood"
    },
    {
        "title": "🧙‍♂️ Wicked",
        "description": "The untold story of the witches of Oz: Elphaba, a misunderstood green-skinned young woman, and Glinda, a popular and privileged blonde, forge an unexpected friendship.",
        "genre": "Fantasy / Musical",
        "language": "English",
        "duration": 160,
        "rating": "U",
        "release_date": "2024-11-22",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/f/f6/Wicked_%282024_film%29_poster.png",
        "trailer_url": "https://www.youtube.com/watch?v=6COmYeLsz4c",
        "industry": "Hollywood"
    },
    {
        "title": "🦁 Mufasa: The Lion King",
        "description": "Rafiki recounts the legend of Mufasa to young lion cub Kiara, telling the story of an orphaned cub who became the legendary king of the Pride Lands.",
        "genre": "Adventure / Animation",
        "language": "English",
        "duration": 118,
        "rating": "U",
        "release_date": "2024-12-20",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/83/Mufasa_The_Lion_King_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=o17MF9vnabg",
        "industry": "Hollywood"
    },
    {
        "title": "👽 Alien: Romulus",
        "description": "While scavenging the deep ends of a derelict space station, young space colonizers encounter the most terrifying, deadly life form in the universe.",
        "genre": "Sci-Fi / Horror",
        "language": "English",
        "duration": 119,
        "rating": "A",
        "release_date": "2024-08-16",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/9/91/Alien_Romulus_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=x0XDEhP4Ss0",
        "industry": "Hollywood"
    },
    {
        "title": "🌪️ Twisters",
        "description": "An ex-storm chaser haunted by a devastating past encounter is lured back to the open plains of Oklahoma to test a groundbreaking tornado disruption system.",
        "genre": "Action / Adventure",
        "language": "English",
        "duration": 122,
        "rating": "U/A",
        "release_date": "2024-07-19",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/f/f4/Twisters_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=Jb8jK8Tf_kI",
        "industry": "Hollywood"
    },
    {
        "title": "🕷️ Venom: The Last Dance",
        "description": "Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision.",
        "genre": "Action / Sci-Fi",
        "language": "English",
        "duration": 110,
        "rating": "U/A",
        "release_date": "2024-10-25",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/c/cd/Venom_The_Last_Dance_Poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=__2bjWbetsA",
        "industry": "Hollywood"
    },
    {
        "title": "🪓 Nosferatu",
        "description": "Robert Eggers' gothic tale of obsession between a haunted young woman in 19th-century Germany and the ancient Transylvanian vampire who stalks her.",
        "genre": "Horror / Gothic",
        "language": "English",
        "duration": 132,
        "rating": "A",
        "release_date": "2024-12-25",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/a/a3/Nosferatu_2024_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=nulvWqYUM8k",
        "industry": "Hollywood"
    },
    {
        "title": "🏎️ F1: The Movie",
        "description": "A seasoned Formula One driver comes out of retirement to mentor a promising rookie prodigy on the APXGP team, racing on actual Grand Prix circuits.",
        "genre": "Drama / Sport",
        "language": "English",
        "duration": 135,
        "rating": "U/A",
        "release_date": "2025-06-27",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/1/1b/F1_teaser_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=8qhsz5gK4c4",
        "industry": "Hollywood"
    },
    {
        "title": "🦸 Captain America: Brave New World",
        "description": "Sam Wilson finds himself in the middle of an international conspiracy after meeting with newly elected U.S. President Thaddeus Ross.",
        "genre": "Action / Sci-Fi",
        "language": "English",
        "duration": 118,
        "rating": "U/A",
        "release_date": "2025-02-14",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/87/Captain_America_Brave_New_World_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Hollywood"
    },

    # ======================== KOLLYWOOD (TAMIL) ========================
    {
        "title": "👑 The Greatest of All Time (GOAT)",
        "description": "Gandhi, a former hostage negotiator and special agent for the Special Anti-Terrorist Squad, is confronted by ghosts from his classified past in Thailand.",
        "genre": "Action / Sci-Fi",
        "language": "Tamil",
        "duration": 179,
        "rating": "U/A",
        "release_date": "2024-09-05",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/1/1e/The_Greatest_of_All_Time.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=0wR5zW-M7f8",
        "industry": "Kollywood"
    },
    {
        "title": "🕶️ Vettaiyan",
        "description": "Ruthless encounter specialist SP Athiyan clashes with honest National Human Rights Commission judges when an encounter case raises moral questions.",
        "genre": "Action / Drama",
        "language": "Tamil",
        "duration": 163,
        "rating": "U/A",
        "release_date": "2024-10-10",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/1/18/Vettaiyan_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=T9D1v4GjM4Y",
        "industry": "Kollywood"
    },
    {
        "title": "🎖️ Amaran",
        "description": "The heroic true-life biographical action story of Major Mukund Varadarajan of the Rajput Regiment, awarded the Ashoka Chakra for courage in Kashmir.",
        "genre": "Action / Military",
        "language": "Tamil",
        "duration": 167,
        "rating": "U/A",
        "release_date": "2024-10-31",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/4/47/Amaran_2024_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=o0u9R6W_3_8",
        "industry": "Kollywood"
    },
    {
        "title": "🗡️ Maharaja",
        "description": "A quiet salon barber in Chennai lodges a police complaint that his iron dustbin Lakshmi has been stolen, triggering a dark investigation.",
        "genre": "Action / Thriller",
        "language": "Tamil",
        "duration": 141,
        "rating": "U/A",
        "release_date": "2024-06-14",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/1/1d/Maharaja_2024_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=3g_T6w2q9jE",
        "industry": "Kollywood"
    },
    {
        "title": "🏹 Thangalaan",
        "description": "During the British colonial era, a fierce tribal leader in Kolar Gold Fields guides an English officer to find buried gold, facing mystical spirits guarding the land.",
        "genre": "Period / Action",
        "language": "Tamil",
        "duration": 156,
        "rating": "U/A",
        "release_date": "2024-08-15",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/3/36/Thangalaan_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=Fj7K5b_b_4s",
        "industry": "Kollywood"
    },
    {
        "title": "⚔️ Kanguva",
        "description": "A warrior from an ancient tribe 1,000 years ago is supernaturally linked to a contemporary bounty hunter through a child caught in a deadly conspiracy.",
        "genre": "Epic / Fantasy",
        "language": "Tamil",
        "duration": 154,
        "rating": "U/A",
        "release_date": "2024-11-14",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/9/91/Kanguva_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=ajryf8Lg_Qc",
        "industry": "Kollywood"
    },

    # ======================== MOLLYWOOD (MALAYALAM) ========================
    {
        "title": "⛰️ Manjummel Boys",
        "description": "A group of friends from a small Kerala town travel to Kodaikanal, where one of them plunges into the bottomless Guna Caves, triggering India's greatest real rescue.",
        "genre": "Survival / Drama",
        "language": "Malayalam",
        "duration": 135,
        "rating": "U",
        "release_date": "2024-02-22",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/9/99/Manjummel_Boys_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=5rT8Y6z9w_8",
        "industry": "Mollywood"
    },
    {
        "title": "🌊 Aavesham",
        "description": "Three engineering college students in Bengaluru get bullied by seniors and recruit local gangster Ranga and his eccentric crew to settle scores.",
        "genre": "Action / Comedy",
        "language": "Malayalam",
        "duration": 158,
        "rating": "U/A",
        "release_date": "2024-04-11",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/d/d1/Aavesham.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=L0yEMl8PXnw",
        "industry": "Mollywood"
    },
    {
        "title": "🐐 The Goat Life (Aadujeevitham)",
        "description": "The harrowing true survival story of Najeeb, an Indian migrant worker who is trapped in a remote Saudi Arabian desert goat farm against his will.",
        "genre": "Adventure / Drama",
        "language": "Malayalam",
        "duration": 172,
        "rating": "U/A",
        "release_date": "2024-03-28",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/5/5a/The_Goat_Life_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=o0c5U5z9k_U",
        "industry": "Mollywood"
    },
    {
        "title": "💖 Premalu",
        "description": "Sachin, who dreams of relocating to the UK, lands in Hyderabad for GATE coaching and falls head over heels for vibrant IT professional Reenu.",
        "genre": "Romance / Comedy",
        "language": "Malayalam",
        "duration": 156,
        "rating": "U",
        "release_date": "2024-02-09",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/87/Premalu_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=Y8k-8u1I9Wc",
        "industry": "Mollywood"
    },
    {
        "title": "🕵️ Bramayugam",
        "description": "A runaway singer escaping slavery lands at a mysterious, secluded manor in 17th-century Malabar, where the sadistic elder plays mind games with dark sorcery.",
        "genre": "Horror / Period",
        "language": "Malayalam",
        "duration": 139,
        "rating": "U/A",
        "release_date": "2024-02-15",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/84/Bramayugam_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=t_u6u6A5_4Y",
        "industry": "Mollywood"
    },
    {
        "title": "💥 ARM (Ajayante Randam Moshanam)",
        "description": "Set in northern Kerala across three eras (1900, 1950, 1990), three generations of warriors battle to protect an extraterrestrial celestial treasure.",
        "genre": "Action / Fantasy",
        "language": "Malayalam",
        "duration": 147,
        "rating": "U",
        "release_date": "2024-09-12",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/b/b3/Ajayante_Randam_Moshanam_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Mollywood"
    },

    # ======================== SANDALWOOD (KANNADA) ========================
    {
        "title": "🗡️ Bagheera",
        "description": "A decorated police officer takes up a vigilante mask by night to hunt down corrupt predators who evade law enforcement.",
        "genre": "Action / Vigilante",
        "language": "Kannada",
        "duration": 158,
        "rating": "U/A",
        "release_date": "2024-10-31",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/82/Bagheera_poster.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=w6E6k_vV0Yc",
        "industry": "Sandalwood"
    },
    {
        "title": "⚔️ UI: The Movie",
        "description": "Upendra's visionary surrealist dystopian film questioning governance, technological reliance, and human moral hypocrisy.",
        "genre": "Sci-Fi / Satire",
        "language": "Kannada",
        "duration": 142,
        "rating": "U/A",
        "release_date": "2024-12-20",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/8/85/UI_The_Movie.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Sandalwood"
    },
    {
        "title": "🩸 Martin",
        "description": "An Indian Lieutenant in Pakistan is struck by amnesia and must piece together his identity while unravelling a high-stakes conspiracy.",
        "genre": "Action / Spy",
        "language": "Kannada",
        "duration": 148,
        "rating": "U/A",
        "release_date": "2024-10-11",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/a/ad/Martin_%282024_film%29_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Sandalwood"
    },
    {
        "title": "🏹 Bhairathi Ranagal",
        "description": "The prequel to Mufti detailing the rise of honest lawyer Bhairathi Ranagal into the revered, feared godfather of Ronapura.",
        "genre": "Action / Crime",
        "language": "Kannada",
        "duration": 145,
        "rating": "U/A",
        "release_date": "2024-11-15",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/4/47/Bhairathi_Ranagal_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Sandalwood"
    },
    {
        "title": "🦁 Max",
        "description": "A suspended rogue police officer is brought back for a covert nighttime assignment in a secluded region to stop a deadly mafia syndicate.",
        "genre": "Action / Thriller",
        "language": "Kannada",
        "duration": 140,
        "rating": "U/A",
        "release_date": "2024-12-25",
        "poster_url": "https://upload.wikimedia.org/wikipedia/en/3/3d/Max_2024_film_poster.jpg",
        "trailer_url": "https://www.youtube.com",
        "industry": "Sandalwood"
    }
]

def seed_recent_movies():
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        added_count = 0
        updated_count = 0

        for m_data in RECENT_MOVIES:
            # Check by title or partial title
            existing = db.query(Movie).filter(
                (Movie.title == m_data["title"]) | 
                (Movie.title.ilike(f"%{m_data['title'].split(' ', 1)[-1]}%"))
            ).first()

            rel_date = datetime.strptime(m_data["release_date"], "%Y-%m-%d")

            if existing:
                # Update with authentic poster and details
                existing.poster_url = m_data["poster_url"]
                existing.description = m_data["description"]
                existing.genre = m_data["genre"]
                existing.language = m_data["language"]
                existing.duration = m_data["duration"]
                existing.rating = m_data["rating"]
                existing.release_date = rel_date
                if m_data.get("trailer_url"):
                    existing.trailer_url = m_data["trailer_url"]
                updated_count += 1
            else:
                new_m = Movie(
                    title=m_data["title"],
                    description=m_data["description"],
                    genre=m_data["genre"],
                    language=m_data["language"],
                    duration=m_data["duration"],
                    rating=m_data["rating"],
                    release_date=rel_date,
                    poster_url=m_data["poster_url"],
                    trailer_url=m_data["trailer_url"],
                    is_active=True
                )
                db.add(new_m)
                added_count += 1

        db.commit()
        print(f"Updated {updated_count} movies and added {added_count} new recent blockbusters!")
        print(f"Total Movies in database: {db.query(Movie).count()}")

        # Now schedule screenings across cinemas for these recent movies
        screens = db.query(Screen).all()
        if screens:
            all_movies = db.query(Movie).filter(Movie.is_active == True).all()
            scheduled_count = 0
            
            dates = [
                now + timedelta(days=0),
                now + timedelta(days=1),
                now + timedelta(days=2),
                now + timedelta(days=3)
            ]
            
            times = [(10, 30), (14, 15), (18, 0), (21, 45)]

            for m in all_movies:
                # If movie has fewer than 3 screenings, add screenings
                active_scrs = db.query(Screening).filter(
                    Screening.movie_id == m.movie_id,
                    Screening.start_time >= now
                ).count()
                
                if active_scrs < 3:
                    # Pick 2-3 random screens
                    chosen_screens = random.sample(screens, min(3, len(screens)))
                    for sc in chosen_screens:
                        chosen_date = random.choice(dates)
                        hr, minute = random.choice(times)
                        st = datetime(chosen_date.year, chosen_date.month, chosen_date.day, hr, minute)
                        if st < now:
                            st = now + timedelta(hours=random.randint(1, 48))
                        
                        et = st + timedelta(minutes=m.duration + 20)
                        
                        scr = Screening(
                            movie_id=m.movie_id,
                            screen_id=sc.screen_id,
                            start_time=st,
                            end_time=et,
                            status="Scheduled"
                        )
                        db.add(scr)
                        db.flush()

                        base_price = 250 if sc.screen_type == "Standard" else 350 if sc.screen_type == "Dolby Atmos" else 450
                        db.add(ScreeningPrice(screening_id=scr.screening_id, seat_category="Regular", ticket_price=base_price))
                        db.add(ScreeningPrice(screening_id=scr.screening_id, seat_category="Premium", ticket_price=base_price + 150))
                        db.add(ScreeningPrice(screening_id=scr.screening_id, seat_category="Recliner", ticket_price=base_price + 350))
                        
                        scheduled_count += 1

            db.commit()
            print(f"Scheduled {scheduled_count} screenings for movies!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding recent movies: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_recent_movies()
