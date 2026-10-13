"""
Comprehensive Database of Indian Cities for CinePulse (BookMyShow / District style)
Covering all 28 States and 8 Union Territories of India.
"""

POPULAR_CITIES = [
    {"name": "Mumbai", "state": "Maharashtra", "icon": "🏛️", "landmark": "Gateway of India"},
    {"name": "Delhi-NCR", "state": "Delhi / Haryana / UP", "icon": "🇮🇳", "landmark": "India Gate"},
    {"name": "Bengaluru", "state": "Karnataka", "icon": "🌳", "landmark": "Vidhana Soudha"},
    {"name": "Hyderabad", "state": "Telangana", "icon": "🕌", "landmark": "Charminar"},
    {"name": "Ahmedabad", "state": "Gujarat", "icon": "🪁", "landmark": "Sabarmati Riverfront"},
    {"name": "Chennai", "state": "Tamil Nadu", "icon": "🛕", "landmark": "Marina Beach"},
    {"name": "Kolkata", "state": "West Bengal", "icon": "🌉", "landmark": "Howrah Bridge"},
    {"name": "Pune", "state": "Maharashtra", "icon": "🏯", "landmark": "Shaniwar Wada"},
    {"name": "Chandigarh", "state": "Punjab / Haryana", "icon": "🌹", "landmark": "Rock Garden"},
    {"name": "Kochi", "state": "Kerala", "icon": "⛵", "landmark": "Chinese Fishing Nets"},
    {"name": "Jaipur", "state": "Rajasthan", "icon": "🏰", "landmark": "Hawa Mahal"},
    {"name": "Lucknow", "state": "Uttar Pradesh", "icon": "🕌", "landmark": "Rumi Darwaza"},
    {"name": "Indore", "state": "Madhya Pradesh", "icon": "🏛️", "landmark": "Rajwada Palace"},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "icon": "🌊", "landmark": "RK Beach & Dolphin's Nose"},
    {"name": "Goa", "state": "Goa", "icon": "🌴", "landmark": "Panaji & Calangute"},
    {"name": "Surat", "state": "Gujarat", "icon": "💎", "landmark": "Diamond City"}
]

