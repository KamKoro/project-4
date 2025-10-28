// Unit conversion utilities for recipe measurements

// Conversion factors from imperial to metric
const CONVERSIONS = {
  // Volume
  cup: { metric: 'ml', factor: 236.588 },
  tablespoon: { metric: 'ml', factor: 14.787 },
  tbsp: { metric: 'ml', factor: 14.787 },
  teaspoon: { metric: 'ml', factor: 4.929 },
  tsp: { metric: 'ml', factor: 4.929 },
  'fluid ounce': { metric: 'ml', factor: 29.574 },
  'fl oz': { metric: 'ml', factor: 29.574 },
  pint: { metric: 'ml', factor: 473.176 },
  quart: { metric: 'l', factor: 0.946 },
  gallon: { metric: 'l', factor: 3.785 },
  
  // Weight
  ounce: { metric: 'g', factor: 28.35 },
  oz: { metric: 'g', factor: 28.35 },
  pound: { metric: 'g', factor: 453.592 },
  lb: { metric: 'g', factor: 453.592 },
  lbs: { metric: 'g', factor: 453.592 },
  
  // Already metric (return as-is)
  ml: { metric: 'ml', factor: 1 },
  milliliter: { metric: 'ml', factor: 1 },
  l: { metric: 'l', factor: 1 },
  liter: { metric: 'l', factor: 1 },
  g: { metric: 'g', factor: 1 },
  gram: { metric: 'g', factor: 1 },
  kg: { metric: 'kg', factor: 1 },
  kilogram: { metric: 'kg', factor: 1 },
  
  // Count-based (no conversion)
  piece: { metric: 'piece', factor: 1 },
  pieces: { metric: 'pieces', factor: 1 },
  whole: { metric: 'whole', factor: 1 },
  pinch: { metric: 'pinch', factor: 1 },
  dash: { metric: 'dash', factor: 1 },
  to_taste: { metric: 'to taste', factor: 1 },
  'to taste': { metric: 'to taste', factor: 1 },
};

// Reverse conversions (metric to imperial)
const REVERSE_CONVERSIONS = {
  // Volume
  ml: { imperial: 'cup', factor: 0.00423 },
  l: { imperial: 'quart', factor: 1.057 },
  
  // Weight
  g: { imperial: 'oz', factor: 0.0353 },
  kg: { imperial: 'lb', factor: 2.205 },
  
  // Already imperial (return as-is)
  cup: { imperial: 'cup', factor: 1 },
  tablespoon: { imperial: 'tablespoon', factor: 1 },
  tbsp: { imperial: 'tbsp', factor: 1 },
  teaspoon: { imperial: 'teaspoon', factor: 1 },
  tsp: { imperial: 'tsp', factor: 1 },
  oz: { imperial: 'oz', factor: 1 },
  ounce: { imperial: 'ounce', factor: 1 },
  lb: { imperial: 'lb', factor: 1 },
  pound: { imperial: 'pound', factor: 1 },
  
  // Count-based (no conversion)
  piece: { imperial: 'piece', factor: 1 },
  pieces: { imperial: 'pieces', factor: 1 },
  whole: { imperial: 'whole', factor: 1 },
  pinch: { imperial: 'pinch', factor: 1 },
  dash: { imperial: 'dash', factor: 1 },
  'to taste': { imperial: 'to taste', factor: 1 },
};

/**
 * Determine if a unit is imperial
 */
export const isImperialUnit = (unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  const imperialUnits = ['cup', 'tablespoon', 'tbsp', 'teaspoon', 'tsp', 'oz', 'ounce', 'lb', 'pound', 'lbs', 'pint', 'quart', 'gallon', 'fl oz', 'fluid ounce'];
  return imperialUnits.includes(normalizedUnit);
};

/**
 * Determine if a unit is metric
 */
export const isMetricUnit = (unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  const metricUnits = ['ml', 'milliliter', 'l', 'liter', 'g', 'gram', 'kg', 'kilogram'];
  return metricUnits.includes(normalizedUnit);
};

/**
 * Format a number to a reasonable precision based on unit type
 */
