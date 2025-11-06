import { ALL, LK } from "./cities";
import { getCountries } from "./countries";

export const getCountryData = () : {
  code: string, 
  name: string, 
  cities: string[], 
}[] => {
  const countriesDetails = getCountries().map((country) => {
    return {
      code: country.countryCode,
      name: country.countryName,
      cities: getCities(country.countryCode),
    }
  });

  return countriesDetails;
}

export const getCities = (countryCode: string) : string[] => {
  switch (countryCode) {
    case "LK":
      return LK;
    
    default:
      return ALL;
  }
}