# Comprehensive master list of 160+ Indian cities across all 28 States and 8 UTs
ALL_INDIAN_CITIES = [
    # A
    {"name": "Agartala", "state": "Tripura", "tier": 2},
    {"name": "Agra", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Ahmedabad", "state": "Gujarat", "tier": 1},
    {"name": "Ahmednagar", "state": "Maharashtra", "tier": 3},
    {"name": "Aizawl", "state": "Mizoram", "tier": 2},
    {"name": "Ajmer", "state": "Rajasthan", "tier": 2},
    {"name": "Akola", "state": "Maharashtra", "tier": 3},
    {"name": "Aligarh", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Alappuzha", "state": "Kerala", "tier": 3},
    {"name": "Alwar", "state": "Rajasthan", "tier": 3},
    {"name": "Ambala", "state": "Haryana", "tier": 3},
    {"name": "Amravati", "state": "Maharashtra", "tier": 2},
    {"name": "Amritsar", "state": "Punjab", "tier": 2},
    {"name": "Anand", "state": "Gujarat", "tier": 3},
    {"name": "Anantapur", "state": "Andhra Pradesh", "tier": 3},
    {"name": "Asansol", "state": "West Bengal", "tier": 2},
    {"name": "Aurangabad (Chhatrapati Sambhaji Nagar)", "state": "Maharashtra", "tier": 2},
    {"name": "Ayodhya", "state": "Uttar Pradesh", "tier": 2},

    # B
    {"name": "Bareilly", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Bathinda", "state": "Punjab", "tier": 3},
    {"name": "Belagavi (Belgaum)", "state": "Karnataka", "tier": 2},
    {"name": "Bengaluru", "state": "Karnataka", "tier": 1},
    {"name": "Berhampur", "state": "Odisha", "tier": 3},
    {"name": "Bhagalpur", "state": "Bihar", "tier": 3},
    {"name": "Bharatpur", "state": "Rajasthan", "tier": 3},
    {"name": "Bharuch", "state": "Gujarat", "tier": 3},
    {"name": "Bhavnagar", "state": "Gujarat", "tier": 2},
    {"name": "Bhilai", "state": "Chhattisgarh", "tier": 2},
    {"name": "Bhilwara", "state": "Rajasthan", "tier": 3},
    {"name": "Bhiwandi", "state": "Maharashtra", "tier": 2},
    {"name": "Bhopal", "state": "Madhya Pradesh", "tier": 2},
    {"name": "Bhubaneswar", "state": "Odisha", "tier": 2},
    {"name": "Bikaner", "state": "Rajasthan", "tier": 2},
    {"name": "Bilaspur", "state": "Chhattisgarh", "tier": 3},
    {"name": "Bokaro Steel City", "state": "Jharkhand", "tier": 2},

    # C
    {"name": "Chandigarh", "state": "Chandigarh / Punjab / Haryana", "tier": 1},
    {"name": "Chandrapur", "state": "Maharashtra", "tier": 3},
    {"name": "Chennai", "state": "Tamil Nadu", "tier": 1},
    {"name": "Chittoor", "state": "Andhra Pradesh", "tier": 3},
    {"name": "Coimbatore", "state": "Tamil Nadu", "tier": 2},
    {"name": "Cuttack", "state": "Odisha", "tier": 2},

    # D
    {"name": "Daman", "state": "Daman and Diu", "tier": 3},
    {"name": "Darbhanga", "state": "Bihar", "tier": 3},
    {"name": "Darjeeling", "state": "West Bengal", "tier": 3},
    {"name": "Davangere", "state": "Karnataka", "tier": 3},
    {"name": "Dehradun", "state": "Uttarakhand", "tier": 2},
    {"name": "Delhi-NCR", "state": "Delhi / Haryana / UP", "tier": 1},
    {"name": "Deoghar", "state": "Jharkhand", "tier": 3},
    {"name": "Dewas", "state": "Madhya Pradesh", "tier": 3},
    {"name": "Dhanbad", "state": "Jharkhand", "tier": 2},
    {"name": "Dharwad", "state": "Karnataka", "tier": 3},
    {"name": "Dhule", "state": "Maharashtra", "tier": 3},
    {"name": "Dibrugarh", "state": "Assam", "tier": 3},
    {"name": "Dindigul", "state": "Tamil Nadu", "tier": 3},
    {"name": "Durgapur", "state": "West Bengal", "tier": 2},

    # E
    {"name": "Eluru", "state": "Andhra Pradesh", "tier": 3},
    {"name": "Erode", "state": "Tamil Nadu", "tier": 2},

    # F
    {"name": "Faridabad", "state": "Haryana", "tier": 2},
    {"name": "Firozabad", "state": "Uttar Pradesh", "tier": 3},

    # G
    {"name": "Gandhinagar", "state": "Gujarat", "tier": 2},
    {"name": "Gangtok", "state": "Sikkim", "tier": 2},
    {"name": "Gaya", "state": "Bihar", "tier": 3},
    {"name": "Ghaziabad", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Goa", "state": "Goa", "tier": 2},
    {"name": "Gorakhpur", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Gulbarga (Kalaburagi)", "state": "Karnataka", "tier": 3},
    {"name": "Guntur", "state": "Andhra Pradesh", "tier": 2},
    {"name": "Gurugram (Gurgaon)", "state": "Haryana", "tier": 1},
    {"name": "Guwahati", "state": "Assam", "tier": 2},
    {"name": "Gwalior", "state": "Madhya Pradesh", "tier": 2},

    # H
    {"name": "Haldia", "state": "West Bengal", "tier": 3},
    {"name": "Haldwani", "state": "Uttarakhand", "tier": 3},
    {"name": "Haridwar", "state": "Uttarakhand", "tier": 2},
    {"name": "Hisar", "state": "Haryana", "tier": 3},
    {"name": "Hosur", "state": "Tamil Nadu", "tier": 3},
    {"name": "Hubballi (Hubli)", "state": "Karnataka", "tier": 2},
    {"name": "Hyderabad", "state": "Telangana", "tier": 1},

    # I
    {"name": "Imphal", "state": "Manipur", "tier": 2},
    {"name": "Indore", "state": "Madhya Pradesh", "tier": 2},
    {"name": "Itanagar", "state": "Arunachal Pradesh", "tier": 2},

    # J
    {"name": "Jabalpur", "state": "Madhya Pradesh", "tier": 2},
    {"name": "Jaipur", "state": "Rajasthan", "tier": 1},
    {"name": "Jalandhar", "state": "Punjab", "tier": 2},
    {"name": "Jalgaon", "state": "Maharashtra", "tier": 3},
    {"name": "Jammu", "state": "Jammu and Kashmir", "tier": 2},
    {"name": "Jamnagar", "state": "Gujarat", "tier": 2},
    {"name": "Jamshedpur", "state": "Jharkhand", "tier": 2},
    {"name": "Jhansi", "state": "Uttar Pradesh", "tier": 3},
    {"name": "Jodhpur", "state": "Rajasthan", "tier": 2},
    {"name": "Jorhat", "state": "Assam", "tier": 3},
    {"name": "Junagadh", "state": "Gujarat", "tier": 3},

    # K
    {"name": "Kadapa", "state": "Andhra Pradesh", "tier": 3},
    {"name": "Kakinada", "state": "Andhra Pradesh", "tier": 2},
    {"name": "Kalyan-Dombivli", "state": "Maharashtra", "tier": 2},
    {"name": "Kanchipuram", "state": "Tamil Nadu", "tier": 3},
    {"name": "Kannur", "state": "Kerala", "tier": 3},
    {"name": "Kanpur", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Karimnagar", "state": "Telangana", "tier": 3},
    {"name": "Karnal", "state": "Haryana", "tier": 3},
    {"name": "Khammam", "state": "Telangana", "tier": 3},
    {"name": "Kharagpur", "state": "West Bengal", "tier": 3},
    {"name": "Kochi", "state": "Kerala", "tier": 1},
    {"name": "Kohima", "state": "Nagaland", "tier": 2},
    {"name": "Kolhapur", "state": "Maharashtra", "tier": 2},
    {"name": "Kolkata", "state": "West Bengal", "tier": 1},
    {"name": "Kollam", "state": "Kerala", "tier": 3},
    {"name": "Korba", "state": "Chhattisgarh", "tier": 3},
    {"name": "Kota", "state": "Rajasthan", "tier": 2},
    {"name": "Kottayam", "state": "Kerala", "tier": 3},
    {"name": "Kozhikode (Calicut)", "state": "Kerala", "tier": 2},
    {"name": "Kurnool", "state": "Andhra Pradesh", "tier": 2},

    # L
    {"name": "Latur", "state": "Maharashtra", "tier": 3},
    {"name": "Leh", "state": "Ladakh", "tier": 3},
    {"name": "Lucknow", "state": "Uttar Pradesh", "tier": 1},
    {"name": "Ludhiana", "state": "Punjab", "tier": 2},

    # M
    {"name": "Madurai", "state": "Tamil Nadu", "tier": 2},
    {"name": "Malappuram", "state": "Kerala", "tier": 3},
    {"name": "Malegaon", "state": "Maharashtra", "tier": 3},
    {"name": "Manali", "state": "Himachal Pradesh", "tier": 3},
    {"name": "Mangaluru (Mangalore)", "state": "Karnataka", "tier": 2},
    {"name": "Mathura", "state": "Uttar Pradesh", "tier": 3},
    {"name": "Meerut", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Mohali", "state": "Punjab", "tier": 2},
    {"name": "Moradabad", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Mumbai", "state": "Maharashtra", "tier": 1},
    {"name": "Muzaffarnagar", "state": "Uttar Pradesh", "tier": 3},
    {"name": "Muzaffarpur", "state": "Bihar", "tier": 3},
    {"name": "Mysuru (Mysore)", "state": "Karnataka", "tier": 2},

    # N
    {"name": "Nadiad", "state": "Gujarat", "tier": 3},
    {"name": "Nagercoil", "state": "Tamil Nadu", "tier": 3},
    {"name": "Nagpur", "state": "Maharashtra", "tier": 2},
    {"name": "Nainital", "state": "Uttarakhand", "tier": 3},
    {"name": "Nanded", "state": "Maharashtra", "tier": 3},
    {"name": "Nashik", "state": "Maharashtra", "tier": 2},
    {"name": "Navi Mumbai", "state": "Maharashtra", "tier": 1},
    {"name": "Nellore", "state": "Andhra Pradesh", "tier": 2},
    {"name": "New Delhi", "state": "Delhi", "tier": 1},
    {"name": "Nizamabad", "state": "Telangana", "tier": 3},
    {"name": "Noida", "state": "Uttar Pradesh", "tier": 1},

    # P
    {"name": "Palakkad", "state": "Kerala", "tier": 3},
    {"name": "Panaji", "state": "Goa", "tier": 2},
    {"name": "Panchkula", "state": "Haryana", "tier": 3},
    {"name": "Panipat", "state": "Haryana", "tier": 3},
    {"name": "Patiala", "state": "Punjab", "tier": 2},
    {"name": "Patna", "state": "Bihar", "tier": 1},
    {"name": "Pondicherry (Puducherry)", "state": "Puducherry", "tier": 2},
    {"name": "Port Blair", "state": "Andaman & Nicobar Islands", "tier": 3},
    {"name": "Prayagraj (Allahabad)", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Pune", "state": "Maharashtra", "tier": 1},
    {"name": "Puri", "state": "Odisha", "tier": 3},

    # R
    {"name": "Raipur", "state": "Chhattisgarh", "tier": 2},
    {"name": "Rajahmundry", "state": "Andhra Pradesh", "tier": 2},
    {"name": "Rajkot", "state": "Gujarat", "tier": 2},
    {"name": "Ranchi", "state": "Jharkhand", "tier": 2},
    {"name": "Ratlam", "state": "Madhya Pradesh", "tier": 3},
    {"name": "Rewa", "state": "Madhya Pradesh", "tier": 3},
    {"name": "Rishikesh", "state": "Uttarakhand", "tier": 3},
    {"name": "Rohtak", "state": "Haryana", "tier": 3},
    {"name": "Roorkee", "state": "Uttarakhand", "tier": 3},
    {"name": "Rourkela", "state": "Odisha", "tier": 2},

    # S
    {"name": "Sagar", "state": "Madhya Pradesh", "tier": 3},
    {"name": "Saharanpur", "state": "Uttar Pradesh", "tier": 3},
    {"name": "Salem", "state": "Tamil Nadu", "tier": 2},
    {"name": "Sambalpur", "state": "Odisha", "tier": 3},
    {"name": "Sangli", "state": "Maharashtra", "tier": 3},
    {"name": "Satna", "state": "Madhya Pradesh", "tier": 3},
    {"name": "Secunderabad", "state": "Telangana", "tier": 1},
    {"name": "Shillong", "state": "Meghalaya", "tier": 2},
    {"name": "Shimla", "state": "Himachal Pradesh", "tier": 2},
    {"name": "Shivamogga (Shimoga)", "state": "Karnataka", "tier": 3},
    {"name": "Silchar", "state": "Assam", "tier": 3},
    {"name": "Siliguri", "state": "West Bengal", "tier": 2},
    {"name": "Solapur", "state": "Maharashtra", "tier": 2},
    {"name": "Sonipat", "state": "Haryana", "tier": 3},
    {"name": "Srinagar", "state": "Jammu and Kashmir", "tier": 2},
    {"name": "Surat", "state": "Gujarat", "tier": 1},

    # T
    {"name": "Tezpur", "state": "Assam", "tier": 3},
    {"name": "Thane", "state": "Maharashtra", "tier": 1},
    {"name": "Thanjavur", "state": "Tamil Nadu", "tier": 3},
    {"name": "Thiruvananthapuram (Trivandrum)", "state": "Kerala", "tier": 2},
    {"name": "Thrissur", "state": "Kerala", "tier": 2},
    {"name": "Tiruchirappalli (Trichy)", "state": "Tamil Nadu", "tier": 2},
    {"name": "Tirunelveli", "state": "Tamil Nadu", "tier": 3},
    {"name": "Tirupati", "state": "Andhra Pradesh", "tier": 2},
    {"name": "Tiruppur", "state": "Tamil Nadu", "tier": 2},

    # U
    {"name": "Udaipur", "state": "Rajasthan", "tier": 2},
    {"name": "Udupi", "state": "Karnataka", "tier": 3},
    {"name": "Ujjain", "state": "Madhya Pradesh", "tier": 2},

    # V
    {"name": "Vadodara (Baroda)", "state": "Gujarat", "tier": 2},
    {"name": "Varanasi", "state": "Uttar Pradesh", "tier": 2},
    {"name": "Vasai-Virar", "state": "Maharashtra", "tier": 2},
    {"name": "Vellore", "state": "Tamil Nadu", "tier": 2},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "tier": 2},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "tier": 1},

    # W
    {"name": "Warangal", "state": "Telangana", "tier": 2}
]

# Unique city names list
ALL_CITY_NAMES = sorted(list(set([c["name"] for c in ALL_INDIAN_CITIES] + [p["name"] for p in POPULAR_CITIES])))
