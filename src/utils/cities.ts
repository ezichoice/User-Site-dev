// Here, add the cities list with respect to the country and make sure to add it in ALL array as well.- future purpose

// Sri Lanka
export const LK = [
  "Athurugiriya", 
  "Badulla",
  "Bentota",
  "Colombo",
  "Galle",
  "Gampaha",
  "Jaffna",
  "Kalmunai",
  "Kalutara",
  "Kandy",
  "Kesbewa",
  "Kolonnawa",
  "Kurunegala",
  "Maharagama",
  "Mannar",
  "Matara",
  "Moratuwa",
  "Mount Lavinia",
  "Negombo",
  "Puttalam",
  "Ratnapura",
  "Sri Jayewardenepura Kotte",
  "Trincomalee",
  "Weligama",
];

// Cities of all the countries
export const ALL = [...LK].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));