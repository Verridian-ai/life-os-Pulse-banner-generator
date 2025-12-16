/**
 * Test OpenRouter model listing to find correct Gemini image model ID
 */

const API_KEY = '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';

async function testModels() {
  console.log('🔍 Fetching OpenRouter models...\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    const data = await response.json();

    // Filter for Gemini image models
    const geminiImageModels = data.data.filter(m =>
      m.id.includes('gemini') &&
      (m.id.includes('image') || m.id.includes('nano-banana'))
    );

    console.log('🎨 Gemini Image Models Found:\n');
    geminiImageModels.forEach(model => {
      console.log(`  ID: ${model.id}`);
      console.log(`  Name: ${model.name}`);
      console.log(`  Context: ${model.context_length}`);
      console.log(`  ---`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testModels();
