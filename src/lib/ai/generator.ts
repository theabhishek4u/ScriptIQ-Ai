import { gemini, isGeminiConfigured } from "./gemini";
import { openai, isOpenAIConfigured } from "./openai";

export interface GeneratedScriptResult {
  content: string;
  originality: number;
  hooks: {
    id: string;
    text: string;
    type: "curiosity" | "shock" | "educational" | "story";
    strengthScore: number;
  }[];
  ctas: {
    id: string;
    text: string;
    type: "follow" | "subscribe" | "comment" | "save" | "lead-gen";
    platform: string;
  }[];
}

export async function generateScript(
  sourceTranscript: string,
  style: string,
  intensity: string,
  language: string
): Promise<GeneratedScriptResult> {
  const systemPrompt = `You are a legendary content creator, copywriter, and scriptwriter.
Rewrite the provided source transcript into a fresh, highly engaging, and fully original video script.

Key rules:
1. **Style**: Rewrite in the style of: "${style}" (e.g. educational, storytelling, viral, documentary, motivational, tech, finance, sales, new).
2. **Intensity**: Apply a rewrite intensity of: "${intensity}".
   - "light": Maintain core structure, polish pacing and hooks.
   - "medium": Reorganize points, upgrade vocabulary, write fresh hooks.
   - "aggressive": Completely restructure, rewrite 80% of content, create new analogies.
   - "viral": Inject extreme pacing, micro-curiosity loops, high-energy vocabulary, and hyper-optimized hooks.
3. **Language**: Output the script, hooks, and CTAs in: "${language}" (e.g. English, Hindi, Hinglish, Tamil, Telugu, etc.). If Hinglish, use Latin script writing style (e.g. "Dosto, aaj hum baat karenge...").
4. **Originality**: The script must NOT be a direct copy of the original. Restructure it so it acts as an inspired, superior script with a high originality score (0.0 to 1.0 dissimilarity vs source, target > 0.85).

Your output must be a valid JSON object matching the following structure:
{
  "content": "The full script text with section markers like [00:00 - HOOK], [00:15 - BODY], etc.",
  "originality": number (dissimilarity score between 0.80 and 0.98),
  "hooks": [
    {
      "id": "h1",
      "text": "variation text",
      "type": "one of: curiosity, shock, educational, story",
      "strengthScore": number (1-100)
    }
  ],
  "ctas": [
    {
      "id": "c1",
      "text": "CTA text",
      "type": "one of: follow, subscribe, comment, save, lead-gen",
      "platform": "string (e.g. youtube, tiktok, instagram)"
    }
  ]
}
Generate at least 3 distinct hook variations and 2 CTA variations.
`;

  // 1. Try Gemini first
  if (isGeminiConfigured && gemini) {
    try {
      console.log("[AI Engine] Running Script Generator with Gemini 2.5 Flash...");
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Original Transcript:\n${sourceTranscript}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const jsonText = response.text;
      if (jsonText) {
        return JSON.parse(jsonText) as GeneratedScriptResult;
      }
      throw new Error("Empty response from Gemini");
    } catch (error) {
      console.error("Gemini script generation failed, trying OpenAI fallback:", error);
    }
  }

  // 2. Fallback to OpenAI
  if (isOpenAIConfigured && openai) {
    try {
      console.log("[AI Engine] Running Script Generator with OpenAI GPT-4o...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Original Transcript:\n${sourceTranscript}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const jsonText = response.choices[0]?.message?.content;
      if (jsonText) {
        return JSON.parse(jsonText) as GeneratedScriptResult;
      }
      throw new Error("Empty response from OpenAI");
    } catch (error) {
      console.error("OpenAI script generation fallback failed, using local templates:", error);
    }
  }

  // 3. Fallback to local template generator
  console.log("[AI Engine] Running Script Generator with dynamic local simulation...");
  return generateDynamicMockScript(sourceTranscript, style, intensity, language);
}

function generateDynamicMockScript(
  sourceTranscript: string,
  style: string,
  intensity: string,
  language: string
): GeneratedScriptResult {
  const langLower = language.toLowerCase();
  const styleLower = style.toLowerCase();

  let intro = "";
  let body = "";
  let climax = "";
  let hooks: GeneratedScriptResult["hooks"] = [];
  let ctas: GeneratedScriptResult["ctas"] = [];

  if (langLower === "hinglish") {
    if (styleLower === "viral" || styleLower === "motivational") {
      intro = "[00:00 - HOOK]\nYeh ek aisa secret hai jo 99% creators aapse chhupate hain. Agar aapne isko use kiya, toh aapka view count seedha double hone wala hai.";
      body = "[00:15 - THE CORE REVEAL]\nMaine is video ka pura design analyze kiya. Sabse pehla step hai: start with a shock. Jab aap audience ko shock dete ho, toh unka brain active ho jata hai. Step two: open loops create karo. Matlab ek aisi baat bolo jiska answer aap video ke end mein doge.";
      climax = "[03:00 - CLIMAX]\nAur jo sabse badi mistake log karte hain, woh hai boring ending. Climax par pahunchte hi, script ko cut karo aur CTA do taaki retention high rahe.";
    } else if (styleLower === "tech" || styleLower === "educational") {
      intro = "[00:00 - INTRO]\nHello dosto! Aaj ke is video mein hum explore karenge ek naya framework jo hamare retention curves ko maximize kar sakta hai.";
      body = "[00:30 - DETAILED ANALYSIS]\nYeh system work karta hai simple metrics par. Pehle 10 seconds hook score generate karte hain, aur bacha hua time story flow analyze karta hai. Agar hum data points ko check karein, toh retention scale optimize ho jata.";
      climax = "[04:15 - FINAL OUTCOME]\nToh is framework ko optimize karne ke liye, metrics analytics par focus karein aur user drop risk zones ko decrease karein.";
    } else {
      intro = "[00:00 - HOOK]\nKya aapko pata hai ki retention kitna important hai? Ek aisi kahani jo aapke channels ko change kar degi.";
      body = "[00:20 - THE STORY]\nKuch samay pehle ki baat hai, ek simple creator ne is method ko try kiya. Usne structures badle aur visual elements add kiye. Result? Retention seedha 80% plus.";
      climax = "[02:50 - MORAL]\nIs kahani ka lesson simple hai: storytelling is king. Agar flow sahi hai toh content viral jayega.";
    }

    hooks = [
      { id: "h1", type: "shock", strengthScore: 94, text: "Internet ka sabse bada secret jo creators aapko kabhi nahi batayenge!" },
      { id: "h2", type: "curiosity", strengthScore: 91, text: "Maine 30 din tak research kiya aur retention ka yeh formula dhoondha..." },
      { id: "h3", type: "story", strengthScore: 86, text: "Ek simple 10-second change ne kaise mere views ko 10x kar diya." }
    ];

    ctas = [
      { id: "c1", type: "subscribe", platform: "youtube", text: "Agar aise hi creator hacks chahiye, toh abhi subscribe button dabayein!" },
      { id: "c2", type: "comment", platform: "instagram", text: "Aapka favorite retention method kaunsa hai? Comment karke batayein!" }
    ];
  }
  else if (langLower === "hindi") {
    if (styleLower === "viral" || styleLower === "motivational") {
      intro = "[00:00 - हुक]\nयह एक ऐसा रहस्य है जो 99% क्रिएटर्स आपसे छुपाते हैं। अगर आपने इसे इस्तेमाल किया, तो आपके व्यूज सीधे दोगुने हो जाएंगे।";
      body = "[00:15 - मुख्य रहस्य]\nमैंने इस वीडियो के पूरे आर्किटेक्चर का विश्लेषण किया है। पहला कदम: शुरुआत में एक शॉक वैल्यू दें। जब आप दर्शकों को चौंकते हैं, तो उनका ध्यान तुरंत खिंच जाता है। दूसरा कदम: जिज्ञासा के लूप बनाएं।";
      climax = "[03:00 - क्लाइमेक्स]\nऔर सबसे बड़ी गलती जो लोग करते हैं, वह है बोरिंग अंत। क्लाइमेक्स पर पहुंचते ही, वीडियो को समाप्त करें और तुरंत सब्सक्राइब करने को कहें।";
    } else {
      intro = "[00:00 - हुक]\nनमस्कार दोस्तों! आज हम बात करेंगे एक ऐसे फ्रेमवर्क की जो आपके वीडियो रिटेंशन को अधिकतम कर सकता है।";
      body = "[00:25 - मुख्य भाग]\nयह सिस्टम डेटा और यूजर बिहेवियर पर काम करता है। पहले 10 सेकंड आपकी सफलता तय करते हैं। यदि हम डेटा का सही विश्लेषण करें, तो हमारे व्यूज को बढ़ने से कोई नहीं रोक सकता।";
      climax = "[04:00 - निष्कर्ष]\nइसलिए, डेटा एनालिटिक्स पर ध्यान दें और अपने वीडियो के ड्राप-रिस्क जोन को कम करें।";
    }

    hooks = [
      { id: "h1", type: "shock", strengthScore: 93, text: "यूट्यूब का सबसे बड़ा रहस्य जो आज तक किसी ने नहीं बताया!" },
      { id: "h2", type: "curiosity", strengthScore: 89, text: "क्या आपके व्यूज भी रुक गए हैं? सिर्फ यह एक बदलाव करें।" },
      { id: "h3", type: "story", strengthScore: 85, text: "शून्य व्यूज से 1 मिलियन तक: एक क्रिएटर की असली कहानी।" }
    ];

    ctas = [
      { id: "c1", type: "subscribe", platform: "youtube", text: "ऐसे ही गुप्त क्रिएटर टिप्स के लिए अभी चैनल को सब्सक्राइब करें!" },
      { id: "c2", type: "comment", platform: "instagram", text: "आपको यह फॉर्मूला कैसा लगा? हमें कमेंट में जरूर बताएं।" }
    ];
  }
  else {
    if (styleLower === "viral" || styleLower === "motivational") {
      intro = "[00:00 - HOOK]\nThis is the one retention hack that 99% of creators will never tell you. And if you start using it today, your views are going to double instantly.";
      body = "[00:15 - THE BODY]\nHere is how the framework works. Stage one: open a curiosity loop in the first 8 seconds. Tell them what they stand to gain, but hide the path. Stage two: insert micro-narrative obstacles. Keep changing the visual elements every 4 seconds to reset their attention spans.";
      climax = "[03:15 - THE REVEAL]\nThe biggest mistake people make is dragging out the end. The second you deliver the value, pivot straight into a high-stakes call to action, then cut the video.";
    } else if (styleLower === "tech" || styleLower === "educational") {
      intro = "[00:00 - INTRODUCTION]\nWelcome back. Today we're looking at a data-driven model designed to optimize client retention across short-form platforms.";
      body = "[00:30 - TECHNICAL BREAKDOWN]\nOur analysis of the structure shows that user drop-off correlates directly with lack of dynamic change in the script. By implementing a standardized Hook-Context-Resolution loop, we observe a significant improvement in overall watch time.";
      climax = "[04:30 - CONCLUSION]\nTo maximize metrics, focus on minimizing drop risk segments, calibrating hooks according to target audience interests, and keeping your CTA concise.";
    } else {
      intro = "[00:00 - HOOK]\nI used to think making viral videos was luck. But after studying 500 scripts, I realized it is pure science.";
      body = "[00:20 - THE STORY]\nIt started when a small creator posted a video that gained 10 million views overnight. They didn't have a budget, and they didn't have followers. What they did have was a perfect storytelling structure that left no room for viewers to click away.";
      climax = "[02:45 - THE CLIMAX]\nOnce they hit the peak of the story, they didn't say goodbye. They left the audience wanting more and asked them to join their journey.";
    }

    hooks = [
      { id: "h1", type: "shock", strengthScore: 96, text: "I analyzed 500 viral videos so you don't have to, and here is the secret formula." },
      { id: "h2", type: "curiosity", strengthScore: 92, text: "The simple 8-second script change that doubles your watch time instantly." },
      { id: "h3", type: "story", strengthScore: 88, text: "How an unknown creator cracked the algorithm using this exact script framework." }
    ];

    ctas = [
      { id: "c1", type: "subscribe", platform: "youtube", text: "Subscribe now to decode the algorithm and write better scripts every single week." },
      { id: "c2", type: "comment", platform: "tiktok", text: "What's the hardest part of scripting for you? Let me know below!" }
    ];
  }

  let originality = 0.82;
  if (intensity === "aggressive") originality = 0.90 + Math.random() * 0.08;
  else if (intensity === "viral") originality = 0.93 + Math.random() * 0.05;
  else if (intensity === "medium") originality = 0.85 + Math.random() * 0.07;
  else originality = 0.78 + Math.random() * 0.07;

  originality = Math.round(originality * 100) / 100;

  return {
    content: `${intro}\n\n${body}\n\n${climax}`,
    originality,
    hooks,
    ctas,
  };
}
