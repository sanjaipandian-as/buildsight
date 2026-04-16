# How BuildSight Works Now 🎥🤖🔊

## The Complete Flow

### 1. **Camera Setup** 📹
- User opens a project session
- Browser requests camera permission
- Camera feed displays in real-time
- System is ready and waiting

### 2. **User Interaction** 💬
User has two ways to ask questions:

**Option A: Quick Buttons**
- Click pre-made questions like:
  - "What do you see?"
  - "Is this step correct?"
  - "What should I do next?"
  - "Did I make any mistakes?"

**Option B: Custom Question**
- Type any question in the input field
- Press Enter or click Send button
- Examples:
  - "Do I have all the components?"
  - "Is the LED connected properly?"
  - "Which wire goes where?"

### 3. **Image Capture** 📸
When user asks a question:
- System captures current camera frame (640x480 JPEG)
- Converts to base64 format
- Shows scanning animation
- Status changes to "Analysing..."

### 4. **AI Analysis** 🧠
Image + question sent to Ollama:
- **Local Processing**: Runs on your computer (localhost:11434)
- **Model**: LLaVA (vision + language model)
- **Input**: Camera image + user question + step context
- **Processing Time**: 5-15 seconds (depends on your hardware)

### 5. **AI Response** 💡
Ollama analyzes and responds:
- Describes what it sees in the camera
- Answers the specific question
- Provides guidance for next steps
- Identifies any mistakes or issues

### 6. **Voice Output** 🔊
**Automatic Speech:**
- Browser's text-to-speech reads the response
- Natural, conversational tone
- Clear pronunciation
- Adjustable speed (0.95x rate)

**User hears the AI speaking:**
> "I can see an Arduino board, a breadboard, and several jumper wires on your workspace. The LED is inserted into the breadboard with the longer leg in row 10. This looks correct for Step 2. You're ready to connect the resistor next."

### 7. **Visual Feedback** ✅
- Response text appears in the guide panel
- Confidence score displayed (e.g., "88% confidence")
- Status badge turns green
- User can read along while listening

## Example Session

**Step 1: Gather Components**

👤 **User:** *Points camera at workspace*
👤 **User:** *Clicks "What do you see?"*

🤖 **AI:** "I can see an Arduino Uno board, a breadboard, an LED, a 220-ohm resistor, and several jumper wires. All the components for Step 1 are present on your workspace. You're ready to proceed to Step 2."

---

**Step 2: Insert LED**

👤 **User:** *Inserts LED into breadboard*
👤 **User:** *Types "Is the LED in the right position?"*

🤖 **AI:** "The LED is inserted into the breadboard. I can see the longer leg is in row 10, column E, and the shorter leg is in row 9. This matches the instruction perfectly. The polarity is correct. You can move on to connecting the resistor."

---

**Step 3: Connect Resistor**

👤 **User:** *Connects resistor*
👤 **User:** *Clicks "Did I make any mistakes?"*

🤖 **AI:** "The resistor is connected from row 9 to the negative rail. However, I notice it's in column C instead of column A as specified. Please move the resistor connection to column A for proper alignment with the LED."

## Technical Architecture

```
┌─────────────────┐
│  Camera Feed    │ (Real-time video)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Question   │ (Text input or quick button)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Capture Frame   │ (640x480 JPEG → base64)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API Request     │ POST /api/ai/analyse
│                 │ {
│                 │   imageBase64: "...",
│                 │   userPrompt: "What do you see?",
│                 │   stepNumber: 1,
│                 │   projectId: "..."
│                 │ }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ollama (Local)  │ http://localhost:11434
│ Model: LLaVA    │ Vision + Language AI
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Response     │ {
│                 │   guidance: "I can see...",
│                 │   confidence: 0.88,
│                 │   provider: "ollama/llava"
│                 │ }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Text-to-Speech  │ Browser speechSynthesis API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User Hears AI   │ 🔊 Audio output
└─────────────────┘
```

## Key Features

### ✅ Real Camera Analysis
- Not mock data or pre-written responses
- Analyzes actual camera feed
- Sees what you see

### ✅ Context-Aware
- Knows current step
- Understands project context
- Provides relevant guidance

### ✅ Voice-First
- Hands-free operation
- Natural speech output
- Toggle on/off anytime

### ✅ Privacy-Focused
- All processing local (Ollama)
- Images never uploaded to cloud
- No data collection

### ✅ User-Driven
- Analysis only when requested
- No auto-interruptions
- Full control

## Requirements

### To Run:
1. ✅ Ollama installed and running
2. ✅ LLaVA model downloaded (`ollama pull llava`)
3. ✅ Camera permissions granted
4. ✅ Audio enabled in browser
5. ✅ Database connected (for session tracking)

### Recommended:
- 16GB RAM (minimum 8GB)
- Good lighting on workspace
- Stable camera position
- Chrome or Edge browser

## Troubleshooting

**No voice output?**
- Check speaker icon (top-right) is ON
- Verify system volume
- Try Chrome/Edge browser

**Slow analysis?**
- Normal for local AI (5-15 seconds)
- Use smaller model: `ollama pull llava:7b`
- Close other apps

**"Analysis failed" error?**
- Check Ollama is running: `ollama serve`
- Verify model installed: `ollama list`
- Check camera permissions

**AI gives wrong answers?**
- Improve lighting
- Focus camera clearly
- Ask more specific questions
- Show components closer

## What Makes This Special

🎯 **Real-time Vision**: AI sees what you're actually building
🗣️ **Voice Guidance**: Hands-free, spoken instructions
🏠 **Local Processing**: Private, fast, no API costs
💬 **Conversational**: Ask anything, get natural answers
🎓 **Educational**: Learn as you build

This is like having an expert looking over your shoulder, guiding you through every step! 🚀