const formatNumber = (num, unit = '') => {
  const normalizedUnit = unit.toLowerCase();
  
  // Special handling for count-based units
  if (['piece', 'pieces', 'pinch', 'dash', 'whole', 'slice', 'clove'].includes(normalizedUnit)) {
    return Math.round(num);
  }
  
  // For very small amounts, round to 2 decimal places
  if (num < 0.1) {
    return Math.round(num * 100) / 100;
  }
  
  // For small amounts, round to 1 decimal place
  if (num < 1) {
    return Math.round(num * 10) / 10;
  }
  
  // For medium amounts, round to 1 decimal place
  if (num < 10) {
    return Math.round(num * 10) / 10;
  }
  
  // For larger amounts, round to whole numbers
  return Math.round(num);
};

/**
 * Convert a measurement from imperial to metric
 */
export const convertToMetric = (amount, unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  
  // Count-based units should not be converted
  if (['piece', 'pieces', 'pinch', 'dash', 'whole', 'slice', 'clove', 'to taste'].includes(normalizedUnit)) {
    return { amount: Math.round(amount), unit: normalizedUnit };
  }
  
  const conversion = CONVERSIONS[normalizedUnit];
  
  if (!conversion) {
    // Unknown unit, return as-is
    return { amount: formatNumber(amount, unit), unit };
  }
  
  // If already metric or count-based, return as-is
  if (!isImperialUnit(normalizedUnit)) {
    return { amount: formatNumber(amount, unit), unit };
  }
  
  const convertedAmount = amount * conversion.factor;
  let finalAmount = formatNumber(convertedAmount, conversion.metric);
  let finalUnit = conversion.metric;
  
  // Smart unit adjustment for large values
  if (finalUnit === 'ml' && finalAmount >= 1000) {
    finalAmount = formatNumber(finalAmount / 1000, 'l');
    finalUnit = 'l';
  } else if (finalUnit === 'g' && finalAmount >= 1000) {
    finalAmount = formatNumber(finalAmount / 1000, 'kg');
    finalUnit = 'kg';
  }
  
  return { amount: finalAmount, unit: finalUnit };
};

/**
 * Convert a measurement from metric to imperial
 */
export const convertToImperial = (amount, unit) => {
  const normalizedUnit = unit.toLowerCase().trim();
  
  // Count-based units should not be converted
  if (['piece', 'pieces', 'pinch', 'dash', 'whole', 'slice', 'clove', 'to taste'].includes(normalizedUnit)) {
    return { amount: Math.round(amount), unit: normalizedUnit };
  }
  
  const conversion = REVERSE_CONVERSIONS[normalizedUnit];
  
  if (!conversion) {
    // Unknown unit, return as-is
    return { amount: formatNumber(amount, unit), unit };
  }
  
  // If already imperial or count-based, return as-is
  if (!isMetricUnit(normalizedUnit)) {
    return { amount: formatNumber(amount, unit), unit };
  }
  
  let convertedAmount = amount * conversion.factor;
  let finalUnit = conversion.imperial;
  
  // Smart unit adjustment
  if (finalUnit === 'cup' && convertedAmount < 0.25) {
    // Convert small amounts to tablespoons
    convertedAmount = convertedAmount * 16; // 1 cup = 16 tbsp
    finalUnit = 'tbsp';
    
    if (convertedAmount < 1) {
      // Convert to teaspoons if very small
      convertedAmount = convertedAmount * 3; // 1 tbsp = 3 tsp
      finalUnit = 'tsp';
    }
  } else if (finalUnit === 'oz' && convertedAmount >= 16) {
    convertedAmount = convertedAmount / 16; // 16 oz = 1 lb
    finalUnit = 'lb';
  }
  
  const finalAmount = formatNumber(convertedAmount, finalUnit);
  
  return { amount: finalAmount, unit: finalUnit };
};

/**
 * Convert ingredient based on target system
 */
export const convertIngredient = (ingredient, targetSystem) => {
  const { amount, unit } = ingredient;
  
  if (targetSystem === 'metric') {
    return convertToMetric(parseFloat(amount), unit);
  } else {
    return convertToImperial(parseFloat(amount), unit);
  }
};

/**
 * Detect the predominant measurement system used in a recipe
 */
export const detectMeasurementSystem = (ingredients) => {
  let imperialCount = 0;
  let metricCount = 0;
  
  ingredients.forEach(ing => {
    if (isImperialUnit(ing.unit)) {
      imperialCount++;
    } else if (isMetricUnit(ing.unit)) {
      metricCount++;
    }
  });
  
  return imperialCount >= metricCount ? 'imperial' : 'metric';
};

