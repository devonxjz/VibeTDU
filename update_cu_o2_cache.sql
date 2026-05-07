-- Update Cu + O2 cache to add requiredTemperatureMin
UPDATE reaction_api_cache
SET 
  normalized_result = jsonb_set(
    jsonb_set(
      normalized_result::jsonb,
      '{requiredTemperatureMin}',
      '300.0'::jsonb
    ),
    '{requiredTemperatureLabel}',
    '"300-400°C"'::jsonb
  )::text,
  required_temperature_min = 300.0,
  required_temperature_label = '300-400°C'
WHERE reaction_key = 'CU__O2';

-- Verify the update
SELECT 
  reaction_key,
  normalized_result::jsonb->>'requiredTemperatureMin' as temp_min,
  normalized_result::jsonb->>'requiredTemperatureLabel' as temp_label,
  required_temperature_min,
  required_temperature_label
FROM reaction_api_cache
WHERE reaction_key = 'CU__O2';
