# Camera & AI Analysis Improvements

## What Changed

### 1. **Removed Auto-Analysis**
- **Before**: AI analyzed the camera every 5 seconds automatically with mock responses
- **After**: AI only analyzes when the user asks a question

### 2. **Added User Prompt Input**
- New text input field at the bottom of the guide panel
- Users can type questions like:
  - "What do you see?"
  - "Is this step correct?"
  - "What should I do next?"
  - "Did I connect the LED correctly?"

### 3. **Real Camera Analysis**
- Captures actual frame from the camera when user submits a question
- Sends the image to the AI API with the user's question
- AI analyzes what it actually sees in the camera feed

### 4. **Improved AI Prompts**
- AI now receives both:
  - Current step context (what the user should be doing)
  - User's specific question
- Provides more relevant, contextual guidance

### 5. **Better UX**
- Status badge shows "Ready" instead of auto-analyzing
- Press Enter to submit questions quickly
- Voice feedback still works for AI responses
- Cleaner, more intentional interaction flow

## How It Works Now

1. **User points camera at their build**
2. **User types a question** (e.g., "Is my LED connected correctly?")
3. **System captures current camera frame**
4. **AI analyzes the image** with the question context
5. **User gets specific guidance** based on what AI sees

## Technical Changes

### Frontend (`SessionClient.tsx`)
- Removed auto-analysis interval
- Added `userPrompt` state
- Added `analyseWithPrompt()` function
- Added input field with Send button
- Removed mock responses

### Backend (`/api/ai/analyse/route.ts`)
- Added `userPrompt` parameter support
- Passes user question to AI prompt builder

### AI Prompt (`lib/ai/index.ts`)
- Updated `buildPrompt()` to accept optional `userPrompt`
- Creates context-aware prompts based on user questions
- Falls back to general analysis if no prompt provided

## Benefits

✅ **More Accurate**: AI analyzes real camera feed, not mock data
✅ **User-Driven**: Analysis happens when user needs it
✅ **Context-Aware**: AI knows what user is asking about
✅ **Better Guidance**: Responses are specific to user's question
✅ **Less Noise**: No constant auto-analysis interruptions

## Next Steps

To make this fully functional, ensure:
1. ✅ Camera permissions are granted
2. ✅ AI provider is configured (Ollama or Gemini)
3. ✅ Database connection is set up
4. ✅ Environment variables are configured

## Example Usage

**User Question**: "Do I have all the components?"
**AI Response**: "I can see an Arduino board, breadboard, LED, and jumper wires on your workspace. You appear to have all the required components for Step 1. The resistor is also visible. You're ready to proceed."

**User Question**: "Is the LED in the right position?"
**AI Response**: "The LED is inserted into the breadboard, but I cannot clearly see which rows the legs are in. Make sure the longer leg (anode) is in row 10, column E and the shorter leg is in row 9. Can you adjust the camera angle slightly?"
