/**
 * Test OpenRouter Gemini image generation
 */

const API_KEY = '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';

async function testImageGen() {
  console.log('🎨 Testing Gemini Image Generation...\n');

  // Test with the correct model ID
  const model = 'google/gemini-3-pro-image-preview';
  console.log('Model:', model);
  console.log('Prompt: "A blue gradient background"\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://life-os-banner.verridian.ai',
        'X-Title': 'NanoBanna Pro Test',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'A professional blue gradient background'
          }
        ],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: '16:9'
        }
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('\n❌ Error Response:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    console.log('\n✅ Success!');
    console.log('Model:', data.model);
    console.log('Finish Reason:', data.choices[0]?.finish_reason);
    console.log('\nChecking for images in response...');

    // Check various possible locations for images
    const message = data.choices[0]?.message;
    console.log('Message content:', message?.content || 'empty');
    console.log('Message has reasoning:', !!message?.reasoning);
    console.log('Message has reasoning_details:', !!message?.reasoning_details);

    // Look for image data in the correct location
    if (message?.images) {
      console.log('\n🖼️ Found message.images:', Array.isArray(message.images) ? `${message.images.length} image(s)` : 'not an array');
      if (Array.isArray(message.images) && message.images.length > 0) {
        const firstImage = message.images[0];
        console.log('Image type:', typeof firstImage);
        if (typeof firstImage === 'string') {
          console.log('Image data preview:', firstImage.substring(0, 100) + '...');
          console.log('Image is base64 data URL:', firstImage.startsWith('data:image/'));
        } else if (typeof firstImage === 'object') {
          console.log('Image object keys:', Object.keys(firstImage));
          console.log('Image object:', JSON.stringify(firstImage, null, 2));
        }
      }
    } else {
      console.log('\n❌ No message.images field found');
    }

    console.log('\n📋 Message keys:', Object.keys(message));
    console.log('\n📋 Full response keys:', Object.keys(data));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testImageGen();
