import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

console.log('🚀 Starting Content Studio Feature Tests\n');
console.log('═'.repeat(60));

const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (details) console.log(`   ${details}`);
    
    testResults.tests.push({ name, passed, details });
    if (passed) testResults.passed++;
    else testResults.failed++;
}

async function testTextAnalysis() {
    console.log('\n📝 Testing Text Analysis Feature');
    console.log('─'.repeat(60));
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            interestingFacts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['summary', 'keyInsights', 'interestingFacts']
    };

    const testText = 'Artificial Intelligence is transforming the way we work. Machine learning models can now process vast amounts of data in seconds, helping businesses make better decisions.';
    const tone = 'Professional';
    const style = 'LinkedIn';

    const prompt = `
You are an expert social media content creator. Your task is to analyze the provided content and generate a structured response for a social media post based on the specified style.

**Instructions:**
1. **Style & Formatting:**
    - Your output must be a **'${style}'**.
    - The tone must be **'${tone}'**.
2. **Output:** Based on all the provided content, generate the following in the required JSON format:
    - **summary:** The main content, formatted according to the instructions above.
    - **keyInsights:** 3-5 key insights or main takeaways from the combined content.
    - **interestingFacts:** 2-3 interesting or surprising facts from across all content.

Analyze the following text:
---
${testText}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.7,
            },
        });

        const result = JSON.parse(response.text.trim());
        
        if (result.summary && result.keyInsights && result.interestingFacts) {
            logTest('Text Analysis - Structure', true, 'Response has all required fields');
            logTest('Text Analysis - Summary Generated', result.summary.length > 50, `Generated ${result.summary.length} characters`);
            logTest('Text Analysis - Key Insights', result.keyInsights.length >= 3, `Generated ${result.keyInsights.length} insights`);
            logTest('Text Analysis - Interesting Facts', result.interestingFacts.length >= 2, `Generated ${result.interestingFacts.length} facts`);
            
            console.log('\nSample Output:');
            console.log(`Summary (${result.summary.length} chars): ${result.summary.substring(0, 100)}...`);
        } else {
            logTest('Text Analysis', false, 'Missing required fields in response');
        }
    } catch (error) {
        logTest('Text Analysis', false, error.message);
    }
}

async function testHashtagGeneration() {
    console.log('\n#️⃣  Testing Hashtag Generation');
    console.log('─'.repeat(60));
    
    const hashtagsSchema = {
        type: Type.OBJECT,
        properties: {
            hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ['hashtags'],
    };

    const summary = 'AI is revolutionizing content creation';
    const keyInsights = ['AI improves efficiency', 'Content quality increases', 'Time savings significant'];
    
    const prompt = `Based on the following content, generate 3-5 highly relevant and popular social media hashtags. The hashtags should be concise, lowercase, and directly related to the main topics.
    
Content:
---
Summary: ${summary}
Key Insights: ${keyInsights.join('\n- ')}
---

Return the hashtags in the specified JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: hashtagsSchema,
                temperature: 0.5,
            },
        });

        const result = JSON.parse(response.text.trim());
        
        if (result.hashtags && Array.isArray(result.hashtags)) {
            logTest('Hashtag Generation - Structure', true, `Generated ${result.hashtags.length} hashtags`);
            const allStartWithHash = result.hashtags.every(tag => tag.startsWith('#'));
            logTest('Hashtag Generation - Format', allStartWithHash, result.hashtags.join(', '));
        } else {
            logTest('Hashtag Generation', false, 'Invalid response structure');
        }
    } catch (error) {
        logTest('Hashtag Generation', false, error.message);
    }
}

async function testTrendingTopics() {
    console.log('\n🔥 Testing Trending Topics Generation');
    console.log('─'.repeat(60));
    
    const trendingTopicsSchema = {
        type: Type.OBJECT,
        properties: {
            trends: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        title: { type: Type.STRING },
                        posts: { type: Type.STRING }
                    },
                    required: ['category', 'title', 'posts']
                }
            }
        },
        required: ['trends']
    };

    const prompt = `
Generate a list of exactly 5 current and diverse trending topics suitable for a social media "What's happening" section.
Topics should cover technology, business, AI, and marketing.
For each topic, provide a category, a concise title (often a hashtag), and a realistic, estimated number of posts.
Follow the JSON schema exactly.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: trendingTopicsSchema,
                temperature: 0.9,
            },
        });

        const result = JSON.parse(response.text.trim());
        
        if (result.trends && Array.isArray(result.trends)) {
            logTest('Trending Topics - Structure', true, `Generated ${result.trends.length} trends`);
            logTest('Trending Topics - Count', result.trends.length === 5, `Expected 5, got ${result.trends.length}`);
            
            const hasAllFields = result.trends.every(t => t.category && t.title && t.posts);
            logTest('Trending Topics - Fields', hasAllFields, 'All trends have required fields');
            
            console.log('\nSample Trends:');
            result.trends.slice(0, 2).forEach(t => {
                console.log(`   ${t.title} - ${t.category} (${t.posts})`);
            });
        } else {
            logTest('Trending Topics', false, 'Invalid response structure');
        }
    } catch (error) {
        logTest('Trending Topics', false, error.message);
    }
}

async function testDifferentStyles() {
    console.log('\n🎨 Testing Different Styles and Tones');
    console.log('─'.repeat(60));
    
    const styles = ['LinkedIn', 'Twitter', 'Thread', 'IG'];
    const tones = ['Professional', 'Casual', 'Witty'];
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            interestingFacts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['summary', 'keyInsights', 'interestingFacts']
    };
    
    for (const style of styles) {
        try {
            const tone = tones[0];
            const prompt = `Generate a ${style} post with a ${tone} tone about "The future of AI in business". Return JSON with summary, keyInsights, and interestingFacts.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                    temperature: 0.7,
                },
            });
            
            const result = JSON.parse(response.text.trim());
            logTest(`Style: ${style}`, result.summary && result.summary.length > 0, `Generated content successfully`);
        } catch (error) {
            logTest(`Style: ${style}`, false, error.message);
        }
    }
}

async function testAPIConnection() {
    console.log('\n🔌 Testing Gemini API Connection');
    console.log('─'.repeat(60));
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Say "API connection successful"',
        });
        
        const result = response.text.trim();
        logTest('API Connection', result.length > 0, 'Successfully connected to Gemini API');
    } catch (error) {
        logTest('API Connection', false, error.message);
    }
}

async function runAllTests() {
    try {
        await testAPIConnection();
        await testTextAnalysis();
        await testHashtagGeneration();
        await testTrendingTopics();
        await testDifferentStyles();
        
        console.log('\n' + '═'.repeat(60));
        console.log('📊 Test Summary');
        console.log('═'.repeat(60));
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
        
        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! The application is ready for use.');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some tests failed. Please review the errors above.');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 Fatal error during testing:', error);
        process.exit(1);
    }
}

runAllTests();
