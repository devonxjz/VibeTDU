-- Check if Cu + O2 cache has requiredTemperatureMin
SELECT 
  reaction_key,
  normalized_result::jsonb->>'requiredTemperatureMin' as temp_min,
  normalized_result::jsonb->>'requiredTemperatureLabel' as temp_label,
  required_temperature_min,
  required_temperature_label,
  normalized_result
FROM reaction_api_cache
WHERE reaction_key = 'CU__O2';
