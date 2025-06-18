import {ApiError} from "./ApiError.js";

export const getINRtoUSDConversionRate = async () => {
  try {
    const apiKey = process.env.CURRENCY_FREAK_API_KEY;
    if (!apiKey) throw new Error("Currency API key missing in environment");

    const url = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${apiKey}&symbols=INR,USD`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch currency data: ${response.statusText}`);
    }

    const data = await response.json();

    const inr = parseFloat(data?.rates?.INR);
    const usd = parseFloat(data?.rates?.USD);

    if (isNaN(inr) || isNaN(usd)) {
      throw new Error("Invalid currency data format");
    }

    const conversionRate = usd / inr; // INR to USD
    return conversionRate;
  } catch (error) {
    console.error("Currency conversion error:", error.message);
    throw new ApiError(500, "Unable to fetch INR to USD conversion rate");
  }
};
